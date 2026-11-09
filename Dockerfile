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
    STATIC_ROOT=/app/staticfiles \
    STT_DAILY_LIMIT=30 \
    STT_MODEL_ID=Systran/faster-whisper-base \
    STT_MODEL_SIZE=base \
    STT_MODEL_DIR=/opt/notara/models/whisper-base \
    STT_MODEL_REVISION=ebe41f70d5b6dfa9166e2c581c45c9c0cfc57b66 \
    STT_MODEL_MANIFEST=/app/backend/voice/model_sha256.json \
    STT_MODEL_REQUIRED=true \
    STT_DEVICE=cpu \
    STT_COMPUTE_TYPE=int8 \
    STT_LANGUAGE=es \
    STT_CPU_THREADS=2 \
    STT_MAX_CONCURRENT=1 \
    AUDIO_MAX_BYTES=2097152 \
    AUDIO_MAX_SECONDS=30 \
    GUNICORN_WORKERS=1 \
    GUNICORN_THREADS=4
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
RUN mkdir -p "$STT_MODEL_DIR" \
    && cd /app/backend \
    && python -m voice.provision_model --model-dir "$STT_MODEL_DIR" \
    && cd /app \
    && chmod -R a-w "$STT_MODEL_DIR" \
    && chown -R app:app "$STT_MODEL_DIR" \
    && DJANGO_DB_ENGINE=sqlite DJANGO_DEBUG=True python backend/manage.py collectstatic --noinput \
    && mkdir -p /data/media \
    && chown -R app:app /app /data
ENTRYPOINT ["/usr/local/bin/notara-entrypoint"]
