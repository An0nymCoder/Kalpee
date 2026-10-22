package com.kalpee;

import com.kalpee.dto.AchatDto;
import com.kalpee.dto.ObjectifDto;
import com.kalpee.entity.*;
import com.kalpee.mapper.KalpeeMapper;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class KalpeeCalculsTest {

    private final KalpeeMapper mapper = new KalpeeMapper();

    @Test
    void calculAchatSansArticle_doitEtreAPlanifierAvecTotalZero() {
        Achat achat = new Achat();
        achat.setId(1L);
        achat.setNom("Vacances");
        achat.setPriorite(Priorite.URGENT);
        achat.setCategorie(Categorie.VETEMENTS);

        AchatDto dto = mapper.toAchatDto(achat);

        assertThat(dto.total()).isZero();
        assertThat(dto.dejaAchete()).isZero();
        assertThat(dto.resteAAcheter()).isZero();
        assertThat(dto.progression()).isZero();
        assertThat(dto.statut()).isEqualTo(StatutAchat.A_PLANIFIER);
    }

    @Test
    void calculAchatAvecArticles_doitCalculerTotauxProgressionEnMontantEtStatut() {
        Achat achat = new Achat();
        achat.setId(1L);
        achat.setNom("Habits");
        achat.setPriorite(Priorite.URGENT);
        achat.setCategorie(Categorie.VETEMENTS);

        Article jean = new Article();
        jean.setId(10L);
        jean.setAchat(achat);
        jean.setNom("Jean noir");
        jean.setQuantite(2);
        jean.setPrixUnitaire(15000L); // 30 000 FCFA
        jean.setStatut(StatutArticle.ACHETE);

        Article tshirt = new Article();
        tshirt.setId(11L);
        tshirt.setAchat(achat);
        tshirt.setNom("T-shirt");
        tshirt.setQuantite(3);
        tshirt.setPrixUnitaire(5000L); // 15 000 FCFA
        tshirt.setStatut(StatutArticle.MIS_DE_COTE);

        Article chaussures = new Article();
        chaussures.setId(12L);
        chaussures.setAchat(achat);
        chaussures.setNom("Chaussures");
        chaussures.setQuantite(1);
        chaussures.setPrixUnitaire(5000L); // 5 000 FCFA
        chaussures.setStatut(StatutArticle.A_ACHETER);

        achat.setArticles(List.of(jean, tshirt, chaussures));

        AchatDto dto = mapper.toAchatDto(achat);

        assertThat(dto.total()).isEqualTo(50000L);
        assertThat(dto.dejaAchete()).isEqualTo(30000L);
        assertThat(dto.resteAAcheter()).isEqualTo(20000L);
        assertThat(dto.progression()).isEqualTo(60);
        assertThat(dto.statut()).isEqualTo(StatutAchat.EN_COURS);

        // Si tous les articles passent à ACHETE -> TERMINE et 100%
        tshirt.setStatut(StatutArticle.ACHETE);
        chaussures.setStatut(StatutArticle.ACHETE);
        AchatDto dtoTermine = mapper.toAchatDto(achat);
        assertThat(dtoTermine.statut()).isEqualTo(StatutAchat.TERMINE);
        assertThat(dtoTermine.progression()).isEqualTo(100);
        assertThat(dtoTermine.resteAAcheter()).isZero();
    }

    @Test
    void calculObjectifEpargne_troisMoisRestants_doitRecommander50000ParMois() {
        ObjectifEpargne obj = new ObjectifEpargne();
        obj.setId(1L);
        obj.setNom("Ordinateur");
        obj.setMontantCible(300000L);
        obj.setMontantInitial(100000L);
        obj.setDateCible(LocalDate.of(2026, 11, 30));
        obj.setCategorie(Categorie.ELECTRONIQUE);

        LocalDate today = LocalDate.of(2026, 8, 30);
        // Épargné = 100 000 + 70 000 - 20 000 = 150 000 FCFA -> Reste = 150 000 FCFA sur 3 mois
        ObjectifDto dto = mapper.toObjectifDto(obj, 70000L, 20000L, today);

        assertThat(dto.montantEpargne()).isEqualTo(150000L);
        assertThat(dto.reste()).isEqualTo(150000L);
        assertThat(dto.progression()).isEqualTo(50);
        assertThat(dto.moisRestants()).isEqualTo(3);
        assertThat(dto.epargneMensuelleRecommandee()).isEqualTo(50000L);
        assertThat(dto.atteint()).isFalse();
    }

    @Test
    void calculObjectifEpargne_casLimites_moinsDunMois_depasse_etDatePassee() {
        ObjectifEpargne obj = new ObjectifEpargne();
        obj.setId(2L);
        obj.setNom("Téléphone");
        obj.setMontantCible(200000L);
        obj.setMontantInitial(50000L);
        obj.setCategorie(Categorie.ELECTRONIQUE);

        LocalDate today = LocalDate.of(2026, 10, 22);

        // Cas 1 : Échéance dans 10 jours (< 1 mois) -> moisRestants = 1
        obj.setDateCible(LocalDate.of(2026, 11, 1));
        ObjectifDto courtTerme = mapper.toObjectifDto(obj, 0L, 0L, today);
        assertThat(courtTerme.moisRestants()).isEqualTo(1);
        assertThat(courtTerme.epargneMensuelleRecommandee()).isEqualTo(150000L);

        // Cas 2 : Objectif dépassé -> atteint = true, reste = 0, progression = 100, pas de recommandation
        ObjectifDto depasse = mapper.toObjectifDto(obj, 200000L, 0L, today);
        assertThat(depasse.atteint()).isTrue();
        assertThat(depasse.reste()).isZero();
        assertThat(depasse.progression()).isEqualTo(100);
        assertThat(depasse.epargneMensuelleRecommandee()).isNull();

        // Cas 3 : Date cible passée -> aucune recommandation
        obj.setDateCible(LocalDate.of(2026, 10, 1));
        ObjectifDto datePassee = mapper.toObjectifDto(obj, 0L, 0L, today);
        assertThat(datePassee.epargneMensuelleRecommandee()).isNull();
        assertThat(datePassee.moisRestants()).isZero();
    }
}
