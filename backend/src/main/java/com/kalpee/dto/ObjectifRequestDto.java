package com.kalpee.dto;

import com.kalpee.entity.Categorie;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ObjectifRequestDto(
        @NotBlank(message = "Le nom de l'objectif est obligatoire")
        @Size(max = 200, message = "Le nom ne doit pas dépasser 200 caractères")
        String nom,

        @Size(max = 2000, message = "La description ne doit pas dépasser 2000 caractères")
        String description,

        @NotNull(message = "Le montant cible est obligatoire")
        @Min(value = 1, message = "Le montant cible doit être strictement positif")
        Long montantCible,

        @Min(value = 0, message = "Le montant initial ne peut pas être négatif")
        Long montantInitial,

        LocalDate dateCible,

        Categorie categorie
) {
}
