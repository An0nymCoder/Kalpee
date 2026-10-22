# Contrat d'API REST — Kalpee MVP

Ce document définit le contrat JSON exact entre le backend Spring Boot (`com.kalpee`) et le frontend React (`frontend/`).

## 1. Énumérations

- **Priorite** : `URGENT`, `IMPORTANT`, `NORMAL`, `FAIBLE`
- **Categorie** : `VETEMENTS`, `ELECTRONIQUE`, `ACCESSOIRES`, `EQUIPEMENT`, `AUTRE`
- **StatutAchat** (déduit uniquement) : `A_PLANIFIER`, `EN_COURS`, `TERMINE`
- **StatutArticle** : `A_ACHETER`, `MIS_DE_COTE`, `ACHETE`
- **TypeTransaction** : `DEPOT`, `RETRAIT`
- **FournisseurExterne** : `GOOGLE`

## 2. Format d'erreur uniforme

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Les données saisies sont invalides.",
  "details": {
    "nom": "Le nom est obligatoire"
  }
}
```

Codes d'erreur :
- `VALIDATION_ERROR` (400)
- `UNAUTHENTICATED` (401)
- `NOT_FOUND` (404)
- `EMAIL_ALREADY_USED` (409)
- `INSUFFICIENT_BALANCE` (422)
- `OBJECTIVE_INSUFFICIENT` (422)
- `TOO_MANY_ATTEMPTS` (429)

## 3. Authentification et Profil

### `POST /api/auth/register` (201)
Requête :
```json
{
  "nom": "Diarizo",
  "prenom": "Ouz",
  "email": "ouz@example.com",
  "motDePasse": "motdepasse123"
}
```
Réponse : `UtilisateurDto` + Cookie `KALPEE_SESSION` (HttpOnly, SameSite=Lax, Path=/, 24h).

### `POST /api/auth/login` (200)
Requête :
```json
{
  "email": "ouz@example.com",
  "motDePasse": "motdepasse123"
}
```
Réponse : `UtilisateurDto` + Cookie `KALPEE_SESSION`.

### `POST /api/auth/logout` (204)
Supprime le cookie `KALPEE_SESSION`.

### `GET /api/auth/me` et `GET /api/profil` (200)
Réponse (`UtilisateurDto`) :
```json
{
  "id": 1,
  "nom": "Diarizo",
  "prenom": "Ouz",
  "email": "ouz@example.com",
  "aMotDePasse": true,
  "connexionGoogle": false,
  "motDePasseSupprimeParLiaisonGoogle": false,
  "dateCreation": "2026-10-22T21:00:00Z"
}
```

### `PUT /api/profil` (200)
Requête :
```json
{
  "nom": "Diarizo",
  "prenom": "Ouz",
  "email": "ouz@example.com"
}
```
Réponse : `UtilisateurDto`.

### `PUT /api/profil/mot-de-passe` (200)
Requête :
```json
{
  "motDePasseActuel": "ancien123",
  "nouveauMotDePasse": "nouveau123"
}
```
(`motDePasseActuel` optionnel si `aMotDePasse == false`).
Réponse : `UtilisateurDto`.

### Connexion Google
- Démarrage : `GET /api/oauth2/authorization/google`
- Callback : `/api/login/oauth2/code/google`
- Redirection après succès : `/dashboard` (ou `/profil?googleLinked=true` en cas de liaison ayant supprimé l'ancien mot de passe).
- Redirection après erreur : `/login?error=google_auth_failed` ou `/login?error=google_email_unverified`.

## 4. Achats

### `GET /api/achats?recherche=&priorite=` (200)
Réponse : `List<AchatDto>`
```json
[
  {
    "id": 1,
    "nom": "Habits",
    "description": "Vêtements pour les vacances",
    "priorite": "URGENT",
    "categorie": "VETEMENTS",
    "dateLimite": "2026-09-15",
    "statut": "EN_COURS",
    "nombreArticles": 2,
    "nombreArticlesAchetes": 1,
    "total": 45000,
    "dejaAchete": 30000,
    "resteAAcheter": 15000,
    "progression": 67,
    "dateCreation": "2026-10-22T21:00:00Z"
  }
]
```

### `GET /api/achats/{id}` (200)
Réponse : `AchatDetailDto` (mêmes champs que `AchatDto` + `"articles": List<ArticleDto>`).

### `POST /api/achats` (201) & `PUT /api/achats/{id}` (200)
Requête :
```json
{
  "nom": "Habits",
  "description": "Vêtements pour les vacances",
  "priorite": "URGENT",
  "categorie": "VETEMENTS",
  "dateLimite": "2026-09-15"
}
```

### `DELETE /api/achats/{id}` (204)

## 5. Articles et Photos

### `GET /api/achats/{achatId}/articles` (200)
Réponse : `List<ArticleDto>`
```json
[
  {
    "id": 10,
    "achatId": 1,
    "nom": "Jean noir",
    "description": "Jean noir coupe droite",
    "quantite": 2,
    "prixUnitaire": 15000,
    "total": 30000,
    "magasin": "Zara",
    "statut": "ACHETE",
    "aPhoto": true,
    "photoUrl": "/api/articles/10/photo"
  }
]
```

### `POST /api/achats/{achatId}/articles` (201) & `PUT /api/articles/{id}` (200)
Requête :
```json
{
  "nom": "Jean noir",
  "description": "Jean noir coupe droite",
  "quantite": 2,
  "prixUnitaire": 15000,
  "magasin": "Zara",
  "statut": "A_ACHETER"
}
```

### `PATCH /api/articles/{id}/statut` (200)
Requête :
```json
{
  "statut": "ACHETE"
}
```
Réponse :
```json
{
  "article": {
    "id": 10,
    "achatId": 1,
    "nom": "Jean noir",
    "description": "Jean noir coupe droite",
    "quantite": 2,
    "prixUnitaire": 15000,
    "total": 30000,
    "magasin": "Zara",
    "statut": "ACHETE",
    "aPhoto": false,
    "photoUrl": null
  },
  "retraitSuggere": {
    "montant": 30000,
    "motif": "Achat : Jean noir (Habits)",
    "articleId": 10
  }
}
```

### `DELETE /api/articles/{id}` (204)

### `POST /api/articles/{id}/photo` (200)
`multipart/form-data` avec champ `file` (JPEG, PNG, WebP, max 5 Mo). Renvoie `ArticleDto`.

### `GET /api/articles/{id}/photo` (200)
Flux binaire de l'image avec `Content-Type` correspondant.

### `DELETE /api/articles/{id}/photo` (204)

## 6. Tirelire et Transactions

### `GET /api/tirelire` (200)
```json
{
  "solde": 150000,
  "totalDepose": 180000,
  "totalRetire": 30000
}
```

### `POST /api/tirelire/depot` (201)
Requête :
```json
{
  "montant": 25000,
  "motif": "Épargne mensuelle",
  "objectifId": 1
}
```
Réponse : `TransactionDto`.

### `POST /api/tirelire/retrait` (201)
Requête :
```json
{
  "montant": 30000,
  "motif": "Achat : Jean noir",
  "objectifId": null,
  "articleId": 10
}
```
Réponse : `TransactionDto`.

### `GET /api/tirelire/transactions?page=0&size=20` (200)
```json
{
  "content": [
    {
      "id": 1,
      "type": "DEPOT",
      "montant": 25000,
      "motif": "Épargne mensuelle",
      "date": "2026-10-22T21:00:00Z",
      "objectifId": 1,
      "objectifNom": "Acheter mon ordinateur",
      "articleId": null,
      "articleNom": null
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1,
  "hasNext": false
}
```

## 7. Objectifs d'épargne

### `GET /api/objectifs` (200) & `GET /api/objectifs/{id}` (200)
`ObjectifDto` :
```json
{
  "id": 1,
  "nom": "Acheter mon ordinateur",
  "description": "Un bon PC pour le travail",
  "montantCible": 300000,
  "montantInitial": 150000,
  "montantEpargne": 175000,
  "reste": 125000,
  "progression": 58,
  "dateCible": "2026-11-30",
  "categorie": "ELECTRONIQUE",
  "epargneMensuelleRecommandee": 62500,
  "moisRestants": 2,
  "atteint": false,
  "dateCreation": "2026-10-22T21:00:00Z"
}
```

### `POST /api/objectifs` (201) & `PUT /api/objectifs/{id}` (200)
Requête :
```json
{
  "nom": "Acheter mon ordinateur",
  "description": "Un bon PC pour le travail",
  "montantCible": 300000,
  "montantInitial": 150000,
  "dateCible": "2026-11-30",
  "categorie": "ELECTRONIQUE"
}
```

### `DELETE /api/objectifs/{id}` (204)

## 8. Dashboard

### `GET /api/dashboard` (200)
```json
{
  "solde": 150000,
  "totalDepose": 180000,
  "totalRetire": 30000,
  "nombreAchats": 4,
  "totalPrevu": 520000,
  "dejaAchete": 150000,
  "resteAFinancer": 370000,
  "progressionAchats": 29,
  "achatsParPriorite": {
    "URGENT": 1,
    "IMPORTANT": 1,
    "NORMAL": 1,
    "FAIBLE": 1
  },
  "nombreObjectifsEnCours": 2,
  "objectifPrincipal": null,
  "achatsPrioritaires": []
}
```
