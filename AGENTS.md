# AGENTS.md

## Purpose

This repository is a training environment for running CARE locally with Docker Compose. Agents working here must preserve the small, understandable architecture and must not turn it into a production deployment template.

## Safety rules

- Use only local workshop credentials from `.env.example`.
- Use only synthetic fixture data.
- Never connect this stack to production databases, buckets, Redis instances, APIs, or credentials.
- Never read, print, commit, or overwrite a user's existing `.env`.
- Never run `docker compose down -v` unless the user explicitly requests deletion of local data.
- Do not commit the cloned `care/` or `care_fe/` repositories.
- Do not add a separate migration or init service. The current CARE `celery_beat.sh` performs migrations and synchronization before starting Beat.

## Required local layout

```text
care-session/
├── compose.yaml
├── .env.example
├── frontend.env.production.local
├── care/       # cloned from ohcnetwork/care develop
└── care_fe/    # cloned from ohcnetwork/care_fe develop
```

## Preflight

Run these checks before changing or starting the stack:

```bash
docker info
docker compose version
test -f compose.yaml
test -d care/.git
test -d care_fe/.git
```

If either source repository is missing, clone it:

```bash
git clone --depth 1 --branch develop https://github.com/ohcnetwork/care.git
git clone --depth 1 --branch develop https://github.com/ohcnetwork/care_fe.git
```

If `.env` is missing, create it without overwriting an existing file:

```bash
test -f .env || cp .env.example .env
```

Configure the frontend build:

```bash
cp frontend.env.production.local care_fe/.env.production.local
```

## Validate before starting

```bash
docker compose config --quiet
docker compose config --services
```

The service list must contain exactly these runtime roles:

- `db`
- `redis`
- `silo`
- `beat`
- `backend`
- `worker`
- `frontend`

## Build and start

```bash
docker compose up -d --build --wait
```

The backend, worker, and Beat share the `care-local-backend` image. Beat must become healthy before the backend and worker start. Its startup script performs database migrations, compiles messages, synchronizes permissions and value sets, writes `/tmp/healthy`, and then starts Celery Beat.

## Verify

Do not report success until every check has been run:

```bash
docker compose ps -a
curl -f http://localhost:9000/ping/
curl -I http://localhost:4000/
docker compose exec backend python manage.py check
```

Confirm:

- PostgreSQL, Redis, and Silo are healthy.
- Beat is healthy.
- Backend, worker, and frontend are running.
- Backend health returns success.
- Frontend returns an HTTP response.
- Django system checks pass.

If fixture data is required:

```bash
docker compose exec backend python manage.py load_fixtures
```

## Troubleshooting order

Inspect dependencies from the bottom up:

```bash
docker compose logs --tail=200 db
docker compose logs --tail=200 redis
docker compose logs --tail=200 silo
docker compose logs --tail=200 beat
docker compose logs --tail=200 backend
docker compose logs --tail=200 worker
docker compose logs --tail=200 frontend
```

Fix the first failing dependency before changing downstream services.

## Plugs

Backend plugs are installed at image build time through `ADDITIONAL_PLUGS`. Keep `ADDITIONAL_PLUGS=[]` unless the user specifies a plug. When adding a plug:

- Use the exact package documented by the plug.
- Pin a release or commit.
- Keep secrets out of the JSON value.
- Rebuild all backend roles:

```bash
docker compose build --no-cache backend worker beat
docker compose up -d --wait
```

## Stop behavior

Preserve data by default:

```bash
docker compose down
```

Only with explicit user approval, delete all local volumes:

```bash
docker compose down -v
```

## Documentation consistency

When changing a component or startup dependency, update all of:

- `compose.yaml`
- `README.md`
- `docs/architecture.md`
- `docs/architecture.svg`
- `docs/architecture.html`
- `docs/facilitator-guide.md`
- `docs/readiness-checklist.md`
- `docs/local-to-gcp.md` when the production mapping changes
