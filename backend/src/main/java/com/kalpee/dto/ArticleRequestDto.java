package com.kalpee.dto;

import com.kalpee.entity.StatutArticle;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ArticleRequestDto(
        @NotBlank(message = "Le nom de l'article est obligatoire")
        @Size(max = 200, message = "Le nom ne doit pas dépasser 200 caractères")
        String nom,

        @Size(max = 2000, message = "La description ne doit pas dépasser 2000 caractères")
        String description,

        @NotNull(message = "La quantité est obligatoire")
        @Min(value = 1, message = "La quantité doit être supérieure à zéro")
        Integer quantite,

        @NotNull(message = "Le prix unitaire est obligatoire")
        @Min(value = 0, message = "Le prix unitaire doit être supérieur ou égal à zéro")
        Long prixUnitaire,

        @Size(max = 200, message = "Le magasin ne doit pas dépasser 200 caractères")
        String magasin,

        StatutArticle statut
) {
}
