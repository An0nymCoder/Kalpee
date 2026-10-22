package com.kalpee.dto;

import com.kalpee.entity.Categorie;
import com.kalpee.entity.Priorite;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record AchatRequestDto(
        @NotBlank(message = "Le nom de l'achat est obligatoire")
        @Size(max = 200, message = "Le nom ne doit pas dépasser 200 caractères")
        String nom,

        @Size(max = 2000, message = "La description ne doit pas dépasser 2000 caractères")
        String description,

        @NotNull(message = "La priorité est obligatoire")
        Priorite priorite,

        Categorie categorie,

        LocalDate dateLimite
) {
}
