# Kalpee — Planification d'achats & Gestion d'épargne personnelle (MVP)

**Kalpee** est une application web complète permettant de **planifier ses achats** (listes d'achats par priorité, articles détaillés avec photos, suivi des coûts et de la progression) et de **gérer l'argent mis de côté** (tirelire personnelle, historique des transactions, objectifs d'épargne et calcul de l'effort mensuel recommandé) en **FCFA**, depuis un tableau de bord unique.

---

## ✨ Aperçu des fonctionnalités du MVP

- **Authentification & Profil (`F01` à `F03`)** :
  - Inscription et connexion par email et mot de passe (hachage BCrypt, protection anti-bruteforce).
  - **Connexion avec Google (OAuth2 / OIDC + PKCE)** avec liaison sécurisée automatique des comptes (`D12`, `D13`, `RB15`).
  - Session sécurisée par cookie JWT `HttpOnly` (`KALPEE_SESSION`) + protection CSRF.
  - Gestion du profil et modification/définition du mot de passe.
- **Planification des Achats & Priorités (`F04` à `F07`, `F10`)** :
  - Création, modification, suppression et filtrage d'achats par recherche textuelle et par priorité (`URGENT`, `IMPORTANT`, `NORMAL`, `FAIBLE`).
  - Catégories unifiées (`VETEMENTS`, `ELECTRONIQUE`, `ACCESSOIRES`, `EQUIPEMENT`, `AUTRE`).
  - Calcul automatique à la volée du coût total, du montant déjà acheté, du reste à financer, de la progression (%) et du statut déduit (`A_PLANIFIER`, `EN_COURS`, `TERMINE`).
- **Articles, Photos & Retrait proposé (`F08` à `F11`)** :
  - Gestion des articles d'un achat (quantité, prix unitaire en FCFA, magasin/source, total automatique).
  - Téléversement et affichage sécurisé d'une photo par article (`JPEG`, `PNG`, `WebP` jusqu'à 5 Mo, validation par *magic bytes*).
  - Suivi du statut (`A_ACHETER`, `MIS_DE_COTE`, `ACHETE`) et **proposition automatique d'un retrait pré-rempli dans la tirelire** lorsqu'un article passe à « Acheté » (`D3`).
- **Tirelire & Transactions (`F12` à `F15`)** :
  - Solde unique calculé dynamiquement à partir des transactions (`RB07`).
  - Dépôts (avec étiquetage optionnel d'un objectif d'épargne) et retraits protégés contre les accès concurrents par verrouillage pessimiste (`RB12`, `RB13`).
  - Historique paginé des transactions.
- **Objectifs d'épargne (`F16` à `F18`)** :
  - Création et suivi des objectifs (montant cible, montant initial, épargne cumulée via la tirelire, progression).
  - Calcul automatique de l'**épargne mensuelle recommandée** selon la date cible.
- **Dashboard synthétique** :
  - Vue consolidée en un seul appel (`/api/dashboard`) : budget de la tirelire, avancement global des achats, répartition par priorité, 3 achats prioritaires et objectif d'épargne principal.

---

## 🏗️ Architecture du dépôt

```text
KalpeeNew/
├── backend/                  # API REST Spring Boot 3 (Java 21, Maven, PostgreSQL, Flyway)
│   ├── src/main/java/com/kalpee/
│   │   ├── config/           # Configurations (CORS, Sécurité, StockagePhoto)
│   │   ├── security/         # Cookie JWT, CSRF, OAuth2 Google PKCE, Anti-bruteforce
│   │   ├── controller/       # Contrôleurs REST (/api/*)
│   │   ├── service/          # Logique métier, calculs FCFA et transactions
│   │   ├── repository/       # Spring Data JPA & verrous pessimistes
│   │   ├── entity/           # Entités JPA du domaine
│   │   ├── dto/ & mapper/    # DTOs validés et convertisseurs
│   │   └── exception/        # Gestionnaire global d'erreurs uniformes
│   └── src/main/resources/
│       └── db/migration/     # Scripts SQL Flyway (schéma PostgreSQL)
├── frontend/                 # SPA React 18 (Vite, Tailwind CSS, React Router, Hook Form, Zod)
│   ├── src/                  # Composants, pages, services API Axios, schémas Zod et tests
│   └── nginx.conf            # Configuration Reverse Proxy Nginx (SPA + /api -> backend)
├── docs/                     # Livrables complets de conception et de documentation
└── docker-compose.yml        # Orchestration PostgreSQL + Backend + Frontend/Nginx
```

