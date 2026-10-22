package com.kalpee.dto;

import com.kalpee.entity.StatutArticle;

public record ArticleDto(
        Long id,
        Long achatId,
        String nom,
        String description,
        int quantite,
        long prixUnitaire,
        long total,
        String magasin,
        StatutArticle statut,
        boolean aPhoto,
        String photoUrl
) {
}
