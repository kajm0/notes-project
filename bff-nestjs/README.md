# BFF NestJS - Backend-For-Frontend

Backend-For-Frontend qui sert d'intermédiaire entre le frontend React et le backend Spring Boot.

## Valeur ajoutée

### 1. Cache intelligent (Redis)
- Notes list : 5 min TTL
- Note détail : 2 min TTL
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
- Redis (cache)
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
- `REDIS_HOST` : Hôte Redis
- `REDIS_PORT` : Port Redis
- `JWT_SECRET` : Clé JWT (doit correspondre au backend)

## Endpoints

### Authentication (`/api/auth`)
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`

### Notes (`/api/notes`)
- `GET /notes` (cached 5min)
- `GET /notes/:id` (cached 2min)
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

| Endpoint | TTL | Invalidation |
|----------|-----|--------------|
| GET /notes | 5min | Sur POST/PUT/DELETE notes |
| GET /notes/:id | 2min | Sur PUT/DELETE note |

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


