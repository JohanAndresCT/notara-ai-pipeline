# Notara — Informe de Revisión del Proyecto

> **Investigación de solo lectura. Ningún archivo fue modificado.**
> Generado por el agente de investigación del workflow `wf_b43a0f87036f9ff1`.

---

## 1. Resumen Ejecutivo

**Notara** es una aplicación web responsiva académica que funciona como comunidad musical y gestor básico de partituras textuales. Está dirigida a estudiantes de música, músicos aficionados y profesores. El MVP 1 permite que usuarios autenticados publiquen, descubran, lean, comenten y reaccionen a partituras cortas en formato `.abc` o texto libre.

El proyecto no es solo una aplicación web: es también una **demostración de un pipeline de IA** que generó todos los artefactos del ciclo de vida del software de forma estructurada —contexto, visión, requisitos, planificación, UX, arquitectura e implementación— usando prompts de IA en cada etapa (P00–P10).

**Estado actual de implementación:** Se completó la fundación técnica (P06.1) y cuatro historias de usuario: registro (US-001), login/logout (US-002), gestión de perfil (US-003), y publicación de partituras (US-004). Todas están en estado `READY_WITH_REVIEW_GATES` —pendientes de aprobación del Product Owner y verificación completa en todos los navegadores/entornos.

**Historias pendientes de implementar:** US-005 (editar partituras), US-006 (eliminar partituras), US-007 (dashboard/filtrado), US-008 (detalle de partitura), US-009 (reacciones), US-010 (comentarios).

---

## 2. Propósito del Producto

### Problema que resuelve

Músicos estudiantes y aficionados necesitan un espacio simple para crear y compartir ideas musicales cortas sin depender de software de notación profesional complejo (MuseScore, Finale, Sibelius). La curva de aprendizaje de esas herramientas es una barrera para quien solo quiere anotar una idea rápida.

**Fuente:** `artifacts/00_context/PROJECT_CONTEXT.md` §2 y `artifacts/01_discovery/PRODUCT_VISION.md` §3.

### Solución

Una plataforma comunitaria donde usuarios crean o pegan partituras textuales (`.abc` o texto libre), las publican en un feed compartido, y otros músicos pueden verlas, comentarlas y reaccionar con likes.

**Lo que NO hace MVP 1** (explícitamente excluido): reproducción de audio, carga de imágenes, voz/OMR, roles diferenciados, recuperación de cuenta, edición/borrado de comentarios.

### Usuarios objetivo

| ID | Tipo | Descripción |
|---|---|---|
| USER-001 | Estudiante de música | Principiante/intermedio practicando lectura y ritmo |
| USER-002 | Músico aficionado | Sin acceso constante a un instructor |
| USER-003 | Profesor de música | Usa la herramienta como apoyo pedagógico |

**Fuente:** `artifacts/00_context/PROJECT_CONTEXT.md` §4.

---

## 3. Stack Tecnológico

### Backend

| Componente | Tecnología | Versión |
|---|---|---|
| Framework web | Django | 5.0.7 |
| API REST | Django REST Framework | 3.15.2 |
| Base de datos principal | PostgreSQL 16 | (via Docker) |
| Base de datos desarrollo | SQLite | (switchable) |
| Driver PostgreSQL | psycopg2-binary | 2.9.11 |
| Procesamiento de imágenes | Pillow | 11.3.0 |
| Variables de entorno | python-dotenv | 1.0.1 |
| Runtime | Python | 3.12+ |

### Frontend

| Componente | Tecnología | Versión |
|---|---|---|
| Framework UI | React | 18.3.1 |
| Lenguaje | TypeScript | 5.5.4 |
| Bundler/dev server | Vite | 5.4.2 |
| Runtime | Node.js | 20+ |

### Infraestructura

| Componente | Tecnología |
|---|---|
| Orquestación local | Docker Compose (`docker-compose.yml`) |
| Autenticación | Django session auth (cookies HTTP-only + CSRF) |
| Modelo de despliegue | Monolito modular — misma origin para frontend y API |

**Fuente:** `artifacts/05_architecture/ARCHITECTURE.md` §5 y `backend/requirements.txt`, `frontend/package.json`.

### Decisiones arquitectónicas clave (ADRs)

- **ADR-001:** Monolito modular (no microservicios) — menor carga operacional para equipo de 5 personas en un sprint.
- **ADR-002:** React + TypeScript con Django/DRF + PostgreSQL — separación clara frontend/backend con primitivas maduras.
- **ADR-003:** Autenticación por sesión Django (misma origin) — evita almacenar tokens en `localStorage`.
- **ADR-004:** Contenido de partituras en columna de texto en PostgreSQL (máx. 1,000 chars) — sin almacenamiento de objetos.
- **ADR-005:** La API es autoritativa para validación y propiedad.

---

