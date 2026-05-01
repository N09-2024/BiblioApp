# BiblioApp

Application mobile de gestion de bibliothèque personnelle, développée avec **React Native** et **Expo**.

---

## Fonctionnalités

- **Ajouter / Modifier / Supprimer** des livres
- **Recherche** par titre ou auteur
- **Filtres** par statut (Lu / Non lu), note minimale et genre
- **Tri** par date d'ajout, titre, note ou date de lecture
- **Photo de couverture** depuis la caméra ou la galerie
- **Favoris** avec écran dédié et recherche intégrée
- **Statistiques** : total, lus/non lus, note moyenne, top genres
- **Validation** des champs (titre obligatoire, auteur obligatoire, format date JJ/MM/AAAA, nb de pages positif)
- **Confirmation** avant de quitter un formulaire avec des données non sauvegardées
- **Persistance locale** via SQLite (fonctionne sans connexion internet)

---

## Structure du projet

```
BiblioApp/
├── App.js                      # Point d'entrée, navigation, initialisation DB
├── database.js                 # Toutes les fonctions SQLite (CRUD + stats)
├── theme.js                    # Couleurs, rayons, ombres centralisés
├── index.js                    # Entrée Expo
├── screens/
│   ├── AccueilScreen.js        # Liste des livres + filtres + tri
│   ├── DetailScreen.js         # Fiche détaillée d'un livre
│   ├── FormulaireScreen.js     # Ajout et modification d'un livre
│   ├── FavorisScreen.js        # Liste des favoris avec recherche
│   └── StatsScreen.js          # Statistiques de la bibliothèque
├── assets/                     # Icônes et images de l'application
├── app.json                    # Configuration Expo
└── package.json
```

---

## Technologies

| Technologie | Rôle |
|---|---|
| React Native | Framework mobile (iOS & Android) |
| Expo SDK 54 | Outils de développement et APIs natives |
| expo-sqlite | Base de données locale SQLite |
| expo-image-picker | Accès caméra et galerie photos |
| @react-navigation/native-stack | Navigation entre écrans |
| @expo/vector-icons (Ionicons) | Icônes vectorielles |

---

## Installation

### Prérequis

- [Node.js](https://nodejs.org/) (v18 ou supérieur)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- L'application **Expo Go** sur votre téléphone (iOS ou Android)

### Étapes

```bash
# 1. Cloner le projet
git clone <url-du-repo>
cd BiblioApp

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement
npx expo start
```

Scannez ensuite le QR code avec l'application **Expo Go** (Android) ou l'appareil photo (iOS).

---

## Base de données

La base de données SQLite est initialisée **une seule fois** au démarrage de l'application (`App.js`). Elle crée automatiquement la table `livres` si elle n'existe pas.

### Schéma de la table `livres`

| Colonne | Type | Description |
|---|---|---|
| `id` | INTEGER | Identifiant auto-incrémenté |
| `titre` | TEXT | Titre du livre (obligatoire) |
| `auteur` | TEXT | Auteur du livre (obligatoire) |
| `genre` | TEXT | Genre littéraire |
| `nb_pages` | INTEGER | Nombre de pages |
| `note` | INTEGER | Note de 0 à 5 |
| `lu` | INTEGER | 0 = Non lu, 1 = Lu |
| `favori` | INTEGER | 0 = Non favori, 1 = Favori |
| `date_lecture` | TEXT | Date au format JJ/MM/AAAA |
| `photo` | TEXT | URI de la photo de couverture |

### Fonctions disponibles dans `database.js`

| Fonction | Description |
|---|---|
| `initDB()` | Initialise la DB et applique les migrations |
| `getLivres(options)` | Récupère les livres avec filtres et tri |
| `getLivreById(id)` | Récupère un livre par son ID |
| `getFavoris(recherche)` | Récupère les livres favoris |
| `getGenres()` | Récupère la liste des genres distincts |
| `getStats()` | Calcule les statistiques globales |
| `ajouterLivre(livre)` | Insère un nouveau livre |
| `modifierLivre(livre)` | Met à jour un livre existant |
| `supprimerLivre(id)` | Supprime un livre |
| `toggleFavori(id, favoriActuel)` | Bascule le statut favori |
| `mettreAJourPhoto(id, photo)` | Met à jour l'URI de la photo |

---

## Navigation

```
Accueil (Ma Bibliothèque)
├── Formulaire (Ajouter un livre)
├── Detail (Détails du livre)
│   └── Formulaire (Modifier le livre)
├── Favoris (Mes Favoris)
│   └── Detail (Détails du livre)
└── Stats (Statistiques)
```

---

## Thème (`theme.js`)

Toutes les constantes visuelles sont centralisées :

```js
Colors.primary      // Bleu marine principal
Colors.accent       // Terracotta (éléments secondaires)
Colors.gold         // Or (étoiles, favoris)
Colors.success      // Vert (livres lus)
Colors.danger       // Rouge (erreurs, suppression)
Colors.background   // Fond parchemin chaud
Colors.surface      // Blanc (cartes)

Radius.sm / md / lg / xl / full   // Rayons de bordure
Shadow.sm / md / lg               // Ombres portées
```

---

## Scripts disponibles

```bash
npx expo start          # Démarrer en mode développement
npx expo start --android  # Ouvrir sur émulateur Android
npx expo start --ios      # Ouvrir sur simulateur iOS
npx expo start --web      # Ouvrir dans le navigateur
```

---

## Permissions requises

| Permission | Usage |
|---|---|
| `CAMERA` | Prendre une photo de couverture |
| `MEDIA_LIBRARY` | Choisir une photo depuis la galerie |

Les permissions sont demandées à la volée lors de la première utilisation de ces fonctionnalités.
