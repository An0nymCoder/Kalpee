package com.kalpee.dto;

import com.kalpee.entity.RoleUtilisateur;

import java.time.Instant;

public record UtilisateurDto(
        Long id,
        String nom,
        String prenom,
        String email,
        RoleUtilisateur role,
        boolean aMotDePasse,
        boolean connexionGoogle,
        boolean motDePasseSupprimeParLiaisonGoogle,
        Instant dateCreation
) {
}
