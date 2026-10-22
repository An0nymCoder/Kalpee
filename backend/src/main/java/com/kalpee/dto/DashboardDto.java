package com.kalpee.dto;

import com.kalpee.entity.Priorite;

import java.util.List;
import java.util.Map;

public record DashboardDto(
        long solde,
        long totalDepose,
        long totalRetire,
        int nombreAchats,
        long totalPrevu,
        long dejaAchete,
        long resteAFinancer,
        int progressionAchats,
        Map<Priorite, Integer> achatsParPriorite,
        int nombreObjectifsEnCours,
        ObjectifDto objectifPrincipal,
        List<AchatDto> achatsPrioritaires
) {
}
