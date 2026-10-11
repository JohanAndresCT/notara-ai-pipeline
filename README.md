# Notara MVP Foundation

This repository contains the Notara MVP implementation foundation for the approved architecture:

- Django + Django REST Framework backend
- React + TypeScript + Vite frontend
- PostgreSQL persistence via Docker Compose
- same-origin session authentication model for the MVP

## Repository layout

```text
backend/            Python Django app
frontend/           React + TypeScript client
artifacts/06_implementation/   Implementation stage outputs
```

## Quick start

1. Copy `.env.example` to `.env` and adjust values.
2. Start the supporting Postgres database:

```bash
docker compose up db -d
```

3. Install backend dependencies:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

4. Install frontend dependencies in a separate terminal:

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

## Notes

This stage creates the technical foundation only. It intentionally avoids implementing user stories or business flows beyond the minimal application shell required to support incremental feature work.
