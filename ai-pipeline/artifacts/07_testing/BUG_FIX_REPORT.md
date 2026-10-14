# Informe de corrección de defecto - P07

## 1. Metadatos

- Proyecto: Notara
- Bug ID: `BUG-P07-204-01`
- Clasificación: `PRODUCT`
- Estado: `FIXED_AND_VERIFIED`
- Rama: `Arch-Front-end`; base fuente inspeccionada `fdb1f6b` (no representa un commit de estos cambios).
- Requisito: `FR-011`, `US-006`, `AC-015` en `ai-pipeline/artifacts/02_requirements/REQUIREMENTS.md`.
- Entorno: SQLite temporal por ejecución; no equivale a evidencia PostgreSQL.

## 2. Comando y fallo original

- Test: `E2E-UI-04`, eliminación de score del propietario.
- Comando original: desde `frontend/`, `npm run test:e2e -- --reporter=line`.
- Runtime: Chromium 156, Playwright 1.64.0, Vite y Django reales.
- Evidencia: Django registró `DELETE /api/v1/scores/7/` como `204 2`; Vite falló con `Parse Error: Expected HTTP/, RTSP/ or ICE/`; la página permaneció en `/scores/7` y mostró error de eliminación.
- La prueba directa de vista reprodujo `response.content == b'{}'` con status 204. El Django Test Client normaliza el cuerpo en la respuesta HTTP; por eso la regresión inspecciona la respuesta directa de la vista.
- Evidencia original transcrita en este informe; las ejecuciones posteriores reemplazaron los resultados transitorios de Playwright, por lo que el trace binario del fallo ya no está en `frontend/test-results/`.

## 3. Comportamiento esperado

`FR-011 / US-006 / AC-015` requieren que el propietario pueda eliminar su publicación y que deje de estar disponible en las vistas del producto. El contrato HTTP 204 requiere cuerpo vacío; después del éxito, la UI regresa al feed.

## 4. Causa raíz

En `backend/scores/views.py`, `score_detail_view` eliminaba el score y devolvía `JsonResponse({}, status=204)`, serializando dos bytes de JSON. El mismo patrón existía en `score_comment_detail_view`. El cuerpo indebido rompía el parseo del proxy Vite y la interacción de navegador.

## 5. Corrección aplicada

- Los dos endpoints DELETE usan ahora `HttpResponse(status=204)`, sin cuerpo.
- `backend/scores/tests.py` añade pruebas directas `test_delete_204_response_has_no_body` para score y comentario. Se mantienen las comprobaciones preexistentes de autorización, status y persistencia.
- El test E2E de logout espera ahora la redirección observable antes de navegar a una ruta protegida, evitando una carrera de navegación del propio test.
- `frontend/playwright.config.ts` asigna puertos dedicados y SQLite temporal por proceso; no reutiliza servidores existentes.
- No se modificó el contrato de rutas, la autorización ni la lógica de ownership.

## 6. Evidencia antes/después

Antes:

- Regresión directa nueva: 1 test falló, `b'{}' != b''`.
- E2E previo: 4/5 pasaron; el flujo DELETE falló y el proxy reportó error de parseo.

Después:

- Dos regresiones directas (DELETE score/comentario): `2/2 PASS`, `Found 2 test(s)`, `OK`, SQLite temporal.
- Caso E2E de eliminación aislado: `1/1 PASS`; Django registró `204 0` y el navegador regresó al feed.
- Suite backend completa: `python backend/manage.py test accounts scores --verbosity 1`, SQLite temporal, `88/88 PASS`, exit code 0 (`Ran 88 tests in 80.266s`). Las 86 pruebas previas siguen presentes y pasan; se añadieron dos regresiones.
- Suite E2E completa: desde `frontend/`, `corepack.cmd pnpm test:e2e -- --reporter=line`, Chromium 156, Django/Vite reales, SQLite temporal y puertos dedicados, `5/5 PASS`, exit code 0 (`22.9s`).

## 7. Riesgos y pendientes

- PostgreSQL: `NOT_RUN`; el resultado SQLite no acredita PostgreSQL.
- La implementación contiene un endpoint de borrado de comentarios aunque los requisitos/arquitectura lo excluyen del MVP (`AC-028` y regla de API de comentarios append-only). La corrección solo asegura una respuesta HTTP válida para la ruta existente; decidir/remediar esa discrepancia queda fuera de este defecto.
- CI/despliegue no se ejecutaron ni forman parte de esta tarea.

## 8. Estado y siguiente acción

`FIXED_AND_VERIFIED` para el defecto HTTP 204. No crear rama ni commit. Mantener P07 como verificado localmente con SQLite y dejar PostgreSQL como validación pendiente; no avanzar a CI/despliegue por esta solicitud.
