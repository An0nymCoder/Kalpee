package com.kalpee;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test de bout en bout parcourant les 16 critères de réussite de la section 16 du cahier des charges.
 */
class KalpeeMvpEndToEndTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void parcoursCompletDes16CriteresDeReussiteDuMvp() throws Exception {
        String email = "thierno-" + UUID.randomUUID() + "@kalpee.sn";

        // 1. Créer un compte
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nom", "Ba",
                                "prenom", "Thierno",
                                "email", email,
                                "motDePasse", "kalpee2026"
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.prenom").value("Thierno"));

        // 2. Se connecter
        MvcResult loginRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", email,
                                "motDePasse", "kalpee2026"
                        ))))
                .andExpect(status().isOk())
                .andReturn();
        Cookie sessionCookie = loginRes.getResponse().getCookie("KALPEE_SESSION");
        assertThat(sessionCookie).isNotNull();

        // 3. Créer un achat & 8. Définir la priorité
        MvcResult achatRes = mockMvc.perform(post("/api/achats")
                        .cookie(sessionCookie)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nom", "Habits",
                                "description", "Vêtements pour les vacances",
                                "priorite", "URGENT",
                                "categorie", "VETEMENTS",
                                "dateLimite", LocalDate.now().plusMonths(1).toString()
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.priorite").value("URGENT"))
                .andExpect(jsonPath("$.statut").value("A_PLANIFIER"))
                .andReturn();
        long achatId = objectMapper.readTree(achatRes.getResponse().getContentAsString()).get("id").asLong();

        // 4. Ajouter plusieurs articles & 6. Définir les quantités et prix
        MvcResult art1Res = mockMvc.perform(post("/api/achats/" + achatId + "/articles")
                        .cookie(sessionCookie)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nom", "Jean noir",
                                "description", "Jean noir coupe droite",
                                "quantite", 2,
                                "prixUnitaire", 15000,
                                "magasin", "Zara"
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.total").value(30000))
                .andReturn();
        long article1Id = objectMapper.readTree(art1Res.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(post("/api/achats/" + achatId + "/articles")
                        .cookie(sessionCookie)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nom", "T-shirt",
                                "description", "T-shirt coton",
                                "quantite", 3,
                                "prixUnitaire", 5000,
                                "magasin", "H&M"
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.total").value(15000));

        // 5. Ajouter une photo à un article
        byte[] validJpeg = new byte[]{
                (byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0,
                0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01
        };
        MockMultipartFile photoFile = new MockMultipartFile("file", "jean.jpg", "image/jpeg", validJpeg);
        mockMvc.perform(multipart("/api/articles/" + article1Id + "/photo")
                        .file(photoFile)
                        .cookie(sessionCookie)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.aPhoto").value(true));

        mockMvc.perform(get("/api/articles/" + article1Id + "/photo")
                        .cookie(sessionCookie))
                .andExpect(status().isOk())
                .andExpect(content().contentType("image/jpeg"));

        // 7. Obtenir automatiquement le total de l'achat (30 000 + 15 000 = 45 000 FCFA)
        mockMvc.perform(get("/api/achats/" + achatId).cookie(sessionCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(45000))
                .andExpect(jsonPath("$.statut").value("EN_COURS"));

        // 9. Marquer un article comme acheté & vérifier la suggestion de retrait (D3)
        mockMvc.perform(patch("/api/articles/" + article1Id + "/statut")
                        .cookie(sessionCookie)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("statut", "ACHETE"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.article.statut").value("ACHETE"))
                .andExpect(jsonPath("$.retraitSuggere.montant").value(30000))
                .andExpect(jsonPath("$.retraitSuggere.articleId").value(article1Id));

        // 10. Consulter la progression de l'achat (30 000 / 45 000 = 67%)
        mockMvc.perform(get("/api/achats/" + achatId).cookie(sessionCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dejaAchete").value(30000))
                .andExpect(jsonPath("$.resteAAcheter").value(15000))
                .andExpect(jsonPath("$.progression").value(67));

        // 11. Ajouter de l'argent dans sa tirelire
        mockMvc.perform(post("/api/tirelire/depot")
                        .cookie(sessionCookie)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "montant", 180000,
                                "motif", "Épargne mensuelle"
                        ))))
                .andExpect(status().isCreated());

        // 12. Effectuer un retrait (suite à l'achat du jean noir)
        mockMvc.perform(post("/api/tirelire/retrait")
                        .cookie(sessionCookie)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "montant", 30000,
                                "motif", "Achat : Jean noir (Habits)",
                                "articleId", article1Id
                        ))))
                .andExpect(status().isCreated());

        // 13. Consulter son solde (180 000 - 30 000 = 150 000 FCFA)
        mockMvc.perform(get("/api/tirelire").cookie(sessionCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.solde").value(150000))
                .andExpect(jsonPath("$.totalDepose").value(180000))
                .andExpect(jsonPath("$.totalRetire").value(30000));

        // 14. Créer un objectif d'épargne & 15. Suivre sa progression
        MvcResult objRes = mockMvc.perform(post("/api/objectifs")
                        .cookie(sessionCookie)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nom", "Acheter mon ordinateur",
                                "description", "PC portable",
                                "montantCible", 300000,
                                "montantInitial", 150000,
                                "dateCible", LocalDate.now().plusMonths(3).toString(),
                                "categorie", "ELECTRONIQUE"
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.montantEpargne").value(150000))
                .andExpect(jsonPath("$.reste").value(150000))
                .andExpect(jsonPath("$.progression").value(50))
                .andExpect(jsonPath("$.epargneMensuelleRecommandee").isNumber())
                .andReturn();
        long objectifId = objectMapper.readTree(objRes.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(get("/api/objectifs/" + objectifId).cookie(sessionCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.progression").value(50));

        // 16. Consulter toutes ces informations depuis le dashboard
        mockMvc.perform(get("/api/dashboard").cookie(sessionCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.solde").value(150000))
                .andExpect(jsonPath("$.totalDepose").value(180000))
                .andExpect(jsonPath("$.totalRetire").value(30000))
                .andExpect(jsonPath("$.nombreAchats").value(1))
                .andExpect(jsonPath("$.totalPrevu").value(45000))
                .andExpect(jsonPath("$.dejaAchete").value(30000))
                .andExpect(jsonPath("$.resteAFinancer").value(15000))
                .andExpect(jsonPath("$.achatsParPriorite.URGENT").value(1))
                .andExpect(jsonPath("$.nombreObjectifsEnCours").value(1))
                .andExpect(jsonPath("$.objectifPrincipal.nom").value("Acheter mon ordinateur"))
                .andExpect(jsonPath("$.achatsPrioritaires[0].nom").value("Habits"));
    }
}
