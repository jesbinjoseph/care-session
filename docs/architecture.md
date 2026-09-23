# Architecture explanation

## Component relationships

CARE's frontend is a browser application. The participant accesses it through port `4000`. The browser sends API requests directly to the backend on port `9000`.

The backend owns synchronous application logic and communicates with three local dependencies:

1. **PostgreSQL** stores durable application and clinical records.
2. **Redis** provides caching and transports Celery tasks.
3. **Silo** provides local S3-compatible object storage for uploaded files.

The backend, worker, and Beat scheduler are built from the same CARE source and image:

- **Backend** serves HTTP API requests.
- **Worker** consumes queued tasks from Redis.
- **Beat** runs migrations, compiles messages, synchronizes permissions and value sets, marks itself healthy, and then publishes scheduled tasks to Redis.

## Plugs

Backend plugs are Python/Django extensions installed while the shared backend image is built. A plug can add models, API routes, and asynchronous tasks. Because it extends the application artifact, it appears inside the backend boundary rather than as an independent service.

Frontend apps can also be loaded through CARE's frontend application configuration, but they are outside the minimal backend-plug demonstration in this repository.

## Data paths

| Flow | Path |
|---|---|
| Login or clinical request | Browser → frontend → backend → PostgreSQL |
| Cached lookup | Backend → Redis |
| File upload | Browser → backend → Silo |
| Asynchronous task | Backend → Redis → worker |
| Scheduled task | Beat → Redis → worker |
| Plugin API | Browser → frontend → backend plug → normal CARE dependencies |

## Startup order

1. PostgreSQL, Redis, and Silo become healthy.
2. Beat applies migrations and synchronization commands, then becomes healthy.
3. Backend and worker start from the shared CARE image.
4. Frontend starts after the backend is healthy.
5. The user opens the frontend in a browser.

This order prevents application processes from serving requests against an uninitialized database.
