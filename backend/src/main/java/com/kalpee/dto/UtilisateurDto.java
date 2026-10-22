package com.kalpee.dto;

import java.time.Instant;

public record UtilisateurDto(
        Long id,
        String nom,
        String prenom,
        String email,
        boolean aMotDePasse,
        boolean connexionGoogle,
        boolean motDePasseSupprimeParLiaisonGoogle,
        Instant dateCreation
) {
}
