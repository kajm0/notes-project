# Docker Configuration

Configuration Docker Compose pour l'application Notes.

## Services

- **postgres** : PostgreSQL 16 (port 5432)
- **redis** : Redis 7 pour le cache BFF (port 6379)
- **backend** : API Spring Boot (port 8080)
- **bff** : Backend-For-Frontend NestJS (port 4000)
- **frontend** : Application web React (port 8081)

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

- **8081** : Frontend React (http://localhost:8081)
- **4000** : BFF NestJS (http://localhost:4000)
- **8080** : Backend Spring Boot (http://localhost:8080)
- **5432** : PostgreSQL
- **6379** : Redis

## Accès aux services

- **Application Web** : http://localhost:8081 ou http://127.0.0.1:8081
- **API BFF** : http://localhost:4000/api
- **API Backend** : http://localhost:8080/api

## Volumes persistants

- `postgres_data` : Données PostgreSQL
- `redis_data` : Données Redis


