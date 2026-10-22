package com.kalpee.service;

import com.kalpee.dto.*;
import com.kalpee.entity.*;
import com.kalpee.exception.CodeErreur;
import com.kalpee.exception.KalpeeException;
import com.kalpee.mapper.KalpeeMapper;
import com.kalpee.repository.ArticleRepository;
import com.kalpee.repository.ObjectifEpargneRepository;
import com.kalpee.repository.TirelireRepository;
import com.kalpee.repository.TransactionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TirelireService {

    private final TirelireRepository tirelireRepository;
    private final TransactionRepository transactionRepository;
    private final ObjectifEpargneRepository objectifRepository;
    private final ArticleRepository articleRepository;
    private final ObjectifEpargneService objectifService;
    private final AuthService authService;
    private final KalpeeMapper mapper;

    public TirelireService(
            TirelireRepository tirelireRepository,
            TransactionRepository transactionRepository,
            ObjectifEpargneRepository objectifRepository,
            ArticleRepository articleRepository,
            ObjectifEpargneService objectifService,
            AuthService authService,
            KalpeeMapper mapper
    ) {
        this.tirelireRepository = tirelireRepository;
        this.transactionRepository = transactionRepository;
        this.objectifRepository = objectifRepository;
        this.articleRepository = articleRepository;
        this.objectifService = objectifService;
        this.authService = authService;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public TirelireDto obtenirTirelire(Long utilisateurId) {
        Tirelire tirelire = getOrCreateTirelire(utilisateurId);
        long totalDepose = transactionRepository.sumMontantByTirelireIdAndType(tirelire.getId(), TypeTransaction.DEPOT);
        long totalRetire = transactionRepository.sumMontantByTirelireIdAndType(tirelire.getId(), TypeTransaction.RETRAIT);
        long solde = totalDepose - totalRetire;
        return new TirelireDto(solde, totalDepose, totalRetire);
    }

    @Transactional
    public TransactionDto deposer(Long utilisateurId, DepotRequestDto dto) {
        Tirelire tirelire = getOrCreateTirelire(utilisateurId);

        ObjectifEpargne objectif = null;
        if (dto.objectifId() != null) {
            objectif = objectifRepository.findByIdAndUtilisateurId(dto.objectifId(), utilisateurId)
                    .orElseThrow(() -> new KalpeeException(CodeErreur.NOT_FOUND, "Objectif d'épargne introuvable."));
        }

        Transaction tx = new Transaction();
        tx.setTirelire(tirelire);
        tx.setType(TypeTransaction.DEPOT);
        tx.setMontant(dto.montant());
        tx.setMotif(dto.motif().trim());
        tx.setObjectif(objectif);

        Transaction saved = transactionRepository.save(tx);
        return mapper.toTransactionDto(saved);
    }

    @Transactional
    public TransactionDto retirer(Long utilisateurId, RetraitRequestDto dto) {
        // Verrouillage pessimiste sur la tirelire pour interdire deux retraits simultanés dépassant le solde (RB12)
        Tirelire tirelire = tirelireRepository.findWithLockByUtilisateurId(utilisateurId)
                .orElseGet(() -> getOrCreateTirelire(utilisateurId));

        long totalDepose = transactionRepository.sumMontantByTirelireIdAndType(tirelire.getId(), TypeTransaction.DEPOT);
        long totalRetire = transactionRepository.sumMontantByTirelireIdAndType(tirelire.getId(), TypeTransaction.RETRAIT);
        long solde = totalDepose - totalRetire;

        if (dto.montant() > solde) {
            throw new KalpeeException(
                    CodeErreur.INSUFFICIENT_BALANCE,
                    "Solde insuffisant dans ta tirelire (" + solde + " FCFA disponible)."
            );
        }

        ObjectifEpargne objectif = null;
        if (dto.objectifId() != null) {
            objectif = objectifRepository.findByIdAndUtilisateurId(dto.objectifId(), utilisateurId)
                    .orElseThrow(() -> new KalpeeException(CodeErreur.NOT_FOUND, "Objectif d'épargne introuvable."));
            long epargneObjectif = objectifService.calculerEpargneObjectif(objectif);
            if (dto.montant() > epargneObjectif) {
                throw new KalpeeException(
                        CodeErreur.OBJECTIVE_INSUFFICIENT,
                        "Le retrait dépasse le montant épargné sur cet objectif (" + epargneObjectif + " FCFA)."
                );
            }
        }

        Article article = null;
        if (dto.articleId() != null) {
            article = articleRepository.findByIdAndAchatUtilisateurId(dto.articleId(), utilisateurId)
                    .orElseThrow(() -> new KalpeeException(CodeErreur.NOT_FOUND, "Article introuvable."));
        }

        Transaction tx = new Transaction();
        tx.setTirelire(tirelire);
        tx.setType(TypeTransaction.RETRAIT);
        tx.setMontant(dto.montant());
        tx.setMotif(dto.motif().trim());
        tx.setObjectif(objectif);
        tx.setArticle(article);

        Transaction saved = transactionRepository.save(tx);
        return mapper.toTransactionDto(saved);
    }

    @Transactional(readOnly = true)
    public PageResponseDto<TransactionDto> listerTransactions(Long utilisateurId, int page, int size) {
        Tirelire tirelire = getOrCreateTirelire(utilisateurId);
        int safePage = Math.max(0, page);
        int safeSize = (size <= 0 || size > 100) ? 20 : size;

        Page<Transaction> result = transactionRepository.findByTirelireIdOrderByDateDescIdDesc(
                tirelire.getId(),
                PageRequest.of(safePage, safeSize)
        );
        List<TransactionDto> content = result.getContent().stream()
                .map(mapper::toTransactionDto)
                .toList();

        return new PageResponseDto<>(
                content,
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.hasNext()
        );
    }

    private Tirelire getOrCreateTirelire(Long utilisateurId) {
        return tirelireRepository.findByUtilisateurId(utilisateurId)
                .orElseGet(() -> {
                    Utilisateur utilisateur = authService.getUtilisateurOrThrow(utilisateurId);
                    Tirelire nouvelle = new Tirelire(utilisateur);
                    return tirelireRepository.save(nouvelle);
                });
    }
}
