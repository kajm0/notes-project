# Frontend React - Notes Web App

Application web de gestion de notes avec support Markdown.

## Stack technique

- React 18
- TypeScript
- Vite (build tool)
- Zustand (state management)
- React Router 6
- Axios (HTTP client)
- React Markdown
- React Hot Toast (notifications)

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

Accès : http://localhost:3000 (mode développement)

> **Note** : En production Docker, l'application est accessible sur le port 8081.

## Build production

```bash
npm run build
npm run preview
```

## Docker

```bash
docker build -t notes-frontend .
docker run -p 80:80 notes-frontend
```

## Configuration

Variable d'environnement :
- `VITE_BFF_URL` : URL du BFF (défaut: http://localhost:4000)

## Fonctionnalités

### Authentification
- Inscription / Connexion
- JWT stocké dans localStorage
- Routes protégées

### Gestion de notes
- Liste des notes avec rafraîchissement automatique
- Création avec éditeur Markdown
- Prévisualisation en temps réel
- Édition / Suppression
- Support tags et filtres
- Partage avec utilisateurs et liens publics
- Dialogue de confirmation pour changement SHARED → PRIVATE

### Interface
- Responsive design
- Toast notifications
- Protected routes

## Structure

```
src/
├── lib/
│   ├── api.ts         # Client Axios avec intercepteurs JWT
│   └── store.ts       # Zustand stores (auth + notes)
├── pages/
│   ├── Auth.tsx       # Authentification (Login/Register)
│   ├── NotesPage.tsx  # Gestion des notes
│   └── PublicNote.tsx # Affichage des notes publiques
├── styles/
│   └── global.css     # Styles globaux
└── App.tsx            # Router + Routes
```

## Scripts

```bash
# Développement
npm run dev

# Build production
npm run build

# Tests
npm test
npm run test:e2e
```

## Comptes de démonstration

Un compte démo est créé automatiquement au démarrage du backend :

- **Email** : `demo@example.com`
- **Password** : `password123`
