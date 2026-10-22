package com.kalpee.repository;

import com.kalpee.entity.Article;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ArticleRepository extends JpaRepository<Article, Long> {

    @EntityGraph(attributePaths = {"photo"})
    List<Article> findByAchatIdOrderByIdAsc(Long achatId);

    @EntityGraph(attributePaths = {"achat", "achat.utilisateur", "photo"})
    Optional<Article> findByIdAndAchatUtilisateurId(Long id, Long utilisateurId);
}
