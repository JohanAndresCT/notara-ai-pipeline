# Guía de preparación de despliegue - Railway

## Estado

`DEPLOYED_AND_VERIFIED` (alcance limitado, revalidado 2026-10-14): https://notara-production.up.railway.app responde health (`/api/health/` 200), SPA, 401 en API sin sesión y cookie CSRF `Secure`. El despliegue lo hizo el job `deploy-railway` (runs `38481851856` y `38610251114`, rama `pruebas-despliegue`, todos los pasos success). Pendientes: persistencia de medios en `/data`, backups, rollback y protección del Environment `production`. Ver `CICD_VALIDATION.md` sección 14. El texto de esta guía describe la preparación previa; los recursos Railway fueron creados por el equipo fuera de esta etapa y sus IDs no se registran aquí.

## Arquitectura preparada

Un servicio web Railway usa el `Dockerfile` raíz: Nginx sirve la SPA, reenvía `/api/` al Gunicorn/Django local y sirve `/static/`; PostgreSQL es un servicio Railway separado accesible solo por red privada. Las fotos de perfil continúan protegidas por el endpoint autenticado de Django; Nginx no publica `/media/`.

## Requisitos de aprovisionamiento manual

1. Crear un proyecto y un environment de producción en Railway.
2. Crear PostgreSQL 16 y un servicio web desde este repositorio; usar el Dockerfile raíz. Desactivar deploy-on-push/auto-deploy de una integración GitHub Railway: la única vía de release será el job CI que sube el checkout probado.
3. Conectar el web service a PostgreSQL por referencias privadas y definir `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT` desde los valores del servicio de DB. No habilitar TCP proxy público.
4. Crear un volumen persistente y montarlo en `/data` del servicio web. Su región/tamaño no se fija en código porque el proyecto no especifica región, presupuesto ni capacidad. Sin el volumen, `MEDIA_ROOT` es efímero.
5. Asignar/generar el dominio público Railway HTTPS y esperar a que Railway proporcione `RAILWAY_PUBLIC_DOMAIN`.
6. Configurar variables del servicio web:
   - `DJANGO_SECRET_KEY`: secreto aleatorio fuerte, exclusivo de producción.
   - `DJANGO_DEBUG=False`.
   - `DJANGO_DB_ENGINE=postgresql`.
   - Las cinco variables `POSTGRES_*` enlazadas al servicio PostgreSQL privado.
   - `MEDIA_ROOT=/data/media`.
   - `DJANGO_ALLOWED_HOSTS=<dominio Railway exacto>,healthcheck.railway.app`.
   - `DJANGO_CSRF_TRUSTED_ORIGINS=https://<dominio Railway exacto>`.
   - `PROFILE_PHOTO_MAX_BYTES=5242880` (o decisión aprobada).
   - `PORT`: no fijar manualmente; Railway lo proporciona.
   - Revisar los avisos de `manage.py check --deploy`: habilitar HSTS `includeSubDomains` y `preload` solo después de confirmar que todos los subdominios del dominio elegido deben ser HTTPS permanentes. No se activan automáticamente mientras el dominio sigue desconocido.
7. En el web service configurar healthcheck `/api/health/`; el proceso Nginx escucha `$PORT`. Verificar dominio y HTTPS antes de habilitar la automatización.
8. Crear GitHub Environment `production`; exigir aprobación humana y restringir la rama permitida.
9. Configurar GitHub repository variables: `RAILWAY_DEPLOY_ENABLED=true` solo cuando todo lo anterior esté probado; `RAILWAY_PRODUCTION_BRANCH` con el nombre exacto aprobado; `RAILWAY_PROJECT_ID`, `RAILWAY_ENVIRONMENT_ID`, `RAILWAY_SERVICE_ID` y `RAILWAY_PUBLIC_URL` (`https://...`). Guardar `RAILWAY_TOKEN` de alcance mínimo como secret del environment.
10. En la rama de producción, comprobar que los tres checks CI del mismo commit pasen. El job deploy espera a los tres, publica el checkout de ese SHA, espera el resultado final de Railway y sondea `/api/health/`.

## Migraciones, persistencia y operación

El entrypoint valida `DJANGO_DEBUG`, claves/variables de DB, ejecuta `manage.py check --deploy` y aplica migraciones antes de iniciar Gunicorn/Nginx. El deploy falla si una migración falla. No hay rollback automático de esquema; revisar migraciones incompatibles con datos y hacer backup antes de cambios destructivos.

El volumen `/data` contiene medios de perfil, no PostgreSQL. Configurar backups/retención de PostgreSQL y del volumen de medios en Railway según política aprobada y probar una restauración antes de producción. La estrategia/cadencia/RPO/RTO no están definidos en los artefactos actuales.

## Activación y rollback

El deploy está apagado por defecto: sin `RAILWAY_DEPLOY_ENABLED=true`, branch aprobado, IDs, URL, secret y environment protegido, el job no se ejecuta. Para activarlo, configurar primero cada requisito, ejecutar CI en el branch exacto y revisar la protección del environment.

Railway healthcheck comprueba disponibilidad durante el rollout; el workflow también solicita el endpoint de salud tras el deploy. Volúmenes montados pueden producir breve downtime en reemplazo. Rollback de código no revierte automáticamente migraciones ni datos: revisar el plan y respaldos antes de confirmar.

No se incluyeron IDs, dominios internos, tokens, regiones ni tamaños inventados. Esta etapa no creó proyecto, servicio, base de datos ni volumen; el despliegue lo realizó el equipo y se contrastó con metadatos de GitHub Actions y comprobaciones públicas.
