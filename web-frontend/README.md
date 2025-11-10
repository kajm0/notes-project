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

Accès : http://localhost:3000

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
- Liste des notes
- Création avec éditeur Markdown
- Prévisualisation en temps réel
- Édition / Suppression
- Support tags

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
│   ├── Login.tsx      # Authentification
│   └── Notes.tsx      # Gestion des notes
└── App.tsx            # Router + Routes
```

## Tests

```bash
npm test
```

## Comptes de démonstration

- Email : demo@notes.app
- Password : Demo123!
