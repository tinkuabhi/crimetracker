# Indian Crime Tracker

A learning project for monitoring incident reports across India. It uses a React dashboard, an Express API, optional MongoDB Atlas persistence, and an optional Gemini-powered ingestion worker.

## Architecture

```text
Browser
  │
  ├── Frontend (React + Vite / static web server)
  │       │  /api and /records
  │       ▼
  └──── Backend API (Express) ─── MongoDB Atlas (optional)
                  ▲
                  │ POST /records
           AI Fetcher (Python scheduled worker)
```

The frontend and backend are independently deployable. The AI fetcher is a batch worker, so in Kubernetes it should run as a `CronJob`, not as a permanently running web service.

## Repository layout

```text
frontend/             React + Vite user interface
  src/                Screens, components, styles, and utilities
backend/              Express REST API and Python ingestion worker
  server.ts           API entry point
  ai_fetcher.py       Scheduled Gemini ingestion script
  .env.example        Backend configuration template
shared/               Types and seed data used by frontend and backend
package.json          npm workspace commands
```

## Prerequisites

- Node.js 20 or later
- npm 10 or later
- Python 3.10 or later (only for `ai_fetcher.py`)
- A MongoDB Atlas connection string (optional)
- A Gemini API key (only for live AI ingestion)
- Docker and a Kubernetes cluster (only for container deployment)

## Local development

### 1. Install JavaScript dependencies

From the repository root:

```bash
npm install
```

### 2. Configure the backend

Copy the template and edit the new file:

```bash
copy backend\.env.example backend\.env
```

On macOS or Linux:

```bash
cp backend/.env.example backend/.env
```

Minimum configuration:

```dotenv
# Optional: enables live AI ingestion
GEMINI_API_KEY="your-key"

# Optional: without this the API uses in-memory data
MONGODB_URI="mongodb+srv://..."

# Used by the Python fetcher
BACKEND_API_URL="http://localhost:3000/records"
```

Never commit `backend/.env`, API keys, or database credentials.

The credentials belong only in `backend/.env`—not in `frontend/`, React source files, or `VITE_*` variables, because frontend variables are visible to every browser user. After changing `backend/.env`, restart the backend with `npm run dev:backend`. With both values configured, MongoDB stores records persistently and the **Fetch updates** button can use Gemini for ingestion.

### 3. Start the API

```bash
npm run dev:backend
```

The API starts on `http://localhost:3000` by default. Set `PORT` to use another port.

### 4. Start the frontend

In a second terminal:

```bash
npm run dev:frontend
```

Open the URL printed by Vite, normally `http://localhost:5173`.

During development, Vite proxies `/api` and `/records` requests to `http://localhost:3000`; no browser-side API URL needs to be hard-coded.

### 5. Run the optional AI fetcher

Create and activate a virtual environment, then install the Python packages used by the script:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install google-genai python-dotenv requests
cd backend
python ai_fetcher.py
```

On macOS or Linux, activate it with `source .venv/bin/activate`.

The fetcher needs `GEMINI_API_KEY` and posts new records to `BACKEND_API_URL`. Run it from `backend/` so it loads `backend/.env`, or supply those values through your shell/Kubernetes Secret.

## API reference

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/health` | Service and storage status |
| `GET` | `/api/records` | List incidents; supports filtering and pagination |
| `POST` | `/api/records` | Add one incident or an array of incidents |
| `GET` | `/api/stats` | Aggregated incident statistics |
| `GET` | `/api/safety-tips` | Citizen safety-tip data |
| `POST` | `/api/contact` | Submit a contact message |
| `POST` | `/api/trigger-fetch` | Trigger the server-side ingestion flow |

`/records` is also supported as an alias for the records GET and POST endpoints, which is useful for the Python fetcher.

Example:

```bash
curl http://localhost:3000/api/health
curl "http://localhost:3000/api/records?state=Telangana&limit=20"
```

## Quality checks and builds

```bash
# Type-check frontend and backend
npm run lint

# Build both applications
npm run build
```

Build output is created in `frontend/dist/` and `backend/dist/`.

## Docker image plan

Build three separate images when you add Dockerfiles:

| Image | Build context | Runtime responsibility |
|---|---|---|
| `crime-tracker-frontend` | Repository root | Serve the compiled React application, normally through Nginx |
| `crime-tracker-backend` | Repository root | Run the Express API |
| `crime-tracker-ai-fetcher` | Repository root | Execute `ai_fetcher.py` once and exit |

Use the repository root as the Docker build context because both the frontend and backend import files from `shared/`.

> This repository currently contains the application source and workspace build scripts; Dockerfiles and Kubernetes manifests have not yet been added. Add and test those files before running the image commands in your registry or cluster.

## Kubernetes deployment model

| Component | Kubernetes resource | Replicas / schedule | Exposure |
|---|---|---|---|
| Frontend | `Deployment` + `Service` | 2+ replicas | Public through an `Ingress` |
| Backend API | `Deployment` + `ClusterIP Service` | 2+ replicas | Internal; reachable by frontend/Ingress |
| AI fetcher | `CronJob` | e.g. every 3 hours | Internal only |
| MongoDB Atlas | Managed external service | N/A | Private outbound connection |

Recommended request flow:

```text
Internet → Ingress → frontend service
                  └→ backend service (/api and /records)

CronJob → backend service (/records) → MongoDB Atlas
```

### Kubernetes configuration

Keep sensitive values in a Secret:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: crime-tracker-secrets
type: Opaque
stringData:
  MONGODB_URI: "mongodb+srv://<user>:<password>@<cluster>/indian_crime_tracker"
  GEMINI_API_KEY: "replace-with-a-real-key"
```

The backend Deployment and fetcher CronJob should load these values using `env.valueFrom.secretKeyRef`. Configure `BACKEND_API_URL` in the CronJob as the backend Service DNS name, for example:

```text
http://crime-tracker-backend.default.svc.cluster.local:3000/records
```

Set the CronJob `concurrencyPolicy` to `Forbid`, use `restartPolicy: OnFailure`, and make the fetcher idempotent because scheduled tasks can be retried.

For the frontend, route `/api` and `/records` to the backend Service in your Ingress or web-server configuration. This preserves the same relative URLs used during local development.

## Production checklist

- [ ] Store secrets only in Kubernetes Secrets or a managed secret store.
- [ ] Use MongoDB Atlas in production; the in-memory store is erased whenever a backend pod restarts.
- [ ] Add readiness and liveness probes to the backend using `/api/health`.
- [ ] Add resource requests and limits to all containers.
- [ ] Use versioned image tags, not only `latest`.
- [ ] Restrict MongoDB Atlas network access to your cluster's outbound addresses.
- [ ] Configure TLS on the Ingress.
- [ ] Add logging, monitoring, and error alerts.
- [ ] Test the fetcher manually as a Kubernetes `Job` before enabling its `CronJob` schedule.

## Learning path

1. Run frontend and backend locally.
2. Connect MongoDB Atlas and confirm data survives a backend restart.
3. Containerize and run each image locally with Docker.
4. Deploy the frontend and backend as Kubernetes Deployments.
5. Add the fetcher as a manually triggered Job.
6. Convert it to a CronJob after observing successful runs.
