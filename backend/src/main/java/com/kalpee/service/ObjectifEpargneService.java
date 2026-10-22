package com.kalpee.service;

import com.kalpee.dto.ObjectifDto;
import com.kalpee.dto.ObjectifRequestDto;
import com.kalpee.entity.*;
import com.kalpee.exception.CodeErreur;
import com.kalpee.exception.KalpeeException;
import com.kalpee.mapper.KalpeeMapper;
import com.kalpee.repository.ObjectifEpargneRepository;
import com.kalpee.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;

@Service
public class ObjectifEpargneService {

    private final ObjectifEpargneRepository objectifRepository;
    private final TransactionRepository transactionRepository;
    private final AuthService authService;
    private final KalpeeMapper mapper;
    private final Clock clock;

    public ObjectifEpargneService(
            ObjectifEpargneRepository objectifRepository,
            TransactionRepository transactionRepository,
            AuthService authService,
            KalpeeMapper mapper,
            Clock clock
    ) {
        this.objectifRepository = objectifRepository;
        this.transactionRepository = transactionRepository;
        this.authService = authService;
        this.mapper = mapper;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<ObjectifDto> listerObjectifs(Long utilisateurId) {
        LocalDate today = LocalDate.now(clock);
        return objectifRepository.findByUtilisateurIdOrderByDateCreationDesc(utilisateurId)
                .stream()
                .map(obj -> construireDto(obj, today))
                .toList();
    }

    @Transactional(readOnly = true)
    public ObjectifDto obtenirObjectif(Long utilisateurId, Long objectifId) {
        ObjectifEpargne obj = getObjectifOrThrow(utilisateurId, objectifId);
        return construireDto(obj, LocalDate.now(clock));
    }

    @Transactional
    public ObjectifDto creerObjectif(Long utilisateurId, ObjectifRequestDto dto) {
        Utilisateur utilisateur = authService.getUtilisateurOrThrow(utilisateurId);
        LocalDate today = LocalDate.now(clock);
        validerDonneesObjectif(dto, today);

        ObjectifEpargne obj = new ObjectifEpargne();
        obj.setUtilisateur(utilisateur);
        obj.setNom(dto.nom().trim());
        obj.setDescription(dto.description() != null ? dto.description().trim() : null);
        obj.setMontantCible(dto.montantCible());
        obj.setMontantInitial(dto.montantInitial() != null ? dto.montantInitial() : 0L);
        obj.setDateCible(dto.dateCible());
        obj.setCategorie(dto.categorie() != null ? dto.categorie() : Categorie.AUTRE);

        ObjectifEpargne saved = objectifRepository.save(obj);
        return construireDto(saved, today);
    }

    @Transactional
    public ObjectifDto modifierObjectif(Long utilisateurId, Long objectifId, ObjectifRequestDto dto) {
        ObjectifEpargne obj = getObjectifOrThrow(utilisateurId, objectifId);
        LocalDate dateReference = obj.getDateCreation() != null
                ? obj.getDateCreation().atZone(ZoneId.systemDefault()).toLocalDate()
                : LocalDate.now(clock);
        LocalDate today = LocalDate.now(clock);
        LocalDate minDate = dateReference.isBefore(today) ? dateReference : today;
        validerDonneesObjectif(dto, minDate);

        obj.setNom(dto.nom().trim());
        obj.setDescription(dto.description() != null ? dto.description().trim() : null);
        obj.setMontantCible(dto.montantCible());
        obj.setMontantInitial(dto.montantInitial() != null ? dto.montantInitial() : 0L);
        obj.setDateCible(dto.dateCible());
        obj.setCategorie(dto.categorie() != null ? dto.categorie() : Categorie.AUTRE);

        ObjectifEpargne saved = objectifRepository.save(obj);
        return construireDto(saved, today);
    }

    @Transactional
    public void supprimerObjectif(Long utilisateurId, Long objectifId) {
        ObjectifEpargne obj = getObjectifOrThrow(utilisateurId, objectifId);
        transactionRepository.detachObjectif(obj.getId());
        objectifRepository.delete(obj);
    }

    @Transactional(readOnly = true)
    public ObjectifEpargne getObjectifOrThrow(Long utilisateurId, Long objectifId) {
        return objectifRepository.findByIdAndUtilisateurId(objectifId, utilisateurId)
                .orElseThrow(() -> new KalpeeException(CodeErreur.NOT_FOUND, "Objectif d'épargne introuvable."));
    }

    @Transactional(readOnly = true)
    public long calculerEpargneObjectif(ObjectifEpargne obj) {
        long initial = obj.getMontantInitial() != null ? obj.getMontantInitial() : 0L;
        long depots = transactionRepository.sumMontantByObjectifIdAndType(obj.getId(), TypeTransaction.DEPOT);
        long retraits = transactionRepository.sumMontantByObjectifIdAndType(obj.getId(), TypeTransaction.RETRAIT);
        return Math.max(0L, initial + depots - retraits);
    }

    public ObjectifDto construireDto(ObjectifEpargne obj, LocalDate today) {
        long depots = transactionRepository.sumMontantByObjectifIdAndType(obj.getId(), TypeTransaction.DEPOT);
        long retraits = transactionRepository.sumMontantByObjectifIdAndType(obj.getId(), TypeTransaction.RETRAIT);
        return mapper.toObjectifDto(obj, depots, retraits, today);
    }

    private void validerDonneesObjectif(ObjectifRequestDto dto, LocalDate dateReference) {
        long cible = dto.montantCible() != null ? dto.montantCible() : 0L;
        long initial = dto.montantInitial() != null ? dto.montantInitial() : 0L;

        if (cible <= 0L) {
            throw new KalpeeException(
                    CodeErreur.VALIDATION_ERROR,
                    "Le montant cible doit être strictement positif.",
                    Map.of("montantCible", "Le montant cible doit être strictement positif")
            );
        }
        if (initial < 0L || initial > cible) {
            throw new KalpeeException(
                    CodeErreur.VALIDATION_ERROR,
                    "Le montant initial doit être compris entre 0 et le montant cible.",
                    Map.of("montantInitial", "Le montant initial ne peut pas dépasser le montant cible")
            );
        }
        if (dto.dateCible() != null && dto.dateCible().isBefore(dateReference)) {
            throw new KalpeeException(
                    CodeErreur.VALIDATION_ERROR,
                    "La date cible doit être postérieure ou égale à la date de création.",
                    Map.of("dateCible", "La date cible ne peut pas être dans le passé")
            );
        }
    }
}
