package com.kalpee.service;

import com.kalpee.dto.*;
import com.kalpee.entity.*;
import com.kalpee.exception.CodeErreur;
import com.kalpee.exception.KalpeeException;
import com.kalpee.mapper.KalpeeMapper;
import com.kalpee.repository.CompteExterneRepository;
import com.kalpee.repository.TirelireRepository;
import com.kalpee.repository.UtilisateurRepository;
import com.kalpee.security.LoginAttemptService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    private final UtilisateurRepository utilisateurRepository;
    private final CompteExterneRepository compteExterneRepository;
    private final TirelireRepository tirelireRepository;
    private final PasswordEncoder passwordEncoder;
    private final LoginAttemptService loginAttemptService;
    private final KalpeeMapper mapper;

    public record OAuth2LoginResult(Utilisateur utilisateur, boolean motDePasseSupprimeParLiaison) {
    }

    public AuthService(
            UtilisateurRepository utilisateurRepository,
            CompteExterneRepository compteExterneRepository,
            TirelireRepository tirelireRepository,
            PasswordEncoder passwordEncoder,
            LoginAttemptService loginAttemptService,
            KalpeeMapper mapper
    ) {
        this.utilisateurRepository = utilisateurRepository;
        this.compteExterneRepository = compteExterneRepository;
        this.tirelireRepository = tirelireRepository;
        this.passwordEncoder = passwordEncoder;
        this.loginAttemptService = loginAttemptService;
        this.mapper = mapper;
    }

    @Transactional
    public Utilisateur inscrire(RegisterRequestDto dto) {
        String email = normalizeEmail(dto.email());
        if (utilisateurRepository.existsByEmailIgnoreCase(email)) {
            throw new KalpeeException(
                    CodeErreur.EMAIL_ALREADY_USED,
                    "Cette adresse email est déjà utilisée.",
                    Map.of("email", "Cette adresse email est déjà utilisée")
            );
        }

        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setNom(dto.nom().trim());
        utilisateur.setPrenom(dto.prenom().trim());
        utilisateur.setEmail(email);
        utilisateur.setMotDePasseHash(passwordEncoder.encode(dto.motDePasse()));

        Utilisateur saved = utilisateurRepository.save(utilisateur);

        Tirelire tirelire = new Tirelire(saved);
        tirelireRepository.save(tirelire);
        saved.setTirelire(tirelire);

        return saved;
    }

    @Transactional(readOnly = true)
    public Utilisateur authentifier(LoginRequestDto dto) {
        String email = normalizeEmail(dto.email());
        loginAttemptService.checkNotLocked(email);

        Utilisateur utilisateur = utilisateurRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> {
                    loginAttemptService.recordFailedAttempt(email);
                    return new KalpeeException(CodeErreur.UNAUTHENTICATED, "Identifiants incorrects.");
                });

        if (!utilisateur.aMotDePasse() || !passwordEncoder.matches(dto.motDePasse(), utilisateur.getMotDePasseHash())) {
            loginAttemptService.recordFailedAttempt(email);
            throw new KalpeeException(CodeErreur.UNAUTHENTICATED, "Identifiants incorrects.");
        }

        loginAttemptService.resetAttempts(email);
        return utilisateur;
    }

    @Transactional
    public OAuth2LoginResult processOAuth2Login(
            FournisseurExterne fournisseur,
            String identifiantExterne,
            String emailRaw,
            Boolean emailVerified,
            String prenomRaw,
            String nomRaw
    ) {
        if (!Boolean.TRUE.equals(emailVerified) || emailRaw == null || emailRaw.isBlank()) {
            throw new KalpeeException(
                    CodeErreur.UNAUTHENTICATED,
                    "L'adresse email du compte Google n'est pas certifiée."
            );
        }
        if (identifiantExterne == null || identifiantExterne.isBlank()) {
            throw new KalpeeException(
                    CodeErreur.UNAUTHENTICATED,
                    "Identifiant Google manquant."
            );
        }

        String email = normalizeEmail(emailRaw);

        Optional<CompteExterne> existantExterne = compteExterneRepository
                .findByFournisseurAndIdentifiantExterne(fournisseur, identifiantExterne);
        if (existantExterne.isPresent()) {
            Utilisateur u = existantExterne.get().getUtilisateur();
            return new OAuth2LoginResult(u, false);
        }

        Optional<Utilisateur> existantParEmail = utilisateurRepository.findByEmailIgnoreCase(email);
        if (existantParEmail.isPresent()) {
            Utilisateur u = existantParEmail.get();
            boolean avaitMotDePasse = u.aMotDePasse();
            if (avaitMotDePasse) {
                // D13 : Liaison automatique et suppression de l'ancien mot de passe
                u.setMotDePasseHash(null);
                u.setMotDePasseSupprimeParLiaisonGoogle(true);
            }
            utilisateurRepository.save(u);
            CompteExterne compteExterne = new CompteExterne(u, fournisseur, identifiantExterne);
            compteExterneRepository.save(compteExterne);
            return new OAuth2LoginResult(u, avaitMotDePasse);
        }

        // Création d'un nouvel utilisateur Google
        Utilisateur nouveau = new Utilisateur();
        nouveau.setPrenom(prenomRaw != null && !prenomRaw.isBlank() ? prenomRaw.trim() : "Utilisateur");
        nouveau.setNom(nomRaw != null && !nomRaw.isBlank() ? nomRaw.trim() : "Kalpee");
        nouveau.setEmail(email);
        nouveau.setMotDePasseHash(null);
        nouveau.setMotDePasseSupprimeParLiaisonGoogle(false);
        Utilisateur saved = utilisateurRepository.save(nouveau);

        Tirelire tirelire = new Tirelire(saved);
        tirelireRepository.save(tirelire);
        saved.setTirelire(tirelire);

        CompteExterne compteExterne = new CompteExterne(saved, fournisseur, identifiantExterne);
        compteExterneRepository.save(compteExterne);

        return new OAuth2LoginResult(saved, false);
    }

    @Transactional(readOnly = true)
    public UtilisateurDto getProfil(Long utilisateurId) {
        Utilisateur utilisateur = getUtilisateurOrThrow(utilisateurId);
        boolean connexionGoogle = compteExterneRepository.existsByUtilisateurIdAndFournisseur(
                utilisateurId, FournisseurExterne.GOOGLE
        );
        return mapper.toUtilisateurDto(utilisateur, connexionGoogle);
    }

    @Transactional
    public UtilisateurDto updateProfil(Long utilisateurId, UpdateProfilRequestDto dto) {
        Utilisateur utilisateur = getUtilisateurOrThrow(utilisateurId);
        String newEmail = normalizeEmail(dto.email());
        if (!utilisateur.getEmail().equalsIgnoreCase(newEmail) && utilisateurRepository.existsByEmailIgnoreCase(newEmail)) {
            throw new KalpeeException(
                    CodeErreur.EMAIL_ALREADY_USED,
                    "Cette adresse email est déjà utilisée.",
                    Map.of("email", "Cette adresse email est déjà utilisée")
            );
        }
        utilisateur.setNom(dto.nom().trim());
        utilisateur.setPrenom(dto.prenom().trim());
        utilisateur.setEmail(newEmail);
        Utilisateur saved = utilisateurRepository.save(utilisateur);
        boolean connexionGoogle = compteExterneRepository.existsByUtilisateurIdAndFournisseur(
                utilisateurId, FournisseurExterne.GOOGLE
        );
        return mapper.toUtilisateurDto(saved, connexionGoogle);
    }

    @Transactional
    public UtilisateurDto changePassword(Long utilisateurId, ChangePasswordRequestDto dto) {
        Utilisateur utilisateur = getUtilisateurOrThrow(utilisateurId);
        if (utilisateur.aMotDePasse()) {
            if (dto.motDePasseActuel() == null || dto.motDePasseActuel().isBlank()) {
                throw new KalpeeException(
                        CodeErreur.VALIDATION_ERROR,
                        "Le mot de passe actuel est obligatoire.",
                        Map.of("motDePasseActuel", "Le mot de passe actuel est obligatoire")
                );
            }
            if (!passwordEncoder.matches(dto.motDePasseActuel(), utilisateur.getMotDePasseHash())) {
                throw new KalpeeException(
                        CodeErreur.VALIDATION_ERROR,
                        "Le mot de passe actuel est incorrect.",
                        Map.of("motDePasseActuel", "Le mot de passe actuel est incorrect")
                );
            }
        }
        utilisateur.setMotDePasseHash(passwordEncoder.encode(dto.nouveauMotDePasse()));
        utilisateur.setMotDePasseSupprimeParLiaisonGoogle(false);
        Utilisateur saved = utilisateurRepository.save(utilisateur);
        boolean connexionGoogle = compteExterneRepository.existsByUtilisateurIdAndFournisseur(
                utilisateurId, FournisseurExterne.GOOGLE
        );
        return mapper.toUtilisateurDto(saved, connexionGoogle);
    }

    @Transactional(readOnly = true)
    public Utilisateur getUtilisateurOrThrow(Long utilisateurId) {
        if (utilisateurId == null) {
            throw new KalpeeException(CodeErreur.UNAUTHENTICATED, "Authentification requise.");
        }
        return utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() -> new KalpeeException(CodeErreur.UNAUTHENTICATED, "Utilisateur introuvable."));
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }
}
