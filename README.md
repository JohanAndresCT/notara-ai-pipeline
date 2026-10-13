# Notara MVP Foundation

This repository contains the Notara MVP implementation foundation and the
community flow for textual scores:

- Django + Django REST Framework backend
- React + TypeScript + Vite frontend
- PostgreSQL persistence via Docker Compose
- switchable SQLite database for local registration testing
- same-origin session authentication model for the MVP
- PostgreSQL-backed scores, comments, and likes

## Repository layout

```text
backend/            Python Django app
frontend/           React + TypeScript client
artifacts/06_implementation/   Implementation stage outputs
```

## Local SQLite test setup

Install backend dependencies and create the local test database. `db.sqlite3`
is stored at the repository root and ignored by Git. The schema is managed by
the same Django migrations used with PostgreSQL.

```bash
python -m pip install -r backend/requirements.txt
$env:DJANGO_DB_ENGINE = "sqlite"
python backend/manage.py migrate
python backend/manage.py test accounts
python backend/manage.py runserver 0.0.0.0:8000
```

In a second terminal, start the frontend. Vite proxies `/api` to Django so the
browser uses same-origin requests and session cookies during local development.

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173/register` to create an account or
`http://localhost:5173/login` to sign in. Registration and login establish a
database-backed account session; logout returns to the public home screen.
Authenticated users can open `http://localhost:5173/profile` to update their
name and main instrument, upload a JPG/PNG photo, or change their password.
Authenticated users can publish `.abc` or plain-text scores at
`http://localhost:5173/scores/new`; saved scores appear in the home community
list.

## PostgreSQL / Docker

Copy `.env.example` to `.env`, keep `DJANGO_DB_ENGINE=postgresql`, and provide
deployment-appropriate secrets and database values. Then run:

```bash
docker compose up --build
```

Docker creates the `notara` PostgreSQL database and starts the backend and
frontend. The backend selects PostgreSQL in `backend/notara_backend/settings.py`
using `DJANGO_DB_ENGINE=postgresql`; migrations run automatically before the
backend starts. SQLite remains available only as a lightweight local/test
option. Do not commit `.env` or production credentials.

The published local services are:

- Frontend: `http://localhost:5173`
- Backend health check: `http://localhost:8000/api/health/`
- PostgreSQL: `localhost:5432` (database `notara`)

To run the backend tests against PostgreSQL inside Docker:

```bash
docker compose exec -T backend python backend/manage.py check
docker compose exec -T backend python backend/manage.py test accounts scores
```

The persistence layer includes `User`, `Score`, `Comment`, and `Like`. Scores
are ordered and paginated by ten, can be filtered by instrument, and use
database constraints to prevent duplicate likes. Deleting a score cascades to
its comments and likes.

Community API routes include:

- `GET /api/scores/` with `page` and `instrument` query parameters
- `GET|PATCH|DELETE /api/scores/<id>/`
- `POST /api/scores/<id>/comments/`
- `DELETE /api/comments/<id>/`
- `PUT|DELETE /api/scores/<id>/like/`

Profile photos use Django's storage backend and are stored locally under
`MEDIA_ROOT` by default (`media/`, ignored by Git). Set
`DJANGO_FILE_STORAGE_BACKEND` and `MEDIA_ROOT` for deployment storage. The
default upload safeguard is 5 MiB and can be changed with
`PROFILE_PHOTO_MAX_BYTES`.

## Registration files

- Backend account model and registration API: `backend/accounts/`
- Frontend registration page and API helper: `frontend/src/RegistrationPage.tsx`
	and `frontend/src/lib/api.ts`
- Database selection and session/CSRF settings:
	`backend/notara_backend/settings.py`
