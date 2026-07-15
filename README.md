# Globalco Job Board

A full-stack job board application: post job listings, browse and search them by keyword, location, and job type.

## Architecture

```
job-board-assessment/
├── .github/workflows/ci-cd.yml   # CI: backend tests + frontend build, CD: Vercel deploy
├── frontend/                     # React 18 + Vite + React Router + TypeScript + Tailwind CSS
└── backend/                      # Spring Boot 3 REST API + MySQL
```

## Features

- **Browse jobs** — paginated list of open positions, newest first.
- **Search & filter** — full-text search across title/company/description, plus location and job-type filters.
- **Job details** — dedicated page per listing with full description, salary range, and posted date.
- **Post a job** — form-driven creation with client- and server-side validation.
- **Bulk upload** — upload a CSV of multiple jobs at once; valid rows are created and invalid rows are reported back with the line number and reason, without failing the whole batch.
- **REST API** — `GET/POST /api/jobs`, `GET/PUT/DELETE /api/jobs/{id}`, `POST /api/jobs/bulk-upload`, backed by MySQL via Spring Data JPA.

## Tech Stack

| Layer    | Technology                                  |
|----------|----------------------------------------------|
| Frontend | React 18, Vite, React Router, TypeScript, Tailwind CSS |
| Backend  | Spring Boot 3, Spring Data JPA, Bean Validation |
| Database | MySQL 8                                      |
| CI/CD    | GitHub Actions → Vercel (frontend) / your host of choice (backend) |

## Local Development

### Backend

Prerequisites: JDK 17, Maven, a running MySQL 8 instance.

```bash
cd backend
# Create the database and an app user (adjust credentials as needed):
mysql -u root -p -e "CREATE DATABASE job_board; CREATE USER 'jobboard_app'@'localhost' IDENTIFIED BY '<password>'; GRANT ALL ON job_board.* TO 'jobboard_app'@'localhost';"

# Set required env vars, then run:
export DB_USERNAME=jobboard_app
export DB_PASSWORD=<password>
mvn spring-boot:run
```

The API starts on `http://localhost:8080`. Environment variables (all have sane local defaults except `DB_PASSWORD`):

| Variable | Default | Purpose |
|---|---|---|
| `DB_HOST` | `localhost` | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_NAME` | `job_board` | Database name |
| `DB_USERNAME` | `jobboard_app` | Database user |
| `DB_PASSWORD` | — (required) | Database password |
| `PORT` | `8080` | API server port |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | Allowed frontend origin(s) |

Run tests (uses an in-memory H2 database, no MySQL required):

```bash
mvn test
```

### Frontend

Prerequisites: Node.js 20+.

```bash
cd frontend
cp .env.local.example .env.local   # points VITE_API_BASE_URL at the backend
npm install
npm run dev
```

The app starts on `http://localhost:5173` (Vite picks the next free port if it's taken).

## API Reference

| Method | Endpoint          | Description                          |
|--------|--------------------|---------------------------------------|
| GET    | `/api/jobs`        | List jobs; supports `keyword`, `location`, `type` query params |
| GET    | `/api/jobs/{id}`   | Get a single job                      |
| POST   | `/api/jobs`        | Create a job                          |
| PUT    | `/api/jobs/{id}`   | Update a job                          |
| DELETE | `/api/jobs/{id}`   | Delete a job                          |
| POST   | `/api/jobs/bulk-upload` | Create multiple jobs from an uploaded CSV file (`multipart/form-data`, field name `file`) |

`type` is one of `FULL_TIME`, `PART_TIME`, `CONTRACT`, `INTERNSHIP`, `REMOTE`.

### Bulk upload CSV format

Columns: `title`, `company`, `location`, `type`, `description` (required), `salaryRange` (optional). One job per row; a sample template is downloadable from the "Bulk Upload" page in the app.

The endpoint processes rows independently — valid rows are created, invalid rows (missing required field, unrecognized `type`) are skipped and reported in the response as `{ row, message }` with the 1-indexed CSV line number, so one bad row doesn't block the rest of the batch. Max upload size is 5MB.

## CI/CD

`.github/workflows/ci-cd.yml` runs on every push/PR to `main`:

1. **backend-tests** — runs the Spring Boot test suite with Maven (JDK 17, H2 in-memory DB).
2. **frontend-build** — lints and builds the Vite React app (Node 20).
3. **deploy-vercel** — on push to `main`, after both jobs pass, deploys the frontend to Vercel.

Required GitHub Actions secrets for deployment:

| Secret | Purpose |
|---|---|
| `VERCEL_TOKEN` | Vercel personal access token |
| `VERCEL_ORG_ID` | Vercel organization/team ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `VITE_API_BASE_URL` | Public URL of the deployed backend API |

The frontend is a single-page app: `frontend/vercel.json` sets the build/output directory and rewrites all routes to `index.html` so client-side routes like `/jobs/5` resolve correctly on Vercel.

The backend is a standard Spring Boot jar (`mvn package`) and can be deployed to any Java host (Render, Railway, Fly.io, etc.) with a MySQL add-on, using the same environment variables listed above.
