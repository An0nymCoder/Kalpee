package com.kalpee.service;

import com.kalpee.exception.CodeErreur;
import com.kalpee.exception.KalpeeException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@Service
public class StockagePhotoDisque implements StockagePhoto {

    private static final long MAX_FILE_SIZE = 5L * 1024L * 1024L; // 5 Mo

    private final Path rootLocation;

    public StockagePhotoDisque(@Value("${kalpee.storage.location:./uploads/photos}") String storageLocation) {
        this.rootLocation = Paths.get(storageLocation).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootLocation);
        } catch (IOException e) {
            throw new IllegalStateException("Impossible de créer le dossier de stockage des photos", e);
        }
    }

    @Override
    public FichierStocke stocker(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new KalpeeException(
                    CodeErreur.VALIDATION_ERROR,
                    "Le fichier photo est vide.",
                    Map.of("file", "Veuillez sélectionner une image valide")
            );
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new KalpeeException(
                    CodeErreur.VALIDATION_ERROR,
                    "La photo dépasse la taille maximale autorisée de 5 Mo.",
                    Map.of("file", "Taille maximale de 5 Mo dépassée")
            );
        }

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new KalpeeException(CodeErreur.VALIDATION_ERROR, "Impossible de lire le fichier photo.");
        }

        String detectedMime = detecterTypeMime(bytes);
        if (detectedMime == null) {
            throw new KalpeeException(
                    CodeErreur.VALIDATION_ERROR,
                    "Format d'image non supporté. Formats autorisés : JPEG, PNG, WebP.",
                    Map.of("file", "Format d'image non supporté (JPEG, PNG, WebP uniquement)")
            );
        }

        String extension = switch (detectedMime) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> ".bin";
        };

        String filename = UUID.randomUUID() + extension;
        Path target = rootLocation.resolve(filename).normalize();
        if (!target.startsWith(rootLocation)) {
            throw new KalpeeException(CodeErreur.VALIDATION_ERROR, "Chemin de fichier invalide.");
        }

        try {
            Files.createDirectories(rootLocation);
            Files.write(target, bytes);
        } catch (IOException e) {
            throw new KalpeeException(CodeErreur.VALIDATION_ERROR, "Erreur lors de l'enregistrement de la photo.");
        }

        return new FichierStocke(filename, detectedMime, bytes.length);
    }

    @Override
    public ContenuPhoto lire(String chemin, String typeMime) {
        Path file = rootLocation.resolve(chemin).normalize();
        if (!file.startsWith(rootLocation) || !Files.exists(file)) {
            throw new KalpeeException(CodeErreur.NOT_FOUND, "Photo introuvable.");
        }
        try {
            return new ContenuPhoto(Files.readAllBytes(file), typeMime);
        } catch (IOException e) {
            throw new KalpeeException(CodeErreur.NOT_FOUND, "Impossible de lire la photo.");
        }
    }

    @Override
    public void supprimer(String chemin) {
        if (chemin == null || chemin.isBlank()) {
            return;
        }
        Path file = rootLocation.resolve(chemin).normalize();
        if (file.startsWith(rootLocation)) {
            try {
                Files.deleteIfExists(file);
            } catch (IOException ignored) {
            }
        }
    }

    public static String detecterTypeMime(byte[] bytes) {
        if (bytes == null || bytes.length < 12) {
            return null;
        }
        // JPEG: FF D8 FF
        if ((bytes[0] & 0xFF) == 0xFF && (bytes[1] & 0xFF) == 0xD8 && (bytes[2] & 0xFF) == 0xFF) {
            return "image/jpeg";
        }
        // PNG: 89 50 4E 47 0D 0A 1A 0A
        if ((bytes[0] & 0xFF) == 0x89
                && bytes[1] == 0x50
                && bytes[2] == 0x4E
                && bytes[3] == 0x47
                && bytes[4] == 0x0D
                && bytes[5] == 0x0A
                && bytes[6] == 0x1A
                && bytes[7] == 0x0A) {
            return "image/png";
        }
        // WebP: RIFF....WEBP
        if (bytes[0] == 'R' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == 'F'
                && bytes[8] == 'W' && bytes[9] == 'E' && bytes[10] == 'B' && bytes[11] == 'P') {
            return "image/webp";
        }
        return null;
    }
}
