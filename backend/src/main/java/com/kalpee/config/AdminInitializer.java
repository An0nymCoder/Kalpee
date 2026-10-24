package com.kalpee.config;

import com.kalpee.entity.RoleUtilisateur;
import com.kalpee.entity.Tirelire;
import com.kalpee.entity.Utilisateur;
import com.kalpee.repository.TirelireRepository;
import com.kalpee.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Component
public class AdminInitializer implements ApplicationRunner {

    private final UtilisateurRepository utilisateurRepository;
    private final TirelireRepository tirelireRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;

    public AdminInitializer(
            UtilisateurRepository utilisateurRepository,
            TirelireRepository tirelireRepository,
            PasswordEncoder passwordEncoder,
            @Value("${kalpee.admin.email:nytroxy08@gmail.com}") String adminEmail,
            @Value("${kalpee.admin.password:Bwone167907@}") String adminPassword
    ) {
        this.utilisateurRepository = utilisateurRepository;
        this.tirelireRepository = tirelireRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail.trim().toLowerCase(Locale.ROOT);
        this.adminPassword = adminPassword;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        Utilisateur admin = utilisateurRepository.findByEmailIgnoreCase(adminEmail)
                .orElseGet(() -> {
                    Utilisateur nouveau = new Utilisateur();
                    nouveau.setPrenom("Admin");
                    nouveau.setNom("Kalpee");
                    nouveau.setEmail(adminEmail);
                    return nouveau;
                });

        admin.setRole(RoleUtilisateur.ADMIN);
        if (!admin.aMotDePasse() || !passwordEncoder.matches(adminPassword, admin.getMotDePasseHash())) {
            admin.setMotDePasseHash(passwordEncoder.encode(adminPassword));
        }

        Utilisateur saved = utilisateurRepository.save(admin);
        if (tirelireRepository.findByUtilisateurId(saved.getId()).isEmpty()) {
            tirelireRepository.save(new Tirelire(saved));
        }
    }
}
