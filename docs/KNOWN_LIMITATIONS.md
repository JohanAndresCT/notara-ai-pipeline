# Limitaciones conocidas y discrepancias

Este documento separa el alcance MVP 2 canónico, funcionalidades implementadas en el código bajo cambios pendientes y verificaciones no realizadas. Los elementos MVP 1 se conservan; las capacidades de voz/audio y archivo aprobadas para MVP 2 no se describen como fuera de alcance.

## Alcance no incluido en el backlog canónico de MVP 2

| Elemento | Estado |
|---|---|
| OMR / reconocimiento de partituras desde imágenes | No implementado; fuera del alcance actual |
| Subir imágenes a una partitura | No incluido en el alcance aprobado |
| Roles diferenciados, recuperación de cuenta | No implementados |
| Edición de comentarios | No implementada; la eliminación por el autor se conserva según DEC-211 |
| Renderizado gráfico de la notación | No implementado; el contenido de partitura sigue mostrándose como texto |

El inventario P00/P03 de MVP 1 marcaba voz y audio como futuro/no incluido. CR-001 incorporó HU11–HU18, CR-002 incorporó HU19, y la confirmación del responsable del proyecto incorpora al alcance HU20/HU21 y la enmienda CR-006 a US-011. P02 v5.6 contiene US-001–US-021; P03 v4.6 deja US-020/US-021 sin prioridad/estimación y fuera de la capacidad conocida de 31 SP.

## Estado de aprobación, planificación y validación de CR-005/006/007

| Cambio | Estado documentado | Tratamiento |
|---|---|---|
| CR-005 / US-020 / HU20 | Aprobación del equipo reportada por el responsable; fecha/acta formal pendiente de documentación; sin plan P03 | Historia canónica; código presente; faltan validación P06 individual y verificación browser actual |
| CR-006 / enmienda a US-011 | Aprobación del equipo reportada por el responsable; fecha/acta formal pendiente de documentación | AC-078–AC-082 canónicas; Gemini procesa texto transcrito, nunca audio; AC-082 requiere medición |
| CR-007 / US-021 / HU21 | Aprobación del equipo reportada por el responsable; fecha/acta formal pendiente de documentación; sin plan P03 | Historia canónica; implementación registrada; falta validación P06 individual y aceptación por criterio |

La fecha 2026-11-11 corresponde a la recepción de la confirmación, no a la fecha de aprobación. La aprobación de alcance no equivale a aceptación de implementación, pruebas ni lanzamiento. Ver [DECISIONS_MVP2.md](../ai-pipeline/outputs/00_context/DECISIONS_MVP2.md) y Q-030 en P02.

## Discrepancias de implementación y requisitos

| ID | Discrepancia | Estado actual |
|---|---|---|
| `P09-DISC-001` | Coexisten rutas heredadas `/api/` y `/api/v1/`; el frontend utiliza ambas en ciertos flujos | Presente; detalle en [API.md](./API.md) |
| `P09-DISC-002` | Coexisten `Reaction` y `Like` con conteos separados | Presente; la interfaz usa reacciones |
| `P09-DISC-003` | La API admite foto de perfil, pero la interfaz no ofrece carga; el alcance de imágenes excluye esta capacidad | Diferencia documentada; no resuelta |
| `P09-DISC-004` | La documentación histórica afirmaba que la pantalla de edición no cambiaba contenido ni formato | Resuelto el 2026-11-10: `ScoreEditPage` permite editar contenido/formato; P06 lo validó en browser, aunque falta E2E automatizado específico |
| `P09-DISC-005` | `docker-compose.yml` usa Node 20/npm, mientras que el manifiesto principal, `.mise.toml` y CI usan Node 24/pnpm | Configuraciones no uniformes; Compose no se ejecutó |
| `P09-DISC-006` | En MVP 1 se puede reaccionar y dejar comentario de texto en la propia partitura frente al lenguaje de requisitos; el comentario de voz sí rechaza la partitura propia | Diferencia documentada; no se cambió |
| `P09-DISC-007` | Se reportaron vistas de escritura con `@csrf_exempt` | Resuelto en el código actual según la revalidación; el middleware CSRF global se conserva |
| `P09-DISC-008` | El reporte P08 previo decía `NOT_DEPLOYED` pese a evidencia de despliegue histórica | Reconciliado en P08; la evidencia sigue siendo histórica y no acredita disponibilidad actual |
| `P09-DISC-009` | Los documentos históricos citaban `ai-pipeline/artifacts/`; el pipeline actual está en `ai-pipeline/outputs/` | Reconciliado en esta actualización; no se crearon copias |
| `P09-DISC-010` | Registro histórico sobre borrado de comentarios frente a AC-028 | Resuelto por DEC-211, que ratificó el borrado del autor y supersedió AC-028 |
| `P09-DISC-011` | Registros antiguos afirmaban que faltaban validaciones individuales | Los registros individuales US-001–US-019 existen; US-020 carece de validación P06 y US-021 tiene implementación, pero no validación P06. Ningún registro equivale a aceptación manual de cada criterio |
| `P09-DISC-012` | `VITE_API_BASE_URL` figura en `.env.example` sin uso observado en el frontend | Permanece sin uso conocido |

## Evidencia operativa y pruebas pendientes

- La observación de health check en Railway y los resultados de CI citados por P08 son históricos (2026-10-14, y metadatos de runs anteriores). No se verificaron en esta ejecución el despliegue actual, el commit servido ni su disponibilidad.
- Persistencia de `/data`, backups, rollback, protección del environment y redirección HTTP→HTTPS no están verificados.
- La validación backend local más reciente fue 165 tests: 164 pasaron y un test PostgreSQL-only de concurrencia se omitió. PostgreSQL local no se ejecutó.
- El typecheck frontend actual está bloqueado por tres dependencias ausentes en el `node_modules` existente. No se instalaron paquetes; E2E y build actuales no se ejecutaron.
- La evidencia histórica E2E P07 fue 5/5, no una reejecución actual.
- No existe validación P06/P07 actual por criterio para US-020/US-021. La ejecución backend registrada no sustituye tests de navegador, escucha manual o micrófono real.
- La evaluación del corpus con y sin normalización Gemini (US-011 AC-082) sigue pendiente; no se repitieron llamadas a servicios de pago.
- Precisión de dictado, corpus de aceptación, latencia p95, uso máximo de memoria, concurrencia PostgreSQL, compatibilidad de grabación por navegador y calidad auditiva requieren evidencia adicional.
- No se afirma aceptación empírica completa de HU11–HU21, readiness de producción, disponibilidad actual ni resultados de usuarios/adopción.

## Referencias de origen

- Decisiones y cambios: [DECISIONS_MVP2.md](../ai-pipeline/outputs/00_context/DECISIONS_MVP2.md).
- Backlogs canónicos: `ai-pipeline/outputs/02_requirements/product_backlog.json` y `ai-pipeline/outputs/03_planning/product_backlog.json`.
- Revalidación de implementación: `ai-pipeline/outputs/06_implementation/IMPLEMENTATION_VALIDATION_MVP2.md`.
- Revalidación de pruebas: `ai-pipeline/outputs/07_testing/TEST_VALIDATION.md`.
- Estado de CI/CD: `ai-pipeline/outputs/08_cicd/CICD_VALIDATION.md`.
