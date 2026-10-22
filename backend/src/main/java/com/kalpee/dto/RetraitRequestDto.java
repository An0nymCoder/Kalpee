package com.kalpee.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RetraitRequestDto(
        @NotNull(message = "Le montant est obligatoire")
        @Min(value = 1, message = "Le montant doit être strictement positif")
        Long montant,

        @NotBlank(message = "Le motif est obligatoire")
        @Size(max = 300, message = "Le motif ne doit pas dépasser 300 caractères")
        String motif,

        Long objectifId,

        Long articleId
) {
}
