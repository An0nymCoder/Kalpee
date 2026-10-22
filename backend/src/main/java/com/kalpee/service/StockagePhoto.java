package com.kalpee.service;

import org.springframework.web.multipart.MultipartFile;

public interface StockagePhoto {

    record FichierStocke(String chemin, String typeMime, long taille) {
    }

    record ContenuPhoto(byte[] donnees, String typeMime) {
    }

    FichierStocke stocker(MultipartFile file);

    ContenuPhoto lire(String chemin, String typeMime);

    void supprimer(String chemin);
}
