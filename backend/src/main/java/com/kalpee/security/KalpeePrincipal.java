package com.kalpee.security;

import java.security.Principal;

public record KalpeePrincipal(
        Long id,
        String email
) implements Principal {

    @Override
    public String getName() {
        return email;
    }
}
