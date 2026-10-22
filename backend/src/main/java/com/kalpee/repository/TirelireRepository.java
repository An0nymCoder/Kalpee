package com.kalpee.repository;

import com.kalpee.entity.Tirelire;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface TirelireRepository extends JpaRepository<Tirelire, Long> {

    Optional<Tirelire> findByUtilisateurId(Long utilisateurId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM Tirelire t WHERE t.utilisateur.id = :utilisateurId")
    Optional<Tirelire> findWithLockByUtilisateurId(@Param("utilisateurId") Long utilisateurId);
}
