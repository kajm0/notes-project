# BFF NestJS - Backend-For-Frontend

Backend-For-Frontend qui sert d'intermédiaire entre le frontend React et le backend Spring Boot.

## Valeur ajoutée

### 1. Cache intelligent (mémoire)
- Notes list : cache en mémoire avec TTL configurable
- Note détail : cache en mémoire avec TTL configurable
- Invalidation automatique sur mutations

### 2. Composition d'API
- Un seul endpoint au lieu de multiples appels
- Réduction de la latence côté client

### 3. Rate Limiting
- Protection : 100 requêtes/minute par utilisateur
- Throttling spécifique sur création de notes (10/min)

### 4. Transformation des données
- Adaptation format pour besoins frontend
- Enrichissement des réponses

## Stack technique

- NestJS 10
- TypeScript
- Cache en mémoire (cache-manager)
- Axios (HTTP client)
- Throttler (rate limiting)
- Swagger (documentation)

## Installation

```bash
npm install
```

## Développement

```bash
npm run start:dev
```

## Production

```bash
npm run build
npm run start:prod
```

## Docker

```bash
docker build -t notes-bff .
docker run -p 4000:4000 notes-bff
```

## Configuration

Variables d'environnement :

- `PORT` : Port du serveur (défaut: 4000)
- `BACKEND_API_URL` : URL du backend Spring Boot
- `JWT_SECRET` : Clé JWT (doit correspondre au backend)

## Endpoints

### Authentication (`/api/auth`)
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`

### Notes (`/api/notes`)
- `GET /notes` (cache en mémoire)
- `GET /notes/:id` (cache en mémoire)
- `POST /notes`
- `PUT /notes/:id`
- `DELETE /notes/:id`

### Partage (`/api/notes`)
- `POST /notes/:noteId/share/user`
- `POST /notes/:noteId/share/public`
- `GET /notes/:noteId/share/count` : Récupérer le nombre d'utilisateurs partagés
- `DELETE /notes/shares/:shareId`
- `DELETE /notes/public-links/:linkId`

### Public (`/api/p`)
- `GET /p/:token` : Accès public à une note (sans authentification)

## Documentation

Swagger UI : http://localhost:4000/api-docs

## Health Check

```bash
curl http://localhost:4000/health
```

## Architecture

```
Frontend React
     ↓
BFF NestJS (cache + rate limiting)
     ↓
Backend Spring Boot
     ↓
PostgreSQL
```

## Stratégie de cache

Le cache utilise la mémoire locale (cache-manager) pour améliorer les performances.
Les données sont mises en cache automatiquement et invalidées lors des opérations de modification.

| Endpoint | Cache | Invalidation |
|----------|-------|--------------|
| GET /notes | Mémoire | Sur POST/PUT/DELETE notes |
| GET /notes/:id | Mémoire | Sur PUT/DELETE note |

## Tests

```bash
npm test
```

## Structure

```
src/
├── auth/           # Module authentification
├── notes/          # Module notes (avec cache)
├── share/          # Module partage
├── backend/        # Service client backend
└── common/         # Guards, interceptors, filters
```


