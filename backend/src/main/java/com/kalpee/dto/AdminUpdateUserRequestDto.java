package com.kalpee.dto;

import com.kalpee.entity.RoleUtilisateur;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AdminUpdateUserRequestDto(
        @NotBlank(message = "Le nom est obligatoire")
        @Size(max = 100, message = "Le nom ne doit pas dépasser 100 caractères")
        String nom,

        @NotBlank(message = "Le prénom est obligatoire")
        @Size(max = 100, message = "Le prénom ne doit pas dépasser 100 caractères")
        String prenom,

        @NotBlank(message = "L'adresse e-mail est obligatoire")
        @Email(message = "Format d'adresse e-mail invalide")
        @Size(max = 255, message = "L'adresse e-mail ne doit pas dépasser 255 caractères")
        String email,

        @NotNull(message = "Le rôle est obligatoire")
        RoleUtilisateur role,

        @Size(min = 8, max = 100, message = "Le mot de passe doit contenir au moins 8 caractères")
        String nouveauMotDePasse
) {
}
