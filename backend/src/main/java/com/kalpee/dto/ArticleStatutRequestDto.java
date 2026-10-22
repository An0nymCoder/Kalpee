package com.kalpee.dto;

import com.kalpee.entity.StatutArticle;
import jakarta.validation.constraints.NotNull;

public record ArticleStatutRequestDto(
        @NotNull(message = "Le statut est obligatoire")
        StatutArticle statut
) {
}
