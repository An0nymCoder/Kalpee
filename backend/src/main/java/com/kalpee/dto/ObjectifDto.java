package com.kalpee.dto;

import com.kalpee.entity.Categorie;

import java.time.Instant;
import java.time.LocalDate;

public record ObjectifDto(
        Long id,
        String nom,
        String description,
        long montantCible,
        long montantInitial,
        long montantEpargne,
        long reste,
        int progression,
        LocalDate dateCible,
        Categorie categorie,
        Long epargneMensuelleRecommandee,
        int moisRestants,
        boolean atteint,
        Instant dateCreation
) {
}
