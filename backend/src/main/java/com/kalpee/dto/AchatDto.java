package com.kalpee.dto;

import com.kalpee.entity.Categorie;
import com.kalpee.entity.Priorite;
import com.kalpee.entity.StatutAchat;

import java.time.Instant;
import java.time.LocalDate;

public record AchatDto(
        Long id,
        String nom,
        String description,
        Priorite priorite,
        Categorie categorie,
        LocalDate dateLimite,
        StatutAchat statut,
        int nombreArticles,
        int nombreArticlesAchetes,
        long total,
        long dejaAchete,
        long resteAAcheter,
        int progression,
        Instant dateCreation
) {
}
