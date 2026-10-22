package com.kalpee.repository;

import com.kalpee.entity.ObjectifEpargne;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ObjectifEpargneRepository extends JpaRepository<ObjectifEpargne, Long> {
    List<ObjectifEpargne> findByUtilisateurIdOrderByDateCreationDesc(Long utilisateurId);
    Optional<ObjectifEpargne> findByIdAndUtilisateurId(Long id, Long utilisateurId);
}
