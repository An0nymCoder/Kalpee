package com.kalpee.service;

import com.kalpee.dto.AchatDto;
import com.kalpee.dto.DashboardDto;
import com.kalpee.dto.ObjectifDto;
import com.kalpee.dto.TirelireDto;
import com.kalpee.entity.Priorite;
import com.kalpee.entity.StatutAchat;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final TirelireService tirelireService;
    private final AchatService achatService;
    private final ObjectifEpargneService objectifService;

    public DashboardService(
            TirelireService tirelireService,
            AchatService achatService,
            ObjectifEpargneService objectifService
    ) {
        this.tirelireService = tirelireService;
        this.achatService = achatService;
        this.objectifService = objectifService;
    }

    @Transactional(readOnly = true)
    public DashboardDto obtenirDashboard(Long utilisateurId) {
        TirelireDto tirelire = tirelireService.obtenirTirelire(utilisateurId);
        List<AchatDto> achats = achatService.listerAchats(utilisateurId, null, null);
        List<ObjectifDto> objectifs = objectifService.listerObjectifs(utilisateurId);

        int nombreAchats = achats.size();
        long totalPrevu = 0L;
        long dejaAchete = 0L;

        Map<Priorite, Integer> achatsParPriorite = new EnumMap<>(Priorite.class);
        for (Priorite p : Priorite.values()) {
            achatsParPriorite.put(p, 0);
        }

        for (AchatDto achat : achats) {
            totalPrevu += achat.total();
            dejaAchete += achat.dejaAchete();
            achatsParPriorite.merge(achat.priorite(), 1, Integer::sum);
        }

        long resteAFinancer = Math.max(0L, totalPrevu - dejaAchete);
        int progressionAchats = com.kalpee.mapper.KalpeeMapper.calculerProgression(dejaAchete, totalPrevu);

        List<ObjectifDto> objectifsEnCours = objectifs.stream()
                .filter(o -> !o.atteint())
                .toList();
        int nombreObjectifsEnCours = objectifsEnCours.size();

        ObjectifDto objectifPrincipal = objectifsEnCours.stream()
                .sorted(Comparator.comparing(
                        ObjectifDto::dateCible,
                        Comparator.nullsLast(Comparator.naturalOrder())
                ))
                .findFirst()
                .orElse(null);

        List<AchatDto> achatsPrioritaires = achats.stream()
                .filter(a -> a.statut() != StatutAchat.TERMINE)
                .sorted(Comparator
                        .comparingInt((AchatDto a) -> a.priorite().getOrdre())
                        .thenComparing(
                                AchatDto::dateLimite,
                                Comparator.nullsLast(Comparator.naturalOrder())
                        )
                )
                .limit(3)
                .toList();

        return new DashboardDto(
                tirelire.solde(),
                tirelire.totalDepose(),
                tirelire.totalRetire(),
                nombreAchats,
                totalPrevu,
                dejaAchete,
                resteAFinancer,
                progressionAchats,
                achatsParPriorite,
                nombreObjectifsEnCours,
                objectifPrincipal,
                achatsPrioritaires
        );
    }
}