## 4. Estructura del Proyecto

```
notara-ai-pipeline/
│
├── .env.example                    # Variables de entorno (plantilla)
├── .gitignore
├── docker-compose.yml              # PostgreSQL + backend + frontend
├── README.md
│
├── backend/                        # Django application
│   ├── manage.py
│   ├── requirements.txt
│   ├── notara_backend/             # Proyecto Django (settings, urls, wsgi, asgi)
│   │   ├── settings.py             # DB switchable: SQLite / PostgreSQL
│   │   └── urls.py                 # Rutas API registradas
│   ├── accounts/                   # Módulo: identidad y perfil
│   │   ├── models.py               # User (AbstractBaseUser) con email, name, main_instrument, photo
│   │   ├── views.py                # register, login, logout, current_user, profile_photo, change_password
│   │   ├── tests.py                # 22 tests (accounts)
│   │   └── migrations/             # 0001_initial, 0002_main_instrument_photo
│   └── scores/                     # Módulo: partituras
│       ├── models.py               # Score (owner, title, instrument, description, format, content)
│       ├── views.py                # scores_view (GET list + POST create) con validación ABC
│       ├── tests.py                # Tests de scores (total: 30 tests en accounts+scores)
│       └── migrations/
│
├── frontend/                       # React + TypeScript client
│   ├── package.json
│   ├── vite.config.ts              # Proxy /api -> :8000 (mismo origin en dev)
│   ├── src/
│   │   ├── App.tsx                 # Router manual por pathname
│   │   ├── RegistrationPage.tsx    # /register
│   │   ├── LoginPage.tsx           # /login
│   │   ├── HomePage.tsx            # / (feed básico)
│   │   ├── ProfilePage.tsx         # /profile
│   │   ├── ScoreCreatePage.tsx     # /scores/new
│   │   ├── lib/api.ts              # Cliente HTTP (fetch + CSRF)
│   │   └── styles.css
│   └── index.html
│
├── artifacts/                      # Salidas del pipeline de IA
│   ├── 00_context/                 # P00: PROJECT_CONTEXT.md, CONTEXT_VALIDATION.md
│   ├── 01_discovery/               # P01: PRODUCT_VISION.md, validación
│   ├── 02_requirements/            # P02: REQUIREMENTS.md v2.0, product_backlog.json
│   ├── 03_planning/                # P03: PRIORITIZATION.md, product_backlog.json
│   ├── 04_ux/                      # P04: UX_SPEC.md (9 pantallas), validación
│   ├── 05_architecture/            # P05: ARCHITECTURE.md, validación
│   └── 06_implementation/          # P06: IMPLEMENTATION_LOG.md + artefactos por US
│
├── prompts/                        # Prompts del pipeline de IA
│   ├── system/                     # SYSTEM_PROMPT.md, RELEASE_PLAN.md
│   ├── 00_context/ … 06_implementation/   # Prompts P00–P06
│   └── 07_testing/ … 10_evaluation/       # Prompts futuros P07–P10
│
└── .agents/tasks/                  # (este archivo — generado por el agente)
```

---

## 5. Las Etapas del Pipeline de IA (P00–P10)

Este proyecto utiliza un **pipeline de IA estructurado en fases**. Cada fase tiene su propio prompt en `prompts/` y genera artefactos en `artifacts/`. El pipeline cubre todo el ciclo de vida del software:

| Fase | Carpeta | Nombre | Estado | Artefacto principal |
|---|---|---|---|---|
| P00 | `00_context` | Contexto del Proyecto | `PASS_WITH_WARNINGS` | `PROJECT_CONTEXT.md` |
| P01 | `01_discovery` | Descubrimiento del Producto | `PASS` | `PRODUCT_VISION.md` |
| P02 | `02_requirements` | Ingeniería de Requisitos | `PASS` / `READY` | `REQUIREMENTS.md` v2.0 |
| P03 | `03_planning` | Planificación y Priorización | `PASS` / `READY` | `PRIORITIZATION.md` |
| P04 | `04_ux` | Especificación UX/UI | `PASS` / `READY` | `UX_SPEC.md` (9 pantallas) |
| P05 | `05_architecture` | Arquitectura | `READY_FOR_REVIEW` | `ARCHITECTURE.md` |
| P06 | `06_implementation` | Implementación | En progreso | `IMPLEMENTATION_LOG.md` |
| P07 | `07_testing` | Testing (prompts listos) | No iniciado | — |
| P08 | `08_cicd` | CI/CD (prompts listos) | No iniciado | — |
| P09 | `09_documentation` | Documentación (prompts listos) | No iniciado | — |
| P10 | `10_evaluation` | Evaluación (prompts listos) | No iniciado | — |

### Cómo funciona el pipeline

