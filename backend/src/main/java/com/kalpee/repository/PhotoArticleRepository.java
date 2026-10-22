package com.kalpee.repository;

import com.kalpee.entity.PhotoArticle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PhotoArticleRepository extends JpaRepository<PhotoArticle, Long> {
    Optional<PhotoArticle> findByArticleId(Long articleId);
}
