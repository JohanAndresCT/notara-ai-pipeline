# Análisis de pruebas - P07

## 1. Metadatos

- Proyecto abierto: `c:\Users\aleja.DESKTOP-J7B21IN\OneDrive\Desktop\notara-ai-pipeline\notara-ai-pipeline`
- Ruta absoluta confirmada del repositorio: `c:\Users\aleja.DESKTOP-J7B21IN\OneDrive\Desktop\notara-ai-pipeline\notara-ai-pipeline`
- Rama actual confirmada: `Arch-Front-end` (leída desde `.git/HEAD` como `ref: refs/heads/Arch-Front-end`)
- Fecha del análisis: 2026-10-13
- Input prompt del sistema: `ai-pipeline/prompts/system/SYSTEM_PROMPT.md`
- Prompt analizado: `ai-pipeline/prompts/07_testing/P07_test_analysis.md`
- Estado del análisis: `READY_WITH_WARNINGS`

## 2. Alcance implementado



- `backend/accounts/tests.py`
- `backend/scores/tests.py`

El código y las pruebas existentes cubren principalmente:

- Registro de usuarios y sesión autenticada.
- Login / logout con validación CSRF.
- Perfil de usuario, edición, foto, contraseña y estadísticas.
- Publicación, detalle, edición, eliminación, reacción, comentario y like de scores.
- Feed con filtros, paginación y autorización por propietario.

No se inspeccionaron carpetas superiores ni copias alternas; la evidencia utilizada corresponde únicamente al repositorio abierto.

## 3. Herramientas, configuración y ejecución real

### Backend

- Framework: Django 5.2.1
- API: Django REST Framework 3.15.2
- Base de datos por defecto: PostgreSQL (`notara_backend/settings.py`), con override para SQLite en pruebas locales si se configura `DJANGO_DB_ENGINE=sqlite`.
- Autenticación: sesión de Django + `SessionAuthentication` de DRF.
- Archivos relevantes:
  - `backend/requirements.txt`
  - `backend/notara_backend/settings.py`
  - `backend/manage.py`

### Frontend

- Framework: React 19 + Vite 8
- Estilo: Tailwind CSS v4
- Script principal del front: `frontend/package.json`

### Evidencia de pruebas existentes

- `backend/accounts/tests.py`: 25 pruebas definidas
- `backend/scores/tests.py`: 61 pruebas definidas
- Total verificado por inspección: 86 pruebas de Django dentro de estas dos apps.

### Restricciones de ejecución

Este análisis es de tipo read-only y no modifica código ni dependencias. No se ejecutó ni la suite Django ni migraciones ni pruebas del navegador, y no se hizo ninguna instalación de paquetes. La evaluación se apoya en la inspección de pruebas existentes y la configuración del proyecto.

## 4. Cobertura actual y limitaciones de evidencia

### Cobertura observada

#### `accounts`

La suite de `accounts` comprueba:

- Creación de usuario con hash y sesión autenticada.
- Rechazo de correos duplicados, emails inválidos, campos obligatorios y contraseñas cortas.
- Requerimiento de CSRF para registro y acceso protegido.
- Login correcto y manejo de credenciales incorrectas.
- Logout con invalidación de sesión.
- Perfil con nombre, username, instrumento principal, foto y estadísticas de likes/score count.
- Actualización y validación de photo uploads, incluyendo tipos de archivo, tamaños y limpieza de archivos antiguos.
- Validación de contraseña con protección de sesión y requisitos mínimos.

#### `scores`

La suite de `scores` comprueba:

- Publicación autenticada de scores en texto y ABC.
- Feed con filtros por instrumento, paginación y soporte de `mine=1`.
- Validación de campos obligatorios, formatos no soportados, tamaños de contenido y estructura ABC.
- Lectura, edición y eliminación de scores con control de propietario.
- Reacciones y toggle de like con conteo y persistencia.
- Comentarios con validación y permisos.
- Casos de autorización, CSRF y recursos inexistentes.

### Limitaciones reales

