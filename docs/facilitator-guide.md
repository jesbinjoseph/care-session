# Facilitator guide

## Session outcome

Participants should leave able to:

1. explain the CARE frontend, backend, and dependency roles;
2. distinguish the two CARE application images;
3. run and verify the local stack;
4. verify that the application and its dependencies work;
5. explain how the same roles become Kubernetes workloads and configuration;
6. map the same responsibilities to GCP;
7. make an evidence-based readiness decision.

The final artifact is one completed readiness checklist per team.

## Teaching sequence

Use this order:

```text
Understand CARE
  → Build the two CARE images
  → Run and verify locally
  → Introduce the same roles on Kubernetes
  → Map the same system to GCP
  → Decide readiness
```

Do not introduce Kubernetes or managed services before participants can explain the local system.

"Local" means a host controlled for development or training. It could be a workstation, VM, or server. CARE can run without Docker, but that requires the operator to install and manage the language runtimes, dependency services, process startup, and ports on the host. This workshop uses Docker for repeatability and isolation.

## Suggested 90-minute workshop

| Time | Activity |
|---:|---|
| 0–10 min | Start with CARE in a local environment and explain why the workshop uses Docker |
| 10–20 min | Explain the two CARE images and their build-time configuration |
| 20–30 min | Prepare the repositories and inspect the Compose roles |
| 30–45 min | Build and start the stack; inspect startup order |
| 45–58 min | Verify health and complete a synthetic workflow |
| 58–68 min | Inspect health, logs, and one prepared failure |
| 68–73 min | Introduce Services, Pods, Secrets, and ConfigMaps using the simple Kubernetes architecture |
| 73–78 min | Map local roles to the current and recommended GCP architectures |
| 78–87 min | Review production controls and complete the checklist |
| 87–90 min | Record go, conditional go, or no-go |

For a 60-minute delivery, prepare a running stack in advance and demonstrate the build command without waiting for a clean build.

## The two CARE images

CARE has two application images:

| Image | Source repository | Build inputs | Runtime responsibility |
|---|---|---|---|
| Frontend | `ohcnetwork/care_fe` | Frontend `REACT_*` build variables | Nginx serves the generated static files |
| Backend | `ohcnetwork/care` | `ADDITIONAL_PLUGS` build argument | API, Celery worker, and Celery Beat |

The local database, S3-compatible storage, and cache/task broker are dependencies. Do not describe them as CARE application images.

### Frontend explanation

The frontend Dockerfile has two stages:

1. Node installs dependencies and runs the frontend build.
2. The final Nginx stage copies and serves the generated HTML, JavaScript, and CSS.

The build reads values from `care_fe/.env.production.local`. `REACT_CARE_API_URL` must be the URL reachable by the participant's browser. In the workshop it is `http://localhost:9000`; an internal Compose hostname would not work in the browser.

A frontend build-variable change requires a new frontend image.

### Backend explanation

The backend Dockerfile receives `ADDITIONAL_PLUGS` during the image build. The build parses the JSON list, downloads the selected plug packages, and installs them into the image.

API, worker, and Beat run the same backend image with different entry points. They must contain the same plug set. Changing the plug list requires a new backend image.

Do not place secret values in `ADDITIONAL_PLUGS`. Deliver secrets through the runtime secret mechanism.

## Demonstration sequence

1. Display `docs/architecture.svg`.
2. Ask participants to identify the two CARE images and the supporting dependency roles.
3. Explain the frontend and backend image builds.
4. Run `docker compose config --services`.
5. Run `docker compose up -d --build --wait`.
6. Run `docker compose ps -a`.
7. Show that Beat becomes healthy after migrations and synchronization.
8. Verify frontend, backend, and Django checks.
9. Load fixtures and use only synthetic data.
10. Complete one synthetic workflow and inspect the relevant health and log evidence.
11. Open `docs/kubernetes-local-architecture.md` and identify Services, Pods, Secrets, ConfigMaps, and the two image boundaries.
12. Open `docs/local-to-gcp.svg` and map each role to GCP.
13. Open `docs/gcp-current-architecture.md` and identify the current GKE workloads and managed dependencies.
14. Open `docs/gcp-managed-architecture.md` and identify the recommended managed-service change.
15. Complete `docs/readiness-checklist.md`.
16. Stop with `docker compose down` and explain that volumes remain.

## Questions participants should answer

- Which image produces the browser application?
- When is the backend API URL added to the frontend?
- Why does changing a frontend build variable require a rebuild?
- Why do API, worker, and Beat use the same backend image?
- When are backend plugs installed?
- Which startup operations does Beat perform?
- Which dependency stores structured records?
- Which dependency stores files through the S3 API?
- Which dependency transports asynchronous tasks?
- What evidence shows the application is healthy?
- Which controls are still required before production?

## Presenter prompts by section

### Local architecture

Say: "We first care about responsibilities, not products. CARE needs a database, S3-compatible storage, and a cache and task broker."

Ask participants to distinguish CARE application images from supporting dependencies.

### Build

Say: "CARE itself produces two images. The frontend image contains static files served by Nginx. The backend image runs three process roles."

Show the frontend build environment and the backend plug list separately.

### Verification

Ask for evidence, not impressions. A running container does not prove that login, file storage, or background work succeeds.

### GCP transition

Say: "The CARE responsibilities stay the same. GCP changes how those responsibilities are hosted and operated."

First use the simple Kubernetes architecture to introduce Services, Pods, Secrets, and ConfigMaps. Then compare the current OpenTofu implementation with the recommended managed-services target.

Map:

```text
Local database        → Cloud SQL
S3-compatible storage → GCS buckets
Local cache/broker    → Memorystore
Frontend/backend      → GKE workloads
Local images          → Artifact Registry
```

### Readiness decision

Require each team to state its decision, strongest evidence, and largest open risk. Treat an unknown critical gate as no-go until evidence exists.

## Build-time and runtime configuration

Keep this distinction visible throughout the workshop:

| Build-time input | Effect |
|---|---|
| Frontend `REACT_*` variables | Baked into the static frontend files |
| `REACT_CARE_API_URL` | Tells the browser where to reach the backend API |
| Backend `ADDITIONAL_PLUGS` | Selects and installs plugs into the backend image |

Runtime backend configuration includes database, S3, cache/broker, secrets, and integration endpoints. Runtime secret values must not be embedded in either application image.

## Demo fallback plan

If a clean build is too slow or fails:

1. preserve the participant's error output;
2. move the pair to a working machine or prebuilt facilitator stack;
3. continue health checks, application verification, and evidence collection;
4. return to the build failure during troubleshooting time.

Do not let a slow image download consume the architecture and verification portions of the session.

## Safety boundaries

- Use only local workshop credentials.
- Use only synthetic fixture data.
- Do not connect to production databases, buckets, queues, or APIs.
- Do not paste real secrets into `.env` or plug configuration.
- Do not present the Compose file as a production deployment pattern.
- Confirm before running `docker compose down -v`; it deletes local state.
