package com.kalpee.service;

import com.kalpee.dto.*;
import com.kalpee.entity.*;
import com.kalpee.exception.CodeErreur;
import com.kalpee.exception.KalpeeException;
import com.kalpee.mapper.KalpeeMapper;
import com.kalpee.repository.ArticleRepository;
import com.kalpee.repository.PhotoArticleRepository;
import com.kalpee.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final PhotoArticleRepository photoArticleRepository;
    private final TransactionRepository transactionRepository;
    private final AchatService achatService;
    private final StockagePhoto stockagePhoto;
    private final KalpeeMapper mapper;

    public ArticleService(
            ArticleRepository articleRepository,
            PhotoArticleRepository photoArticleRepository,
            TransactionRepository transactionRepository,
            AchatService achatService,
            StockagePhoto stockagePhoto,
            KalpeeMapper mapper
    ) {
        this.articleRepository = articleRepository;
        this.photoArticleRepository = photoArticleRepository;
        this.transactionRepository = transactionRepository;
        this.achatService = achatService;
        this.stockagePhoto = stockagePhoto;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<ArticleDto> listerArticles(Long utilisateurId, Long achatId) {
        Achat achat = achatService.getAchatOrThrow(utilisateurId, achatId);
        return articleRepository.findByAchatIdOrderByIdAsc(achat.getId())
                .stream()
                .map(mapper::toArticleDto)
                .toList();
    }

    @Transactional
    public ArticleDto ajouterArticle(Long utilisateurId, Long achatId, ArticleRequestDto dto) {
        Achat achat = achatService.getAchatOrThrow(utilisateurId, achatId);
        Article article = new Article();
        article.setAchat(achat);
        article.setNom(dto.nom().trim());
        article.setDescription(dto.description() != null ? dto.description().trim() : null);
        article.setQuantite(dto.quantite());
        article.setPrixUnitaire(dto.prixUnitaire());
        article.setMagasin(dto.magasin() != null ? dto.magasin().trim() : null);
        article.setStatut(dto.statut() != null ? dto.statut() : StatutArticle.A_ACHETER);

        Article saved = articleRepository.save(article);
        return mapper.toArticleDto(saved);
    }

    @Transactional
    public ArticleDto modifierArticle(Long utilisateurId, Long articleId, ArticleRequestDto dto) {
        Article article = getArticleOrThrow(utilisateurId, articleId);
        if (article.getStatut() == StatutArticle.ACHETE) {
            throw new KalpeeException(
                    CodeErreur.VALIDATION_ERROR,
                    "Cet article est déjà marqué comme acheté, son état ne peut plus être modifié."
            );
        }
        article.setNom(dto.nom().trim());
        article.setDescription(dto.description() != null ? dto.description().trim() : null);
        article.setQuantite(dto.quantite());
        article.setPrixUnitaire(dto.prixUnitaire());
        article.setMagasin(dto.magasin() != null ? dto.magasin().trim() : null);
        if (dto.statut() != null) {
            article.setStatut(dto.statut());
        }

        Article saved = articleRepository.save(article);
        return mapper.toArticleDto(saved);
    }

    @Transactional
    public ArticleStatutResponseDto changerStatut(Long utilisateurId, Long articleId, StatutArticle nouveauStatut) {
        Article article = getArticleOrThrow(utilisateurId, articleId);
        if (article.getStatut() == StatutArticle.ACHETE && nouveauStatut != StatutArticle.ACHETE) {
            throw new KalpeeException(
                    CodeErreur.VALIDATION_ERROR,
                    "Cet article est déjà marqué comme acheté, son état ne peut plus être modifié."
            );
        }
        article.setStatut(nouveauStatut);
        Article saved = articleRepository.save(article);
        ArticleDto articleDto = mapper.toArticleDto(saved);

        RetraitSuggereDto retraitSuggere = null;
        if (nouveauStatut == StatutArticle.ACHETE && articleDto.total() > 0) {
            String achatNom = saved.getAchat() != null ? saved.getAchat().getNom() : "";
            String motif = achatNom.isBlank()
                    ? "Achat : " + saved.getNom()
                    : "Achat : " + saved.getNom() + " (" + achatNom + ")";
            retraitSuggere = new RetraitSuggereDto(articleDto.total(), motif, saved.getId());
        }

        return new ArticleStatutResponseDto(articleDto, retraitSuggere);
    }

    @Transactional
    public void supprimerArticle(Long utilisateurId, Long articleId) {
        Article article = getArticleOrThrow(utilisateurId, articleId);
        if (article.getPhoto() != null) {
            stockagePhoto.supprimer(article.getPhoto().getChemin());
        }
        transactionRepository.detachArticle(article.getId());
        if (article.getAchat() != null && article.getAchat().getArticles() != null) {
            article.getAchat().getArticles().remove(article);
        }
        articleRepository.delete(article);
    }

    @Transactional
    public ArticleDto enregistrerPhoto(Long utilisateurId, Long articleId, MultipartFile file) {
        Article article = getArticleOrThrow(utilisateurId, articleId);
        StockagePhoto.FichierStocke stocke = stockagePhoto.stocker(file);

        PhotoArticle existante = article.getPhoto();
        if (existante != null) {
            stockagePhoto.supprimer(existante.getChemin());
            existante.setChemin(stocke.chemin());
            existante.setTypeMime(stocke.typeMime());
            existante.setTaille(stocke.taille());
            photoArticleRepository.save(existante);
        } else {
            PhotoArticle nouvelle = new PhotoArticle(article, stocke.chemin(), stocke.typeMime(), stocke.taille());
            photoArticleRepository.save(nouvelle);
            article.setPhoto(nouvelle);
        }

        return mapper.toArticleDto(article);
    }

    @Transactional(readOnly = true)
    public StockagePhoto.ContenuPhoto lirePhoto(Long utilisateurId, Long articleId) {
        Article article = getArticleOrThrow(utilisateurId, articleId);
        PhotoArticle photo = article.getPhoto();
        if (photo == null) {
            throw new KalpeeException(CodeErreur.NOT_FOUND, "Aucune photo associée à cet article.");
        }
        return stockagePhoto.lire(photo.getChemin(), photo.getTypeMime());
    }

    @Transactional
    public void supprimerPhoto(Long utilisateurId, Long articleId) {
        Article article = getArticleOrThrow(utilisateurId, articleId);
        PhotoArticle photo = article.getPhoto();
        if (photo != null) {
            stockagePhoto.supprimer(photo.getChemin());
            article.setPhoto(null);
            photoArticleRepository.delete(photo);
        }
    }

    @Transactional(readOnly = true)
    public Article getArticleOrThrow(Long utilisateurId, Long articleId) {
        return articleRepository.findByIdAndAchatUtilisateurId(articleId, utilisateurId)
                .orElseThrow(() -> new KalpeeException(CodeErreur.NOT_FOUND, "Article introuvable."));
    }
}
