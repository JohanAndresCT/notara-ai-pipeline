# Plan de pruebas - P07

## 1. Metadatos

- Proyecto: Notara
- Ruta del repositorio: `c:\Users\aleja.DESKTOP-J7B21IN\OneDrive\Desktop\notara-ai-pipeline\notara-ai-pipeline`
- Rama actual: `Arch-Front-end`
- Estado del plan: `READY_WITH_WARNINGS`
- Base de análisis: `backend/accounts/tests.py`, `backend/scores/tests.py`

## 2. Matriz de ejecución

| Test ID | Source requirement | Scenario | Preconditions | Action | Expected observable result | Layer | Priority |
|---|---|---|---|---|---|---|---|
| TEST-ACC-01 | Registro de cuenta | Registro exitoso con email único | Usuario anónimo, CSRF válido | POST `/api/v1/auth/register/` con payload válido | 201, usuario creado con password hasheado y sesión autenticada | Backend | Alta |
| TEST-ACC-02 | Registro de cuenta | Email duplicado en mayúsculas/minúsculas | Usuario existente con correo `ada@example.com` | POST registro con `ADA@EXAMPLE.COM` | 400 con error de email duplicado y sin crear usuario extra | Backend | Alta |
| TEST-ACC-03 | Login / logout | Login correcto y sesión persistente | Usuario existente con password válido | POST `/api/v1/auth/login/` | 200, sesión creada y acceso a `/api/v1/me/` | Backend | Alta |
| TEST-ACC-04 | Login / logout | Credenciales inválidas con respuesta genérica | Usuario existente | POST login con password incorrecto y correo desconocido | 400 y mismo error genérico para ambos casos | Backend | Alta |
| TEST-ACC-05 | Perfil y seguridad | Cambiar nombre y username con validación | Usuario autenticado | PATCH `/api/v1/me/` con username limpio y nombre nuevo | 200, persistencia correcta y sanitización de username | Backend | Alta |
| TEST-ACC-06 | Perfil y foto | Carga de foto válida | Usuario autenticado, directorio temporal de media | PATCH con imagen JPEG/PNG | 200, foto guardada, URL de retorno y `Content-Type` correcto en endpoint de foto | Backend | Alta |
| TEST-ACC-07 | Perfil y foto | Rechazo de archivos no válidos o sobre tamaño | Usuario autenticado | PATCH con `*.gif` o foto > límite configurado | 400, sin guardar cambios de perfil ni foto | Backend | Alta |
| TEST-ACC-08 | Contraseña | Cambio válido con confirmación de sesión | Usuario autenticado, contraseñas válidas | POST `/api/v1/me/password/` con contraseña actual correcta | 200, hash actualizado y sesión continúa funcional | Backend | Alta |
| TEST-SCO-01 | Publicación | Publicación de score en texto | Usuario autenticado | POST `/api/v1/scores/` con payload `TEXT` | 201, score persistido y visible en feed | Backend | Alta |
| TEST-SCO-02 | Publicación | Publicación de score ABC con validaciones mínimas | Usuario autenticado | POST con payload formato `ABC` | 201, score guardado con formato correcto | Backend | Media |
| TEST-SCO-03 | Validación | Rechazo de campos vacíos y formatos no soportados | Usuario autenticado | POST con título/instrumento/descripcion/contenido vacío o formato `PDF` | 400 con errores específicos | Backend | Alta |
| TEST-SCO-04 | Feed y paginación | Filtros por instrumento y paginación | Usuario autenticado con 11 scores de piano | GET `/api/v1/scores/?instrument=piano&page=1` y `page=2` | 200, total y slices esperados, `has_next` / `has_previous` correctos | Backend | Alta |
| TEST-SCO-05 | Feed y ownership | Filtro `mine=1` | Dos usuarios con scores diferentes | GET `/api/v1/scores/?mine=1` | Solo devuelve scores del usuario autenticado | Backend | Alta |
| TEST-SCO-06 | Edición | Actualización parcial de score por autor | Autor autenticado y score existente | PATCH `/api/v1/scores/{id}/` con un campo | 200 y únicamente se modifica el valor enviado | Backend | Alta |
| TEST-SCO-07 | Seguridad | Edición por no-autor | Otro usuario autenticado | PATCH sobre score ajeno | 403 y score sin cambios | Backend | Alta |
| TEST-SCO-08 | Eliminación | Borrado por autor | Autor autenticado y score existente | DELETE `/api/v1/scores/{id}/` | 204 y registro eliminado | Backend | Alta |
| TEST-SCO-09 | Reacción | Toggle de reacción | Usuario autenticado y score ajeno | POST `/api/v1/scores/{id}/reactions/` dos veces | 201/200 y conteo final correcto | Backend | Alta |
| TEST-SCO-10 | Comentarios | Crear comentario válido y listarlo | Usuario autenticado | POST comentario con texto válido | 201 y comentario visible en detalle | Backend | Alta |
| TEST-SCO-11 | Seguridad | CSRF requerido en mutaciones críticas | Cliente sin token CSRF | POST/PATCH/DELETE a endpoints protegidos | 403 | Backend | Alta |
| TEST-SCO-12 | Seguridad | Acceso anónimo a endpoints protegidos | Usuario no autenticado | GET/POST/PATCH/DELETE a endpoints sensibles | 401 | Backend | Alta |
| TEST-UI-01 | Integración frontend | Navegación y flujo de usuario | Frontend/backend reales, Chromium y SQLite E2E temporal | Registro → login/logout → publicación → detalle/reacción | Estado visible y persistido, sesión creada/destruida | Playwright E2E | Alta |
| TEST-UI-02 | Scores | Edición por propietario | Usuario registrado y score propio | Cambiar título y guardar | Título actualizado en detalle | Playwright E2E | Alta |
| TEST-UI-03 | Scores | Eliminación por propietario | Usuario registrado y score propio | Eliminar y confirmar diálogo | Respuesta 204 vacía, redirección a home y score ausente | Playwright E2E | Alta |
| TEST-UI-04 | Seguridad | Acceso anónimo a ruta protegida | Sesión cerrada | Abrir `/profile` y `/scores/new` | La aplicación solicita autenticación | Playwright E2E | Alta |

## 3. Preparación y limpieza de datos

- Los tests de Django usan `TestCase` y `TransactionTestCase` con base de datos aislada por caso.
- Las pruebas de foto usan `TemporaryDirectory()` para evitar contaminación de archivos de media.
- La suite Playwright usa `%TEMP%/notara-playwright-e2e.sqlite3`, contextos independientes y valores únicos; no accede a la base local de desarrollo o PostgreSQL.

## 4. Orden recomendado de ejecución

1. `accounts` (`RegistrationTests`, `AuthenticationTests`, `ProfileManagementTests`)
2. `scores` (`ScorePublicationTests`, `ScoreEditTests`, `ScoreDeleteTests`)
3. `scores` (`ScoreReactionTests`, comentarios/likes)
4. Validación de integración frontend (manual o E2E si se habilita en un entorno real)

## 5. Requerimientos de servicios y evidencia

- Servicio de base de datos compatible con Django (PostgreSQL o SQLite configurado explícitamente).
- Variables de entorno para `DJANGO_SECRET_KEY`, `DJANGO_DB_ENGINE` y configuración de media.
- Para evidencia de ejecución, conservar salida de tests, capturas de errores, y comprobación de rutas de archivos temporales y sesiones a nivel API.

## 6. Observaciones del plan

- La suite existente es sólida para backend y seguridad.
- La principal brecha del plan es la ausencia de pruebas de interfaz real y ausencia de trazabilidad formal a requisitos con IDs globales.

