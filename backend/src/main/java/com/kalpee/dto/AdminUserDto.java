package com.kalpee.dto;

import com.kalpee.entity.RoleUtilisateur;

import java.time.Instant;

public record AdminUserDto(
        Long id,
        String nom,
        String prenom,
        String email,
        RoleUtilisateur role,
        boolean connexionGoogle,
        boolean aMotDePasse,
        int nombreAchats,
        int nombreArticles,
        long soldeTirelire,
        int nombreObjectifs,
        Instant dateCreation
) {
}
