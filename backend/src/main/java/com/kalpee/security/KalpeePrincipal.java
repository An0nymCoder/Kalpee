package com.kalpee.security;

import com.kalpee.entity.RoleUtilisateur;

import java.security.Principal;

public record KalpeePrincipal(
        Long id,
        String email,
        RoleUtilisateur role
) implements Principal {

    public KalpeePrincipal(Long id, String email) {
        this(id, email, RoleUtilisateur.USER);
    }

    @Override
    public String getName() {
        return email;
    }
}
