package com.kalpee.repository;

import com.kalpee.entity.Transaction;
import com.kalpee.entity.TypeTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @EntityGraph(attributePaths = {"objectif", "article"})
    Page<Transaction> findByTirelireIdOrderByDateDescIdDesc(Long tirelireId, Pageable pageable);

    @Query("SELECT COALESCE(SUM(t.montant), 0) FROM Transaction t WHERE t.tirelire.id = :tirelireId AND t.type = :type")
    long sumMontantByTirelireIdAndType(@Param("tirelireId") Long tirelireId, @Param("type") TypeTransaction type);

    @Query("SELECT COALESCE(SUM(t.montant), 0) FROM Transaction t WHERE t.objectif.id = :objectifId AND t.type = :type")
    long sumMontantByObjectifIdAndType(@Param("objectifId") Long objectifId, @Param("type") TypeTransaction type);

    @Modifying
    @Query("UPDATE Transaction t SET t.article = null WHERE t.article.id = :articleId")
    void detachArticle(@Param("articleId") Long articleId);

    @Modifying
    @Query("UPDATE Transaction t SET t.article = null WHERE t.article.achat.id = :achatId")
    void detachArticlesByAchatId(@Param("achatId") Long achatId);

    @Modifying
    @Query("UPDATE Transaction t SET t.objectif = null WHERE t.objectif.id = :objectifId")
    void detachObjectif(@Param("objectifId") Long objectifId);
}
