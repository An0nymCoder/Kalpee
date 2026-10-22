package com.kalpee.repository;

import com.kalpee.entity.CompteExterne;
import com.kalpee.entity.FournisseurExterne;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CompteExterneRepository extends JpaRepository<CompteExterne, Long> {
    @EntityGraph(attributePaths = {"utilisateur"})
    Optional<CompteExterne> findByFournisseurAndIdentifiantExterne(FournisseurExterne fournisseur, String identifiantExterne);
    List<CompteExterne> findByUtilisateurId(Long utilisateurId);
    boolean existsByUtilisateurIdAndFournisseur(Long utilisateurId, FournisseurExterne fournisseur);
}
