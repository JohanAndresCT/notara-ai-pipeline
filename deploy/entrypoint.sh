#!/bin/sh
set -eu

: "${PORT:?Railway must provide PORT}"
: "${DJANGO_SECRET_KEY:?Set DJANGO_SECRET_KEY in the Railway web service}"
: "${POSTGRES_HOST:?Set POSTGRES_HOST from the private Railway PostgreSQL service}"
: "${POSTGRES_DB:?Set POSTGRES_DB from the Railway PostgreSQL service}"
: "${POSTGRES_USER:?Set POSTGRES_USER from the Railway PostgreSQL service}"
: "${POSTGRES_PASSWORD:?Set POSTGRES_PASSWORD from the Railway PostgreSQL service}"

if [ "$(printf '%s' "${DJANGO_DEBUG:-True}" | tr '[:upper:]' '[:lower:]')" != "false" ]; then
  echo "DJANGO_DEBUG must be false in production" >&2
  exit 1
fi

stt_model_required="$(printf '%s' "${STT_MODEL_REQUIRED:-false}" | tr '[:upper:]' '[:lower:]')"
gunicorn_workers="${GUNICORN_WORKERS:-2}"
if [ "$stt_model_required" = "true" ]; then
  if [ "$gunicorn_workers" != "1" ]; then
    echo "STT_MODEL_REQUIRED=true requires GUNICORN_WORKERS=1 on the 1 GiB service" >&2
    exit 1
  fi
  gunicorn_worker_class=gthread
  gunicorn_threads="${GUNICORN_THREADS:-4}"
else
  gunicorn_worker_class=sync
  gunicorn_threads=1
fi

media_root="${MEDIA_ROOT:-/data/media}"
mkdir -p "$media_root"
chown app:app /data "$media_root"
gosu app python backend/manage.py check --deploy
gosu app python backend/manage.py migrate --noinput

envsubst '${PORT}' < /etc/nginx/templates/notara.conf.template > /etc/nginx/conf.d/default.conf
nginx -t

gosu app gunicorn notara_backend.wsgi:application \
  --chdir backend \
  --bind 127.0.0.1:8000 \
  --worker-class "$gunicorn_worker_class" \
  --workers "$gunicorn_workers" \
  --threads "$gunicorn_threads" \
  --timeout 120 \
  --access-logfile - \
  --error-logfile - &
gunicorn_pid=$!

cleanup() {
  kill "$gunicorn_pid" 2>/dev/null || true
  if [ -n "${nginx_pid:-}" ]; then
    kill "$nginx_pid" 2>/dev/null || true
  fi
}
trap cleanup INT TERM EXIT

attempt=0
until python -c 'import os; from urllib.request import Request, urlopen; host = os.environ["DJANGO_ALLOWED_HOSTS"].split(",", 1)[0].strip(); urlopen(Request("http://127.0.0.1:8000/api/v1/health/", headers={"Host": host, "X-Forwarded-Proto": "https"}), timeout=1)' >/dev/null 2>&1; do
  if ! kill -0 "$gunicorn_pid" 2>/dev/null; then
    wait "$gunicorn_pid" || true
    echo "Gunicorn exited before becoming ready" >&2
    exit 1
  fi
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 90 ]; then
    echo "Gunicorn did not become ready within 90 seconds" >&2
    exit 1
  fi
  sleep 1
done

nginx -g 'daemon off;' &
nginx_pid=$!
while kill -0 "$gunicorn_pid" 2>/dev/null && kill -0 "$nginx_pid" 2>/dev/null; do
  sleep 1
done

if ! kill -0 "$gunicorn_pid" 2>/dev/null; then
  wait "$gunicorn_pid" || status=$?
  echo "Gunicorn exited unexpectedly" >&2
  exit "${status:-1}"
fi

wait "$nginx_pid" || status=$?
echo "Nginx exited unexpectedly" >&2
exit "${status:-1}"
