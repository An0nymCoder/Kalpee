package com.kalpee.service;

import com.kalpee.dto.AdminDashboardDto;
import com.kalpee.dto.AdminUserDto;
import com.kalpee.entity.*;
import com.kalpee.exception.CodeErreur;
import com.kalpee.exception.KalpeeException;
import com.kalpee.repository.*;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class AdminService {

    private final UtilisateurRepository utilisateurRepository;
    private final CompteExterneRepository compteExterneRepository;
    private final AchatRepository achatRepository;
    private final ArticleRepository articleRepository;
    private final TirelireRepository tirelireRepository;
    private final TransactionRepository transactionRepository;
    private final ObjectifEpargneRepository objectifRepository;
    private final StockagePhoto stockagePhoto;

    public AdminService(
            UtilisateurRepository utilisateurRepository,
            CompteExterneRepository compteExterneRepository,
            AchatRepository achatRepository,
            ArticleRepository articleRepository,
            TirelireRepository tirelireRepository,
            TransactionRepository transactionRepository,
            ObjectifEpargneRepository objectifRepository,
            StockagePhoto stockagePhoto
    ) {
        this.utilisateurRepository = utilisateurRepository;
        this.compteExterneRepository = compteExterneRepository;
        this.achatRepository = achatRepository;
        this.articleRepository = articleRepository;
        this.tirelireRepository = tirelireRepository;
        this.transactionRepository = transactionRepository;
        this.objectifRepository = objectifRepository;
        this.stockagePhoto = stockagePhoto;
    }

    @Transactional(readOnly = true)
    public AdminDashboardDto obtenirDashboardAdmin() {
        List<Utilisateur> utilisateurs = utilisateurRepository.findAll(Sort.by(Sort.Direction.DESC, "dateCreation"));
        List<Article> tousArticles = articleRepository.findAll();
        List<Transaction> toutesTransactions = transactionRepository.findAll();

        long totalUtilisateurs = utilisateurs.size();
        long totalAdmins = utilisateurs.stream().filter(u -> u.getRole() == RoleUtilisateur.ADMIN).count();
        long utilisateursGoogle = 0L;

        long totalAchats = achatRepository.count();
        long totalObjectifs = objectifRepository.count();

        long totalArticles = tousArticles.size();
        long articlesAchetes = 0L;
        long articlesAAcheter = 0L;
        long articlesMisDeCote = 0L;
        long montantTotalAchats = 0L;
        long montantTotalArticlesAchetes = 0L;

        for (Article art : tousArticles) {
            long totalArt = art.calculerTotal();
            montantTotalAchats += totalArt;
            if (art.getStatut() == StatutArticle.ACHETE) {
                articlesAchetes++;
                montantTotalArticlesAchetes += totalArt;
            } else if (art.getStatut() == StatutArticle.MIS_DE_COTE) {
                articlesMisDeCote++;
            } else {
                articlesAAcheter++;
            }
        }

        long totalGlobalDepose = 0L;
        long totalGlobalRetire = 0L;
        for (Transaction tx : toutesTransactions) {
            if (tx.getType() == TypeTransaction.DEPOT) {
                totalGlobalDepose += tx.getMontant();
            } else if (tx.getType() == TypeTransaction.RETRAIT) {
                totalGlobalRetire += tx.getMontant();
            }
        }
        long soldeGlobalTirelires = totalGlobalDepose - totalGlobalRetire;
        long totalTransactions = toutesTransactions.size();

        List<AdminUserDto> userDtos = new ArrayList<>();
        for (Utilisateur u : utilisateurs) {
            boolean google = compteExterneRepository.existsByUtilisateurIdAndFournisseur(u.getId(), FournisseurExterne.GOOGLE);
            if (google) {
                utilisateursGoogle++;
            }
            List<Achat> achatsUser = achatRepository.findByUtilisateurIdOrderByDateCreationDesc(u.getId());
            int nbAchats = achatsUser.size();
            int nbArticles = achatsUser.stream()
                    .mapToInt(a -> a.getArticles() != null ? a.getArticles().size() : 0)
                    .sum();

            long soldeUser = tirelireRepository.findByUtilisateurId(u.getId())
                    .map(t -> {
                        long dep = transactionRepository.sumMontantByTirelireIdAndType(t.getId(), TypeTransaction.DEPOT);
                        long ret = transactionRepository.sumMontantByTirelireIdAndType(t.getId(), TypeTransaction.RETRAIT);
                        return dep - ret;
                    })
                    .orElse(0L);

            int nbObjectifs = objectifRepository.findByUtilisateurIdOrderByDateCreationDesc(u.getId()).size();

            userDtos.add(new AdminUserDto(
                    u.getId(),
                    u.getNom(),
                    u.getPrenom(),
                    u.getEmail(),
                    u.getRole() != null ? u.getRole() : RoleUtilisateur.USER,
                    google,
                    u.aMotDePasse(),
                    nbAchats,
                    nbArticles,
                    soldeUser,
                    nbObjectifs,
                    u.getDateCreation()
            ));
        }

        return new AdminDashboardDto(
                totalUtilisateurs,
                totalAdmins,
                utilisateursGoogle,
                totalAchats,
                montantTotalAchats,
                totalArticles,
                articlesAchetes,
                articlesAAcheter,
                articlesMisDeCote,
                montantTotalArticlesAchetes,
                soldeGlobalTirelires,
                totalGlobalDepose,
                totalGlobalRetire,
                totalTransactions,
                totalObjectifs,
                userDtos
        );
    }

    @Transactional
    public AdminUserDto changerRoleUtilisateur(Long adminId, Long cibleId, RoleUtilisateur nouveauRole) {
        if (adminId.equals(cibleId) && nouveauRole != RoleUtilisateur.ADMIN) {
            throw new KalpeeException(
                    CodeErreur.VALIDATION_ERROR,
                    "Tu ne peux pas retirer ton propre rôle administrateur."
            );
        }
        Utilisateur cible = utilisateurRepository.findById(cibleId)
                .orElseThrow(() -> new KalpeeException(CodeErreur.NOT_FOUND, "Utilisateur introuvable."));
        cible.setRole(nouveauRole);
        Utilisateur saved = utilisateurRepository.save(cible);

        boolean google = compteExterneRepository.existsByUtilisateurIdAndFournisseur(saved.getId(), FournisseurExterne.GOOGLE);
        List<Achat> achatsUser = achatRepository.findByUtilisateurIdOrderByDateCreationDesc(saved.getId());
        int nbArticles = achatsUser.stream()
                .mapToInt(a -> a.getArticles() != null ? a.getArticles().size() : 0)
                .sum();
        long soldeUser = tirelireRepository.findByUtilisateurId(saved.getId())
                .map(t -> transactionRepository.sumMontantByTirelireIdAndType(t.getId(), TypeTransaction.DEPOT)
                        - transactionRepository.sumMontantByTirelireIdAndType(t.getId(), TypeTransaction.RETRAIT))
                .orElse(0L);
        int nbObjectifs = objectifRepository.findByUtilisateurIdOrderByDateCreationDesc(saved.getId()).size();

        return new AdminUserDto(
                saved.getId(),
                saved.getNom(),
                saved.getPrenom(),
                saved.getEmail(),
                saved.getRole(),
                google,
                saved.aMotDePasse(),
                achatsUser.size(),
                nbArticles,
                soldeUser,
                nbObjectifs,
                saved.getDateCreation()
        );
    }

    @Transactional
    public void supprimerUtilisateur(Long adminId, Long cibleId) {
        if (adminId.equals(cibleId)) {
            throw new KalpeeException(
                    CodeErreur.VALIDATION_ERROR,
                    "Tu ne peux pas supprimer ton propre compte administrateur."
            );
        }
        Utilisateur cible = utilisateurRepository.findById(cibleId)
                .orElseThrow(() -> new KalpeeException(CodeErreur.NOT_FOUND, "Utilisateur introuvable."));

        List<Achat> achats = achatRepository.findByUtilisateurIdOrderByDateCreationDesc(cibleId);
        for (Achat achat : achats) {
            if (achat.getArticles() != null) {
                for (Article article : achat.getArticles()) {
                    if (article.getPhoto() != null) {
                        stockagePhoto.supprimer(article.getPhoto().getChemin());
                    }
                }
            }
        }

        utilisateurRepository.delete(cible);
    }
}