---

## 🚀 Démarrage rapide

### Option 1 : Avec Docker Compose (Recommandé)

1. Clonez le dépôt et placez-vous à la racine du projet :
   ```bash
   cd KalpeeNew
   ```
2. Lancez la construction et le démarrage des conteneurs (PostgreSQL 16 + Backend Spring Boot + Frontend Nginx) :
   ```bash
   docker compose up --build -d
   ```
3. Accédez à l'application dans votre navigateur :
   - **Application Kalpee** : [http://localhost:3000](http://localhost:3000)

Pour arrêter l'application :
```bash
docker compose down
```

### Option 2 : En développement local (Hors Docker)

1. **Base de données PostgreSQL** : assurez-vous qu'une base PostgreSQL `kalpee` est accessible sur `localhost:5432`.
2. **Démarrer le Backend Spring Boot** (port `8080`) :
   ```bash
   cd backend
   mvn spring-boot:run
   ```
3. **Démarrer le Frontend React / Vite** (port `5173` ou `3000` avec proxy `/api` vers `localhost:8080`) :
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🧪 Lancement des tests

### Tests Backend (Unitaires, Services & Intégration)
```bash
cd backend
mvn test
```

### Tests Frontend (Vitest & Testing Library)
```bash
cd frontend
npm test
```

---

## 📚 Documentation complète du projet (`docs/`)

Tous les livrables d'analyse, de conception, d'architecture et d'utilisation sont disponibles dans le dossier [`docs/`](file:///home/an0nymcoder/Documents/Projets/KalpeeNew/docs) :

| Document | Description |
|---|---|
| [**Cahier des charges**](file:///home/an0nymcoder/Documents/Projets/KalpeeNew/docs/cahier-des-charges.md) | Expression initiale des besoins, fonctionnalités `F01` à `F18`, règles métier `RB01` à `RB12` et critères de réussite. |
| [**Spécification de conception du MVP**](file:///home/an0nymcoder/Documents/Projets/KalpeeNew/docs/specification-mvp.md) | Périmètre du MVP, décisions de conception `D1` à `D14`, règles `RB13` à `RB16` et architecture cible. |
| [**Diagrammes UML & Modèles Merise (MCD / MLD / MPD)**](file:///home/an0nymcoder/Documents/Projets/KalpeeNew/docs/diagrammes-uml-merise.md) | Diagramme de cas d'utilisation, diagramme de classes UML, MCD Merise, dictionnaire des données complet et MPD PostgreSQL. |
| [**Spécification OpenAPI 3.0.3 (`openapi.yaml`)**](file:///home/an0nymcoder/Documents/Projets/KalpeeNew/docs/openapi.yaml) | Contrat OpenAPI 3.0.3 complet décrivant toutes les routes `/api/*`, les DTOs, les erreurs et la sécurité Cookie JWT + CSRF. |
| [**Documentation de l'API REST**](file:///home/an0nymcoder/Documents/Projets/KalpeeNew/docs/documentation-api.md) | Guide détaillé des endpoints avec exemples JSON de requêtes/réponses et diagrammes de séquence d'authentification. |
| [**Contrat d'API REST (Synthèse)**](file:///home/an0nymcoder/Documents/Projets/KalpeeNew/docs/api-contract.md) | Référence rapide du contrat JSON partagé entre le backend et le frontend. |
| [**Documentation Technique**](file:///home/an0nymcoder/Documents/Projets/KalpeeNew/docs/documentation-technique.md) | Architecture détaillée, justification technique de `D1` à `D14`, sécurité (BCrypt, JWT, CSRF, OAuth2 PKCE, verrous pessimistes, magic bytes), configuration `.env` et déploiement. |
| [**Guide Utilisateur**](file:///home/an0nymcoder/Documents/Projets/KalpeeNew/docs/guide-utilisateur.md) | Manuel pas à pas en français pour prendre en main toutes les fonctionnalités de Kalpee. |
