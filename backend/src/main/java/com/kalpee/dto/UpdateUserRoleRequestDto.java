package com.kalpee.dto;

import com.kalpee.entity.RoleUtilisateur;
import jakarta.validation.constraints.NotNull;

public record UpdateUserRoleRequestDto(
        @NotNull(message = "Le rôle est obligatoire")
        RoleUtilisateur role
) {
}