Cada fase toma como entrada los artefactos de la fase anterior. Existe un prompt de validación (`P0X_validation.md`) que puede rechazar o aprobar con advertencias el artefacto generado. Solo cuando una fase está en estado `PASS` o `READY` se procede a la siguiente. Esto simula un proceso de revisión por etapas asistido por IA.

---

## 6. Estado de Implementación Detallado

### Historias completadas (READY_WITH_REVIEW_GATES)

| Historia | Funcionalidad | Tests | Estado |
|---|---|---|---|
| P06.1 Foundation | Esqueleto técnico completo (Django + React + Docker) | Sintaxis Python OK | `READY_WITH_REVIEW_GATES` |
| US-001 (HU01) | Registro de usuario (email, nombre, contraseña ≥8 chars) | 8 tests | `READY_WITH_REVIEW_GATES` |
| US-002 (HU02) | Login y logout con sesión Django | 12 tests (4 auth) | `READY_WITH_REVIEW_GATES` |
| US-003 (HU03) | Perfil (nombre, instrumento, foto JPG/PNG, contraseña) | 22 tests | `READY_WITH_REVIEW_GATES` |
| US-004 (HU04) | Publicación de partitura `.abc` / texto plano | 30 tests totales | `READY_WITH_REVIEW_GATES` |

### Endpoints API implementados

Registrados en `backend/notara_backend/urls.py`:

```
GET/POST  /api/health/           — health check
GET       /api/csrf/             — obtiene token CSRF
POST      /api/auth/register/    — registro de usuario
POST      /api/auth/login/       — inicio de sesión
POST      /api/auth/logout/      — cierre de sesión
GET/PATCH /api/me/               — perfil del usuario actual
GET       /api/me/photo/         — foto de perfil (streaming)
POST      /api/me/password/      — cambio de contraseña
GET/POST  /api/scores/           — listar y crear partituras
```

**Nota:** La arquitectura (P05) especifica rutas `/api/v1/`, pero la implementación usa `/api/` sin versión. Esto está documentado como desviación conocida en el log de implementación.

### Pantallas React implementadas

| Página | Ruta | Componente |
|---|---|---|
| Home / feed básico | `/` | `HomePage.tsx` |
| Registro | `/register` | `RegistrationPage.tsx` |
| Login | `/login` | `LoginPage.tsx` |
| Perfil | `/profile` | `ProfilePage.tsx` |
| Crear partitura | `/scores/new` | `ScoreCreatePage.tsx` |

El router es manual (basado en `window.location.pathname`) en `App.tsx` — sin librería de routing. Esto es adecuado para el alcance actual pero deberá revisarse al agregar más rutas.

### Modelos de datos implementados

**User** (`backend/accounts/models.py`):
- `email` (único, normalizado a lowercase)
- `name` (CharField max 150)
- `main_instrument` (CharField max 100, opcional)
- `photo` (ImageField, opcional, almacenado en `media/`)
- `is_active`, `is_staff`, `date_joined`

**Score** (`backend/scores/models.py`):
- `owner` → FK a User (cascade)
- `title`, `instrument`, `description` (TextField)
- `score_format` (choices: `ABC` | `TEXT`)
- `content` (TextField max 1000 chars)
- `created_at`, `updated_at`
- Índice en `(-created_at, -id)` para ordenamiento newest-first

**Pendientes** (definidos en arquitectura, no implementados aún):
- `Comment` (id, score, author, body, created_at)
- `Like` (id, score, user, created_at — único constraint en score+user)

### Validación ABC implementada

En `backend/scores/views.py`, la función `_abc_validation_error()` verifica:
1. Que existan los campos `X:`, `T:`, `M:`, `L:`, `K:` en el contenido
2. Que haya al menos una línea musical válida (regex + patrón de notas)

Esto implementa exactamente BR-005 de los requisitos (P02).

### Historias pendientes de implementar (P0 priority)

| Historia | Funcionalidad | Prioridad |
|---|---|---|
| US-005 (HU05) | Editar partitura propia | P1 |
| US-006 (HU06) | Eliminar partitura propia | P1 |
| US-007 (HU07) | Dashboard con paginación y filtro por instrumento | P0 |
| US-008 (HU08) | Vista de detalle de partitura | P0 |
| US-009 (HU09) | Reacciones (likes) | P0 |
| US-010 (HU10) | Comentarios | P0 |

Las historias P0 (US-007–010) son las más críticas para demostrar el valor central del producto.

---

## 7. Equipo

| Miembro | Rol |
|---|---|
| Johan Andrés Ceballos Tabarez | Frontend / UX |
| Emanuel Rivas | Backend / Arquitecto de Software |
| David Urrego | Backend |
| Alejandro Rodríguez | Base de datos |
| Alejandro Zamorano | Tester / DevOps |

Proyecto académico, 5 personas, un sprint de 2 semanas (1–13 de octubre de 2026).

