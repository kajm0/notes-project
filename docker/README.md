# Docker Configuration

Configuration Docker Compose pour l'application Notes.

## Services

- **postgres** : PostgreSQL 16 (port 5432)
- **redis** : Redis 7 pour le cache BFF (port 6379)
- **backend** : API Spring Boot (port 8080)
- **bff** : Backend-For-Frontend NestJS (port 4000)
- **frontend** : Application web React (port 3000)

## Démarrage

```bash
docker compose up -d
```

## Arrêt

```bash
docker compose down
```

## Arrêt avec suppression des volumes

```bash
docker compose down -v
```

## Logs

```bash
# Tous les services
docker compose logs -f

# Service spécifique
docker compose logs -f backend
```

## Rebuild

```bash
docker compose up -d --build
```

## Variables d'environnement

Les variables sont définies dans le fichier `docker-compose.yml`.
Pour la production, utilisez un fichier `.env` externe.

## Ports

- 3000 : Frontend React
- 4000 : BFF NestJS
- 8080 : Backend Spring Boot
- 5432 : PostgreSQL
- 6379 : Redis

## Volumes persistants

- `postgres_data` : Données PostgreSQL
- `redis_data` : Données Redis

