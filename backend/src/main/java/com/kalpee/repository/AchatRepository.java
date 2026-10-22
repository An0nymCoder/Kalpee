package com.kalpee.repository;

import com.kalpee.entity.Achat;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AchatRepository extends JpaRepository<Achat, Long> {

    @EntityGraph(attributePaths = {"articles", "articles.photo"})
    List<Achat> findByUtilisateurIdOrderByDateCreationDesc(Long utilisateurId);

    @EntityGraph(attributePaths = {"articles", "articles.photo"})
    Optional<Achat> findByIdAndUtilisateurId(Long id, Long utilisateurId);
}
