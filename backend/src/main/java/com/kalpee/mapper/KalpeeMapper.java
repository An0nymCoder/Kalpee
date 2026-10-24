package com.kalpee.mapper;

import com.kalpee.dto.*;
import com.kalpee.entity.*;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.Period;
import java.util.Collections;
import java.util.List;

@Component
public class KalpeeMapper {

    public UtilisateurDto toUtilisateurDto(Utilisateur utilisateur, boolean connexionGoogle) {
        return new UtilisateurDto(
                utilisateur.getId(),
                utilisateur.getNom(),
                utilisateur.getPrenom(),
                utilisateur.getEmail(),
                utilisateur.getRole() != null ? utilisateur.getRole() : RoleUtilisateur.USER,
                utilisateur.aMotDePasse(),
                connexionGoogle,
                utilisateur.isMotDePasseSupprimeParLiaisonGoogle(),
                utilisateur.getDateCreation()
        );
    }

    public ArticleDto toArticleDto(Article article) {
        long total = article.calculerTotal();
        boolean aPhoto = article.getPhoto() != null;
        String photoUrl = aPhoto && article.getId() != null
                ? "/api/articles/" + article.getId() + "/photo"
                : null;
        return new ArticleDto(
                article.getId(),
                article.getAchat() != null ? article.getAchat().getId() : null,
                article.getNom(),
                article.getDescription(),
                article.getQuantite() != null ? article.getQuantite() : 1,
                article.getPrixUnitaire() != null ? article.getPrixUnitaire() : 0L,
                total,
                article.getMagasin(),
                article.getStatut(),
                aPhoto,
                photoUrl
        );
    }

    public AchatDto toAchatDto(Achat achat) {
        List<Article> articles = achat.getArticles() != null ? achat.getArticles() : Collections.emptyList();
        int nombreArticles = articles.size();
        int nombreArticlesAchetes = 0;
        long total = 0L;
        long dejaAchete = 0L;

        for (Article article : articles) {
            long totalArticle = article.calculerTotal();
            total += totalArticle;
            if (article.getStatut() == StatutArticle.ACHETE) {
                nombreArticlesAchetes++;
                dejaAchete += totalArticle;
            }
        }

        long resteAAcheter = Math.max(0L, total - dejaAchete);
        int progression = calculerProgression(dejaAchete, total);
        StatutAchat statut = deduireStatutAchat(nombreArticles, nombreArticlesAchetes);

        return new AchatDto(
                achat.getId(),
                achat.getNom(),
                achat.getDescription(),
                achat.getPriorite(),
                achat.getCategorie(),
                achat.getDateLimite(),
                statut,
                nombreArticles,
                nombreArticlesAchetes,
                total,
                dejaAchete,
                resteAAcheter,
                progression,
                achat.getDateCreation()
        );
    }

    public AchatDetailDto toAchatDetailDto(Achat achat) {
        AchatDto base = toAchatDto(achat);
        List<ArticleDto> articles = achat.getArticles() != null
                ? achat.getArticles().stream().map(this::toArticleDto).toList()
                : Collections.emptyList();

        return new AchatDetailDto(
                base.id(),
                base.nom(),
                base.description(),
                base.priorite(),
                base.categorie(),
                base.dateLimite(),
                base.statut(),
                base.nombreArticles(),
                base.nombreArticlesAchetes(),
                base.total(),
                base.dejaAchete(),
                base.resteAAcheter(),
                base.progression(),
                base.dateCreation(),
                articles
        );
    }

    public TransactionDto toTransactionDto(Transaction transaction) {
        ObjectifEpargne obj = transaction.getObjectif();
        Article art = transaction.getArticle();
        return new TransactionDto(
                transaction.getId(),
                transaction.getType(),
                transaction.getMontant(),
                transaction.getMotif(),
                transaction.getDate(),
                obj != null ? obj.getId() : null,
                obj != null ? obj.getNom() : null,
                art != null ? art.getId() : null,
                art != null ? art.getNom() : null
        );
    }

    public ObjectifDto toObjectifDto(ObjectifEpargne objectif, long depotsEtiquetes, long retraitsEtiquetes, LocalDate today) {
        long montantCible = objectif.getMontantCible() != null ? objectif.getMontantCible() : 0L;
        long montantInitial = objectif.getMontantInitial() != null ? objectif.getMontantInitial() : 0L;
        long montantEpargne = Math.max(0L, montantInitial + depotsEtiquetes - retraitsEtiquetes);
        long reste = Math.max(0L, montantCible - montantEpargne);
        int progression = calculerProgression(montantEpargne, montantCible);
        boolean atteint = montantCible > 0 && montantEpargne >= montantCible;

        int moisRestants = calculerMoisRestants(today, objectif.getDateCible(), atteint);
        Long epargneMensuelleRecommandee = calculerEpargneMensuelle(reste, moisRestants, today, objectif.getDateCible(), atteint);

        return new ObjectifDto(
                objectif.getId(),
                objectif.getNom(),
                objectif.getDescription(),
                montantCible,
                montantInitial,
                montantEpargne,
                reste,
                progression,
                objectif.getDateCible(),
                objectif.getCategorie(),
                epargneMensuelleRecommandee,
                moisRestants,
                atteint,
                objectif.getDateCreation()
        );
    }

    public static StatutAchat deduireStatutAchat(int nombreArticles, int nombreArticlesAchetes) {
        if (nombreArticles == 0) {
            return StatutAchat.A_PLANIFIER;
        }
        if (nombreArticlesAchetes == nombreArticles) {
            return StatutAchat.TERMINE;
        }
        return StatutAchat.EN_COURS;
    }

    public static int calculerProgression(long valeurActuelle, long valeurCible) {
        if (valeurCible <= 0L || valeurActuelle <= 0L) {
            return 0;
        }
        if (valeurActuelle >= valeurCible) {
            return 100;
        }
        return (int) Math.round((valeurActuelle * 100.0) / valeurCible);
    }

    public static int calculerMoisRestants(LocalDate today, LocalDate dateCible, boolean atteint) {
        if (atteint || dateCible == null || today == null || dateCible.isBefore(today)) {
            return 0;
        }
        Period period = Period.between(today, dateCible);
        int months = period.getYears() * 12 + period.getMonths() + (period.getDays() > 0 ? 1 : 0);
        return Math.max(1, months);
    }

    public static Long calculerEpargneMensuelle(long reste, int moisRestants, LocalDate today, LocalDate dateCible, boolean atteint) {
        if (atteint || reste <= 0L || dateCible == null || today == null || dateCible.isBefore(today) || moisRestants <= 0) {
            return null;
        }
        return (reste + moisRestants - 1) / moisRestants;
    }
}
