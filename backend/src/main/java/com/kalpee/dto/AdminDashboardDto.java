package com.kalpee.dto;

import java.util.List;

public record AdminDashboardDto(
        long totalUtilisateurs,
        long totalAdmins,
        long utilisateursGoogle,
        long totalAchats,
        long montantTotalAchats,
        long totalArticles,
        long articlesAchetes,
        long articlesAAcheter,
        long articlesMisDeCote,
        long montantTotalArticlesAchetes,
        long soldeGlobalTirelires,
        long totalGlobalDepose,
        long totalGlobalRetire,
        long totalTransactions,
        long totalObjectifs,
        List<AdminUserDto> utilisateurs
) {
}
