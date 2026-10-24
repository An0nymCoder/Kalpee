package com.kalpee.service;

import com.kalpee.dto.AchatDetailDto;
import com.kalpee.dto.AchatDto;
import com.kalpee.dto.AchatRequestDto;
import com.kalpee.entity.*;
import com.kalpee.exception.CodeErreur;
import com.kalpee.exception.KalpeeException;
import com.kalpee.mapper.KalpeeMapper;
import com.kalpee.repository.AchatRepository;
import com.kalpee.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
public class AchatService {

    private final AchatRepository achatRepository;
    private final TransactionRepository transactionRepository;
    private final AuthService authService;
    private final StockagePhoto stockagePhoto;
    private final KalpeeMapper mapper;

    public AchatService(
            AchatRepository achatRepository,
            TransactionRepository transactionRepository,
            AuthService authService,
            StockagePhoto stockagePhoto,
            KalpeeMapper mapper
    ) {
        this.achatRepository = achatRepository;
        this.transactionRepository = transactionRepository;
        this.authService = authService;
        this.stockagePhoto = stockagePhoto;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<AchatDto> listerAchats(Long utilisateurId, String recherche, Priorite priorite) {
        List<Achat> achats = achatRepository.findByUtilisateurIdOrderByDateCreationDesc(utilisateurId);
        String query = recherche != null ? recherche.trim().toLowerCase(Locale.ROOT) : "";

        return achats.stream()
                .filter(a -> priorite == null || a.getPriorite() == priorite)
                .filter(a -> {
                    if (query.isEmpty()) {
                        return true;
                    }
                    boolean matchNom = a.getNom() != null && a.getNom().toLowerCase(Locale.ROOT).contains(query);
                    boolean matchDesc = a.getDescription() != null && a.getDescription().toLowerCase(Locale.ROOT).contains(query);
                    return matchNom || matchDesc;
                })
                .map(mapper::toAchatDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public AchatDetailDto obtenirAchat(Long utilisateurId, Long achatId) {
        Achat achat = getAchatOrThrow(utilisateurId, achatId);
        return mapper.toAchatDetailDto(achat);
    }

    @Transactional
    public AchatDto creerAchat(Long utilisateurId, AchatRequestDto dto) {
        Utilisateur utilisateur = authService.getUtilisateurOrThrow(utilisateurId);
        Achat achat = new Achat();
        achat.setUtilisateur(utilisateur);
        achat.setNom(dto.nom().trim());
        achat.setDescription(dto.description() != null ? dto.description().trim() : null);
        achat.setPriorite(dto.priorite());
        achat.setCategorie(dto.categorie() != null ? dto.categorie() : Categorie.AUTRE);
        achat.setDateLimite(dto.dateLimite());

        Achat saved = achatRepository.save(achat);
        return mapper.toAchatDto(saved);
    }

    @Transactional
    public AchatDto modifierAchat(Long utilisateurId, Long achatId, AchatRequestDto dto) {
        Achat achat = getAchatOrThrow(utilisateurId, achatId);
        if (mapper.toAchatDto(achat).statut() == StatutAchat.TERMINE) {
            throw new KalpeeException(
                    CodeErreur.VALIDATION_ERROR,
                    "Cet achat est terminé, il ne peut plus être modifié."
            );
        }
        achat.setNom(dto.nom().trim());
        achat.setDescription(dto.description() != null ? dto.description().trim() : null);
        achat.setPriorite(dto.priorite());
        achat.setCategorie(dto.categorie() != null ? dto.categorie() : Categorie.AUTRE);
        achat.setDateLimite(dto.dateLimite());

        Achat saved = achatRepository.save(achat);
        return mapper.toAchatDto(saved);
    }

    @Transactional
    public void supprimerAchat(Long utilisateurId, Long achatId) {
        Achat achat = getAchatOrThrow(utilisateurId, achatId);
        if (achat.getArticles() != null) {
            for (Article article : achat.getArticles()) {
                if (article.getPhoto() != null) {
                    stockagePhoto.supprimer(article.getPhoto().getChemin());
                }
            }
        }
        transactionRepository.detachArticlesByAchatId(achat.getId());
        achatRepository.delete(achat);
    }

    @Transactional(readOnly = true)
    public Achat getAchatOrThrow(Long utilisateurId, Long achatId) {
        return achatRepository.findByIdAndUtilisateurId(achatId, utilisateurId)
                .orElseThrow(() -> new KalpeeException(CodeErreur.NOT_FOUND, "Achat introuvable."));
    }
}
