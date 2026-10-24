# Limitaciones conocidas y discrepancias

Lista de lo que Notara no hace, de lo que difiere de los requisitos y de lo que no se pudo verificar. Los IDs coinciden con `ai-pipeline/artifacts/09_documentation/DOCUMENTATION_REPORT.md`.

## Fuera del alcance del MVP

| ID | Elemento |
|---|---|
| FUT-001 / OOS-001 | Entrada por voz |
| FUT-002 / OOS-002 | Reconocimiento de imagen (OMR) |
| OOS-003 | Subida de imágenes |
| FUT-003 / OOS-004 | Reproducción o compartición de audio |
| OOS-005 | Gestión diferenciada de roles |
| Sin ID | Recuperación de cuenta y edición de comentarios (P03, `AC-028`) |

La notación ABC se valida de forma básica; no se renderiza como partitura.

## Discrepancias detectadas

| ID | Discrepancia | Estado |
|---|---|---|
| `P09-DISC-001` | Coexisten rutas `/api/` y `/api/v1/`; el frontend usa ambas (`deleteComment` usa la heredada). `IMPLEMENTATION_VALIDATION` afirma que todas usan `/api/v1/` | `REQUIRES_DECISION` |
| `P09-DISC-002` | `Reaction` y `Like` coexisten con conteos separados; la interfaz usa reacciones | `REQUIRES_DECISION` |
| `P09-DISC-003` | La API admite foto de perfil (excluida por `OOS-003`/MVP-003) y la interfaz no tiene control para subirla | `REQUIRES_DECISION` |
| `P09-DISC-004` | La pantalla de edición no cambia contenido ni formato; la API sí (FR-010) | `REQUIRES_DECISION` |
| `P09-DISC-005` | `.mise.toml`, Compose y los lockfiles no coincidían con `package.json`/Dockerfile/CI. Además coexistían `vite.config.js` (el que Vite elegía, sin Tailwind ni metadatos del sitio) y `vite.config.ts` | Resuelto (2026-10-24): `.mise.toml` y Compose usan Node 24 y pnpm 12.11.2, se eliminó `package-lock.json` y `vite.config.ts` es la única configuración |
| `P09-DISC-006` | Se puede reaccionar a la propia partitura (hay un test que lo afirma) y no se encontró bloqueo para comentarla; FR-015 y FR-016 dicen "otro usuario" | `REQUIRES_DECISION` |
| `P09-DISC-007` | Las vistas de detalle, reacciones y comentarios de `scores` usaban `@csrf_exempt` con autenticación por sesión | Resuelto (2026-10-24): se quitó `@csrf_exempt` y el middleware global valida CSRF. Una petición sin token recibe 403 antes de la comprobación de autenticación |
| `P09-DISC-008` | P08 registraba `NOT_DEPLOYED`; el despliegue ya tiene evidencia | Resuelto: artefactos P08 reconciliados |
| `P09-DISC-009` | Algunos artefactos citan `ai-pipeline/outputs/...` y otros `ai-pipeline/artifacts/...` | `UNKNOWN` |
| `P09-DISC-010` | Existe borrado de comentarios propios, pero `AC-028` dice que no estaría disponible | `REQUIRES_DECISION` |
| `P09-DISC-011` | US-005, US-006, US-009 y US-010 no tienen validación individual de P06 | `UNKNOWN` |
| `P09-DISC-012` | `VITE_API_BASE_URL` figura en `.env.example` sin uso en el código del frontend | `UNKNOWN` |

## Pendientes de despliegue (P08)

- Persistencia del volumen `/data` y copias de seguridad: sin verificar.
- Rollback: sin procedimiento verificado (las migraciones no son reversibles automáticamente).
- Protección del environment `production`: sin verificar.
- Redirección HTTP→HTTPS: sin verificar.
- `/admin/login/` accesible públicamente (`P08-VAL-006`).
- El job E2E falló en la ejecución #15 con el mismo SHA que pasó en la #14 (`P08-VAL-005`, causa `UNKNOWN`).
- `check --deploy` reportó 2 advertencias HSTS en P07/P08.

## Calidad y pruebas

- PostgreSQL local `NOT_RUN` en P07; solo CI lo ejecuta (sin auditoría de logs).
- Sin pruebas de rendimiento, accesibilidad ni unitarias de frontend.
- `vite build` muestra una advertencia sobre `@tailwind utilities`.
- El límite de 1000 caracteres del contenido solo se aplica en las vistas.
- La API devuelve mensajes en inglés (el frontend traduce los conocidos).
