FROM node:24-bookworm-slim AS frontend-build
WORKDIR /workspace
RUN corepack enable && corepack prepare pnpm@12.11.2 --activate
COPY frontend/package.json frontend/pnpm-lock.yaml ./frontend/
COPY .figma/make/site.json ./.figma/make/site.json
WORKDIR /workspace/frontend
RUN pnpm install --frozen-lockfile
COPY frontend/ ./
RUN pnpm build

FROM python:3.12-slim AS runtime
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_DB_ENGINE=postgresql \
    MEDIA_ROOT=/data/media \
    STATIC_ROOT=/app/staticfiles
RUN apt-get update \
    && apt-get install -y --no-install-recommends nginx gettext-base gosu \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system app \
    && useradd --system --gid app --home-dir /app --shell /usr/sbin/nologin app
WORKDIR /app
COPY backend/requirements.txt ./backend/requirements.txt
RUN python -m pip install --no-cache-dir -r backend/requirements.txt
COPY --chown=app:app backend/ ./backend/
COPY --from=frontend-build /workspace/frontend/dist/ /usr/share/nginx/html/
COPY docker/nginx.conf.template /etc/nginx/templates/notara.conf.template
COPY --chmod=755 deploy/entrypoint.sh /usr/local/bin/notara-entrypoint
RUN DJANGO_DB_ENGINE=sqlite DJANGO_DEBUG=True python backend/manage.py collectstatic --noinput \
    && mkdir -p /data/media \
    && chown -R app:app /app /data
ENTRYPOINT ["/usr/local/bin/notara-entrypoint"]
