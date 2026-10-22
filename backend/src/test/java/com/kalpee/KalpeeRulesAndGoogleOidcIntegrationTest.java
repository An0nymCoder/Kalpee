package com.kalpee;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kalpee.dto.DepotRequestDto;
import com.kalpee.dto.RegisterRequestDto;
import com.kalpee.dto.RetraitRequestDto;
import com.kalpee.entity.Priorite;
import com.kalpee.entity.Utilisateur;
import com.kalpee.service.AuthService;
import com.kalpee.service.TirelireService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class KalpeeRulesAndGoogleOidcIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AuthService authService;

    @Autowired
    private TirelireService tirelireService;

    private Cookie registerAndGetSessionCookie(String emailPrefix) throws Exception {
        String email = emailPrefix + "-" + UUID.randomUUID() + "@kalpee.sn";
        Map<String, Object> payload = Map.of(
                "nom", "Diop",
                "prenom", "Amadou",
                "email", email,
                "motDePasse", "motdepasse123"
        );
        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isCreated())
                .andReturn();
        Cookie sessionCookie = result.getResponse().getCookie("KALPEE_SESSION");
        assertThat(sessionCookie).isNotNull();
        return sessionCookie;
    }

    @Test
    void isolationEntreUtilisateurs_ressourceAutreUtilisateurRenvoie404() throws Exception {
        Cookie cookieUserA = registerAndGetSessionCookie("usera");
        Cookie cookieUserB = registerAndGetSessionCookie("userb");

        // User A crée un achat
        String achatBody = objectMapper.writeValueAsString(Map.of(
                "nom", "Achat privé A",
                "priorite", Priorite.URGENT.name(),
                "categorie", "VETEMENTS"
        ));
        MvcResult achatRes = mockMvc.perform(post("/api/achats")
                        .cookie(cookieUserA)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(achatBody))
                .andExpect(status().isCreated())
                .andReturn();
        long achatId = objectMapper.readTree(achatRes.getResponse().getContentAsString()).get("id").asLong();

        // User B tente de lire, modifier et supprimer l'achat de User A -> 404 NOT_FOUND
        mockMvc.perform(get("/api/achats/" + achatId).cookie(cookieUserB))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("NOT_FOUND"));

        mockMvc.perform(put("/api/achats/" + achatId)
                        .cookie(cookieUserB)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(achatBody))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("NOT_FOUND"));

        mockMvc.perform(delete("/api/achats/" + achatId)
                        .cookie(cookieUserB)
                        .with(csrf()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("NOT_FOUND"));
    }

    @Test
    void reglesMetier_retraitInsuffisant_etRetraitObjectifInsuffisant() throws Exception {
        Cookie cookie = registerAndGetSessionCookie("rb-retrait");

        // Crée un objectif avec montantInitial = 10 000, cible = 100 000
        MvcResult objRes = mockMvc.perform(post("/api/objectifs")
                        .cookie(cookie)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nom", "Objectif PC",
                                "montantCible", 100000,
                                "montantInitial", 10000,
                                "dateCible", LocalDate.now().plusMonths(3).toString(),
                                "categorie", "ELECTRONIQUE"
                        ))))
                .andExpect(status().isCreated())
                .andReturn();
        long objectifId = objectMapper.readTree(objRes.getResponse().getContentAsString()).get("id").asLong();

        // Dépose 50 000 dans la tirelire (sans objectif) + 15 000 étiqueté avec l'objectif
        mockMvc.perform(post("/api/tirelire/depot")
                        .cookie(cookie)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "montant", 50000,
                                "motif", "Salaire"
                        ))))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/tirelire/depot")
                        .cookie(cookie)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "montant", 15000,
                                "motif", "Épargne PC",
                                "objectifId", objectifId
                        ))))
                .andExpect(status().isCreated());

        // Solde total = 65 000 FCFA ; Épargné sur l'objectif = 10 000 + 15 000 = 25 000 FCFA
        // RB12 : Retrait de 70 000 (> solde 65 000) -> 422 INSUFFICIENT_BALANCE
        mockMvc.perform(post("/api/tirelire/retrait")
                        .cookie(cookie)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "montant", 70000,
                                "motif", "Retrait excessif"
                        ))))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code").value("INSUFFICIENT_BALANCE"));

        // RB13 : Retrait de 30 000 étiqueté avec l'objectif (< solde 65 000 mais > épargné objectif 25 000) -> 422 OBJECTIVE_INSUFFICIENT
        mockMvc.perform(post("/api/tirelire/retrait")
                        .cookie(cookie)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "montant", 30000,
                                "motif", "Retrait sur objectif excessif",
                                "objectifId", objectifId
                        ))))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code").value("OBJECTIVE_INSUFFICIENT"));

        // Suppression de l'objectif conserve la transaction et le solde à 65 000 FCFA
        mockMvc.perform(delete("/api/objectifs/" + objectifId)
                        .cookie(cookie)
                        .with(csrf()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/tirelire").cookie(cookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.solde").value(65000));
    }

    @Test
    void retraitsSimultanes_verrouillagePessimisteInterditSoldeNegatif() throws Exception {
        String email = "concurrent-" + UUID.randomUUID() + "@kalpee.sn";
        Utilisateur user = authService.inscrire(new RegisterRequestDto("Sow", "Fatou", email, "password123"));
        Long userId = user.getId();

        tirelireService.deposer(userId, new DepotRequestDto(150000L, "Dépôt initial", null));

        int threads = 2;
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CountDownLatch ready = new CountDownLatch(threads);
        CountDownLatch start = new CountDownLatch(1);
        CountDownLatch done = new CountDownLatch(threads);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failCount = new AtomicInteger(0);

        for (int i = 0; i < threads; i++) {
            executor.submit(() -> {
                ready.countDown();
                try {
                    start.await();
                    tirelireService.retirer(userId, new RetraitRequestDto(100000L, "Retrait concurrent", null, null));
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    failCount.incrementAndGet();
                } finally {
                    done.countDown();
                }
            });
        }

        ready.await();
        start.countDown();
        done.await();
        executor.shutdown();

        assertThat(successCount.get()).isEqualTo(1);
        assertThat(failCount.get()).isEqualTo(1);
        assertThat(tirelireService.obtenirTirelire(userId).solde()).isEqualTo(50000L);
    }

    @Test
    void validationPhoto_rejetteFichierInvalide_etAcceptePngValide() throws Exception {
        Cookie cookie = registerAndGetSessionCookie("photo-user");

        MvcResult achatRes = mockMvc.perform(post("/api/achats")
                        .cookie(cookie)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nom", "Habits",
                                "priorite", "URGENT",
                                "categorie", "VETEMENTS"
                        ))))
                .andExpect(status().isCreated())
                .andReturn();
        long achatId = objectMapper.readTree(achatRes.getResponse().getContentAsString()).get("id").asLong();

        MvcResult artRes = mockMvc.perform(post("/api/achats/" + achatId + "/articles")
                        .cookie(cookie)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nom", "Jean noir",
                                "quantite", 1,
                                "prixUnitaire", 15000
                        ))))
                .andExpect(status().isCreated())
                .andReturn();
        long articleId = objectMapper.readTree(artRes.getResponse().getContentAsString()).get("id").asLong();

        // Fichier texte déguisé en .jpg -> rejeté 400 VALIDATION_ERROR
        MockMultipartFile fauxJpg = new MockMultipartFile(
                "file", "malware.jpg", "image/jpeg", "Ceci n'est pas une image JPEG".getBytes()
        );
        mockMvc.perform(multipart("/api/articles/" + articleId + "/photo")
                        .file(fauxJpg)
                        .cookie(cookie)
                        .with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));

        // Vrai en-tête PNG -> accepté 200 OK
        byte[] validPng = new byte[]{
                (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
                0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52
        };
        MockMultipartFile vraiPng = new MockMultipartFile(
                "file", "jean.png", "image/png", validPng
        );
        mockMvc.perform(multipart("/api/articles/" + articleId + "/photo")
                        .file(vraiPng)
                        .cookie(cookie)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.aPhoto").value(true));
    }

    @Test
    void connexionGoogleOidc_creation_reconnexion_liaisonSuppressionMotDePasse_emailNonCertifie_etDefinitionMotDePasse() throws Exception {
        // 1. Création d'un nouvel utilisateur via Google OIDC
        String googleEmail = "google-" + UUID.randomUUID() + "@gmail.com";
        String googleSub = "google-sub-" + UUID.randomUUID();

        MvcResult createRes = mockMvc.perform(get("/api/auth/me")
                        .with(oidcLogin().idToken(token -> token
                                .claim("sub", googleSub)
                                .claim("email", googleEmail)
                                .claim("email_verified", true)
                                .claim("given_name", "Moussa")
                                .claim("family_name", "Ndiaye"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(googleEmail))
                .andExpect(jsonPath("$.prenom").value("Moussa"))
                .andExpect(jsonPath("$.aMotDePasse").value(false))
                .andExpect(jsonPath("$.connexionGoogle").value(true))
                .andReturn();

        Cookie googleSessionCookie = createRes.getResponse().getCookie("KALPEE_SESSION");
        assertThat(googleSessionCookie).isNotNull();

        // 2. Reconnexion du même utilisateur Google
        mockMvc.perform(get("/api/auth/me")
                        .with(oidcLogin().idToken(token -> token
                                .claim("sub", googleSub)
                                .claim("email", googleEmail)
                                .claim("email_verified", true))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(googleEmail));

        // 3. Définition d'un mot de passe sur un compte Google sans mot de passe actuel
        mockMvc.perform(put("/api/profil/mot-de-passe")
                        .cookie(googleSessionCookie)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nouveauMotDePasse", "nouveauPass123"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.aMotDePasse").value(true));

        // 4. Liaison automatique d'un compte classique existant avec suppression de l'ancien mot de passe (D13)
        String classicEmail = "classic-" + UUID.randomUUID() + "@gmail.com";
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nom", "Fall",
                                "prenom", "Awa",
                                "email", classicEmail,
                                "motDePasse", "ancienMotDePasse123"
                        ))))
                .andExpect(status().isCreated());

        // Connexion Google avec le même email certifié
        mockMvc.perform(get("/api/auth/me")
                        .with(oidcLogin().idToken(token -> token
                                .claim("sub", "sub-link-" + UUID.randomUUID())
                                .claim("email", classicEmail)
                                .claim("email_verified", true)
                                .claim("given_name", "Awa")
                                .claim("family_name", "Fall"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.connexionGoogle").value(true))
                .andExpect(jsonPath("$.aMotDePasse").value(false))
                .andExpect(jsonPath("$.motDePasseSupprimeParLiaisonGoogle").value(true));

        // L'ancien mot de passe ne doit plus fonctionner
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", classicEmail,
                                "motDePasse", "ancienMotDePasse123"
                        ))))
                .andExpect(status().isUnauthorized());

        // 5. Email Google non certifié (email_verified = false) refusé (RB15)
        mockMvc.perform(get("/api/auth/me")
                        .with(oidcLogin().idToken(token -> token
                                .claim("sub", "sub-unverified")
                                .claim("email", "unverified@gmail.com")
                                .claim("email_verified", false))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHENTICATED"));
    }
}
