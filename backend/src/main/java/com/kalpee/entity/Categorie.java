package com.kalpee.entity;

import com.fasterxml.jackson.annotation.JsonCreator;

import java.text.Normalizer;
import java.util.Locale;

public enum Categorie {
    VETEMENTS("Vêtements"),
    ELECTRONIQUE("Électronique"),
    ACCESSOIRES("Accessoires"),
    EQUIPEMENT("Équipement"),
    AUTRE("Autre");

    private final String libelle;

    Categorie(String libelle) {
        this.libelle = libelle;
    }

    public String getLibelle() {
        return libelle;
    }

    @JsonCreator
    public static Categorie fromValue(String value) {
        if (value == null || value.isBlank()) {
            return AUTRE;
        }
        String normalized = Normalizer.normalize(value.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toUpperCase(Locale.ROOT);
        for (Categorie cat : values()) {
            if (cat.name().equals(normalized)) {
                return cat;
            }
        }
        throw new IllegalArgumentException("Catégorie invalide : " + value);
    }
}
