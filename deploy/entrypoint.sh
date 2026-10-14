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
  --workers "${GUNICORN_WORKERS:-2}" \
  --access-logfile - \
  --error-logfile - &
gunicorn_pid=$!

nginx -g 'daemon off;' &
nginx_pid=$!
trap 'kill "$gunicorn_pid" "$nginx_pid" 2>/dev/null || true' INT TERM EXIT
wait "$nginx_pid"