---

## 8. Requisitos Funcionales (Resumen P02)

| ID | Requisito | Estado |
|---|---|---|
| FR-001 | Registro de cuenta | Implementado (US-001) |
| FR-002 + FR-017 | Autenticación y acceso protegido | Implementado (US-002) |
| FR-003 + FR-004 | Perfil e cambio de contraseña | Implementado (US-003) |
| FR-005–009 | Publicación de partitura (validación, formatos) | Implementado (US-004) |
| FR-010 | Editar partitura propia | Pendiente (US-005) |
| FR-011 | Eliminar partitura propia | Pendiente (US-006) |
| FR-012 + FR-013 | Feed paginado y filtro por instrumento | Pendiente (US-007) |
| FR-014 | Vista de detalle de partitura | Pendiente (US-008) |
| FR-015 | Reacciones (like / unlike) | Pendiente (US-009) |
| FR-016 | Comentarios en partituras | Pendiente (US-010) |

---

## 9. Cómo Ejecutar el Proyecto

### Con SQLite (desarrollo rápido)
```bash
pip install -r backend/requirements.txt
$env:DJANGO_DB_ENGINE = "sqlite"
python backend/manage.py migrate
python backend/manage.py runserver 0.0.0.0:8000
# En otra terminal:
cd frontend && npm install && npm run dev
```
Abrir `http://localhost:5173`

### Con PostgreSQL (Docker)
```bash
docker compose up --build
```

---

## 10. Conclusiones y Recomendaciones

### ¿Qué está bien?

1. **Pipeline de IA bien estructurado.** Cada fase produce artefactos trazables con clasificación FACT/ASSUMPTION/UNKNOWN. Los requisitos (P02 v2.0) tienen cobertura completa de US/AC/BR/EdgeCases.
2. **Arquitectura sólida para el alcance.** Monolito modular, autenticación por sesión Django, PostgreSQL — decisiones correctas para un equipo académico de 5 personas en 2 semanas.
3. **Implementación de calidad.** El código real (models, views, tests) es limpio, bien comentado y alineado con los artefactos de diseño. 30 tests pasando.
4. **Seguridad básica cubierta.** CSRF, cookies HTTP-only, hash de contraseñas, validación server-side, sin SQL raw.

### Riesgos activos

1. **Tiempo.** Con el sprint ya en progreso (oct 2026), faltan 6 historias (incluyendo las 4 P0 críticas: feed, detalle, likes, comentarios) más los modelos Comment y Like. Es el riesgo más alto.
2. **Review gates pendientes.** Todas las historias completadas tienen aprobación del Product Owner pendiente. Si hay cambios solicitados, afecta el tiempo restante.
3. **Desviación de rutas API.** La arquitectura especifica `/api/v1/` pero la implementación usa `/api/`. Menor, pero debe documentarse si se hace pública la API.
4. **Router manual en frontend.** `App.tsx` usa `window.location.pathname` directamente. Funciona para el MVP pero es frágil —agregar rutas dinámicas (ej. `/scores/:id`) requerirá refactorización o adoptar React Router.
5. **Foto de perfil fuera del alcance original.** US-003 agregó foto de perfil (ImageField + Pillow), pero P02/P03 excluyen cargas de imágenes. Está documentado como pendiente de aprobación del PO.
6. **Comment y Like no modelados.** Los modelos para US-009 y US-010 aún no existen en el backend.

### Recomendaciones

1. **Priorizar US-007 y US-008 inmediatamente.** Sin feed/detalle, las partituras publicadas no son consumibles por la comunidad.
2. **Crear modelos Comment y Like lo antes posible.** Son prerequisito para US-009 y US-010.
3. **Adoptar React Router** antes de agregar rutas dinámicas con parámetros.
4. **Resolver la desviación `/api/` vs `/api/v1/`** — elegir una y actualizar frontend + documentación.
5. **Ejecutar la suite completa de tests con PostgreSQL** antes de la entrega final.

---

*Informe generado a partir de lectura directa de: `artifacts/00_context/PROJECT_CONTEXT.md`, `artifacts/01_discovery/PRODUCT_VISION.md`, `artifacts/02_requirements/REQUIREMENTS.md`, `artifacts/03_planning/PRIORITIZATION.md`, `artifacts/04_ux/UX_SPEC.md`, `artifacts/05_architecture/ARCHITECTURE.md`, `artifacts/06_implementation/IMPLEMENTATION_LOG.md`, `backend/accounts/models.py`, `backend/accounts/views.py`, `backend/scores/models.py`, `backend/scores/views.py`, `backend/notara_backend/urls.py`, `frontend/src/App.tsx`, `frontend/package.json`, `backend/requirements.txt`, `docker-compose.yml`, `README.md`, `prompts/system/RELEASE_PLAN.md`.*
