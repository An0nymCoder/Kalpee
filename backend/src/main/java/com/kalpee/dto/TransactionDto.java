package com.kalpee.dto;

import com.kalpee.entity.TypeTransaction;

import java.time.Instant;

public record TransactionDto(
        Long id,
        TypeTransaction type,
        long montant,
        String motif,
        Instant date,
        Long objectifId,
        String objectifNom,
        Long articleId,
        String articleNom
) {
}
