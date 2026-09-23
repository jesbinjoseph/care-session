# Deployment readiness checklist

Use this checklist during the workshop. Record command output or screenshots as evidence rather than marking an item complete from memory.

## Local workshop readiness

- [ ] Docker daemon is running.
- [ ] Docker Compose v2 is available.
- [ ] Required ports are free.
- [ ] Both CARE repositories are cloned from the intended branch.
- [ ] `.env` was copied from `.env.example`.
- [ ] Frontend local API configuration was copied into `care_fe`.
- [ ] `docker compose config` succeeds.
- [ ] PostgreSQL is healthy.
- [ ] Redis is healthy.
- [ ] MinIO is healthy.
- [ ] Beat completed migrations and synchronization and is healthy.
- [ ] Backend health endpoint succeeds.
- [ ] Frontend returns an HTTP response.
- [ ] Worker is running.
- [ ] Beat is running and healthy.
- [ ] Django system check succeeds.
- [ ] Synthetic fixtures load successfully.
- [ ] A synthetic clinical workflow succeeds.
- [ ] A test file can be uploaded and retrieved.
- [ ] A background task is visible in worker logs.
- [ ] Stop and restart preserve local data.
- [ ] Destructive reset behavior is understood.

## Production discussion gates

These are discussion prompts only; the local stack does not satisfy them.

- [ ] Capacity assumptions and headroom are documented.
- [ ] DNS, TLS, routing, and ownership are defined.
- [ ] Database availability, backups, and restore tests meet objectives.
- [ ] Object-storage recovery and lifecycle policies are defined.
- [ ] Secrets and rotation procedures are managed.
- [ ] Workload identities follow least privilege.
- [ ] Release artifacts are pinned and approved.
- [ ] Logs, metrics, alerts, and runbooks are operational.
- [ ] Rollback and recovery procedures are tested.
- [ ] Operators and escalation owners are assigned.
