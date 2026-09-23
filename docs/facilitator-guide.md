# Facilitator guide

## Learning objective

Participants should leave able to identify every CARE runtime component, explain the request and task flows, start the local stack, inspect failures, and distinguish the workshop setup from a production platform.

## Suggested 60-minute walkthrough

| Time | Activity |
|---:|---|
| 0–10 min | Explain the architecture diagram and shared backend image |
| 10–20 min | Clone repositories and review Compose services |
| 20–35 min | Build and start the stack; inspect startup order |
| 35–45 min | Load fixtures and complete a synthetic workflow |
| 45–52 min | Follow a request, upload, worker task, and scheduled task in logs |
| 52–57 min | Explain backend plugs and rebuild behavior |
| 57–60 min | Complete the readiness checklist and teardown |

## Demonstration sequence

1. Display `docs/architecture.svg`.
2. Run `docker compose config --services`.
3. Point out that backend, worker, Beat, and init share one build definition.
4. Run `docker compose up -d --build --wait`.
5. Run `docker compose ps -a` and explain why init exits successfully.
6. Verify frontend and backend endpoints.
7. Load fixtures and use only synthetic data.
8. Tail backend and worker logs while completing a workflow.
9. Show `ADDITIONAL_PLUGS=[]` and explain build-time installation.
10. Stop with `docker compose down` and explain preserved volumes.
11. Explain that `docker compose down -v` is destructive.

## Questions participants should answer

- Which service receives browser API requests?
- Why do the worker and Beat use the same image as the backend?
- Which component transports asynchronous tasks?
- Which data belongs in PostgreSQL and which belongs in object storage?
- Why are plugs installed during the image build?
- What evidence shows the stack is healthy?
- Which controls are still required before production?

## Safety boundaries

- Use only local workshop credentials.
- Use only synthetic fixture data.
- Do not connect the stack to production databases, buckets, queues, or APIs.
- Do not paste real secret values into `.env` or plug configuration.
- Do not present this Compose file as a production deployment pattern.
