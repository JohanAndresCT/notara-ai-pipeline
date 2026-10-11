# Notara MVP Foundation

This repository contains the Notara MVP implementation foundation and the first
vertical story, account registration:

- Django + Django REST Framework backend
- React + TypeScript + Vite frontend
- PostgreSQL persistence via Docker Compose
- switchable SQLite database for local registration testing
- same-origin session authentication model for the MVP

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

## PostgreSQL / Docker

Copy `.env.example` to `.env`, keep `DJANGO_DB_ENGINE=postgresql`, and provide
deployment-appropriate secrets and database values. Then run:

```bash
docker compose up --build
```

The backend selects its database in `backend/notara_backend/settings.py` using
`DJANGO_DB_ENGINE`; both database choices use Django models and migrations.
Use `SQLITE_DB_PATH` to move the local SQLite file. Do not commit `.env` or
production credentials.

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