- No se encontró evidencia de una trazabilidad formal por IDs de requisito (`FR`, `US`, `AC`) dentro del repositorio abierto; el análisis usa la funcionalidad implementada como base de trazabilidad operativa.
- No se validó integración frontend/backend real mediante navegador.
- No se documentan pruebas de regresión cross-browser o de carga.
- La suite existente no incluye pruebas de despliegue ni CI/CD en esta etapa.

## 5. Tabla de trazabilidad

| Requisito / criterio funcional | Fuente observada | Prueba existente | Brecha / observación | Prioridad |
|---|---|---|---|---|
| Registro de cuenta | `backend/accounts/tests.py` | `RegistrationTests` | Cobertura sólida de campos, duplicado, CSRF y sesión. | Alta |
| Autenticación y cierre de sesión | `backend/accounts/tests.py` | `AuthenticationTests` | Muestra comportamiento consistente para login/logout y errores genéricos. | Alta |
| Perfil y foto | `backend/accounts/tests.py` | `ProfileManagementTests` | Cubre normas de actualización, validaciones y seguridad de fotos. | Alta |
| Publicación de score | `backend/scores/tests.py` | `ScorePublicationTests` | Cubre texto y ABC, validaciones y requisitos de autenticación. | Alta |
| Edición y detalle de score | `backend/scores/tests.py` | `ScoreEditTests` | Buen nivel de validación de permisos y validación parcial. | Alta |
| Eliminación de score | `backend/scores/tests.py` | `ScoreDeleteTests` | Cobertura de autor, CSRF y 404. | Alta |
| Reacciones | `backend/scores/tests.py` | `ScoreReactionTests` | Cobertura útil de toggle, conteo y permisos. | Alta |
| Comentarios y likes | `backend/scores/tests.py` | Clases de comentarios/likes | Hay evidencia concreta, pero la trazabilidad formal de requisitos no se documenta en el repositorio. | Media |
| Feed y paginación | `backend/scores/tests.py` | `ScorePublicationTests`, `ScoreEditTests` | Cobertura relevante y consistente con filtros por instrumento y `mine=1`. | Alta |
| Frontend integration / UX | No evidencia de pruebas E2E | No hay suite front-end real | Gaps de integración browser-level y navegación. | Media |

## 6. Riesgos clasificados

### Product / behavior risks

- El requisito formal no aparece documentado con IDs de historia/criterio en la rama actual.
- La lógica de negocio está validada en backend pero no siempre se valida con UX real en navegador.

### Test risks

- La suite no incluye pruebas end-to-end de frontend.
- Las validaciones están centradas en apps concretas, no en red full-stack.

### Requirements risks

- Hay funcionalidad implementada con cobertura real, pero no siempre hay una relación explícita a requisitos formales en el proyecto abierto.

### Environment risks

- El backend por defecto apunta a PostgreSQL; los entornos locales pueden requerir configuración específica.
- El proyecto usa `DJANGO_SECRET_KEY` y variables de entorno que deben configurarse correctamente.

## 7. Suposiciones y desconocidos

- Se asume que el repositorio abierto es la fuente de verdad para el proyecto actual.
- No se dispone de un archivo de requisitos formal con IDs `FR/US/AC` en la rama actual para mapear a cada caso de prueba.
- No se documentan errores no reproducibles ni bloqueos del entorno en esta etapa.
- No se ejecutó la suite de pruebas; el análisis se basa en la inspección de archivos y en la evidencia declarada por los tests existentes.

## 8. Estado y acción siguiente

El estado del análisis es `READY_WITH_WARNINGS` porque existe evidencia real y útil de cobertura, pero la trazabilidad formal de requisitos y la validación de integración navegador no están completamente cerradas.

Siguiente acción recomendada: generar la suite de pruebas o ampliaciones de pruebas desde los escenarios de mayor riesgo y mejor reproducibilidad, priorizando:

1. Registro / login / sesión.
2. Perfil / foto / contraseña.
3. Públicación / edición / eliminación de scores.
4. Reacciones y comentarios.
5. Seguridad y CSRF.

