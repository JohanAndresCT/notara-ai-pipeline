## 00. Context:

Actúa siguiendo las reglas de:
#ai-pipeline/prompts/system/SYSTEM_PROMPT.md

Ejecuta la etapa P00 usando:
#ai-pipeline/prompts/00_context/P00_project_context.md

Usa como entrada:
#ai-pipeline/outputs/00_context/INITIAL_PROJECT_INPUT.md

Genera el contenido completo de:
#ai-pipeline/outputs/00_context/PROJECT_CONTEXT.md

No inventes información. Marca cada elemento como FACT,
ASSUMPTION o UNKNOWN cuando corresponda.
Respeta el formato definido por el prompt.

## 00. Context: Validation

Usa el archivo ai-pipeline/prompts/00_context/P00_validation.md
para validar ai-pipeline/outputs/00_context/PROJECT_CONTEXT.md
contra ai-pipeline/outputs/00_context/INITIAL_PROJECT_INPUT.md.

Aplica también las reglas de ai-pipeline/prompts/system/SYSTEM_PROMPT.md.

## V1.0.0 Result: PASS_WITH_WARNINGS
## 00. Correcciones recomendadas:

1. Definir el formato de las partituras
Actualmente no está decidido si el MVP aceptará:

Archivos .abc.
Texto plano.
Ambos formatos.
Está registrado como UNKNOWN en el contexto.

Debe corregirse definiendo una decisión concreta, porque afecta:

Formulario de publicación.
Validaciones.
Almacenamiento.
Visualización.
Edición de partituras.

2. Resolver la mención de “escuchar”
La entrada inicial dice que otros usuarios podrían “escuchar” las partituras, pero el MVP actual solo contempla contenido textual.

Debe decidirse si:

El MVP no incluye audio y se elimina esa promesa.
El audio queda para una fase futura.
Se agrega audio al MVP mediante un cambio formal de alcance.
Por ahora, el contexto está correcto porque no inventa audio; solamente reporta la contradicción.

3. Definir reglas para el contenido textual
Aún faltan decisiones como:

Longitud máxima de una partitura.
Estructura mínima del texto.
Validación para .abc.
Si el texto plano tendrá formato libre.
Cómo se mostrará el contenido.
Qué campos son obligatorios además del título e instrumento.
Estas definiciones deberían realizarse en las etapas de requisitos y UX.

4. Confirmar el alcance detallado del perfil
El RELEASE_PLAN.md incluye detalles como:

Nombre de usuario.
Nombre.
Descripción.
Instrumento.
Cambio de contraseña.
Sin embargo, esos detalles no estaban en la versión original de INITIAL_PROJECT_INPUT.md usada para validar el contexto.

Por eso el reporte recomienda confirmar si RELEASE_PLAN.md es una fuente aprobada para ampliar el alcance del perfil. Si lo es, esos campos deberían incorporarse también de forma trazable en el contexto y en la entrada inicial.

5. Revisar la clasificación de “proyecto académico”
El reporte señala que la entrada actual no menciona explícitamente:

Universidad.
Curso.
Institución académica.
Por eso, si se quiere conservar que Notara es un proyecto académico, esa información debería agregarse explícitamente a INITIAL_PROJECT_INPUT.md.

Si no se desea agregarla, debe mantenerse como UNKNOWN, no como FACT.

6. Aclarar la trazabilidad con HU01–HU10
El contexto usa identificadores propios:

MVP-001
MVP-002
etc.
El release plan utiliza:

HU01
HU02
hasta HU10.

No es un error grave, pero sería conveniente establecer una relación explícita entre ambos identificadores, por ejemplo:
MVP-001 → HU01
MVP-002 → HU02
MVP-003 → HU04

## V2.0.0 Result: READY_WITH_ASSUMPTIONS
El proyecto puede avanzar a P01 — Discovery. Las decisiones principales del MVP están suficientemente definidas y las incertidumbres restantes no impiden comprender ni delimitar el producto.

---

# MVP 2 — Sprint 2 (Audio, Speech & TTS/STT)

## 00. Context (MVP 2): adaptación de prompts e insumos

- `prompts/00_context/P00_project_context.md` → v2.0: se eliminó el ejemplo pre-llenado con JPG/PNG (nunca fue el alcance real del MVP 1, que usa `.abc` y texto plano) y se añadió el modo incremental (preservar IDs, superseder sin borrar, CR obligatorio, tecnologías del backlog como PROPOSAL, IDs de decisión con fuente).
- `prompts/00_context/P00_validation.md` → v2.0: valida contra el MVP 1 y el backlog del Sprint 2.
- Nuevo insumo: `outputs/00_context/SPRINT_2_BACKLOG_INPUT.md` (copia literal del backlog del Sprint 2).
- `INITIAL_PROJECT_INPUT.md`: se añadió la sección "MVP 2 Input" sin modificar la del MVP 1.

## 00. Context (MVP 2): Validation

Usa el archivo ai-pipeline/prompts/00_context/P00_validation.md (v2.0)
para validar ai-pipeline/outputs/00_context/PROJECT_CONTEXT.md (v2.0)
contra ai-pipeline/outputs/00_context/INITIAL_PROJECT_INPUT.md
y ai-pipeline/outputs/00_context/SPRINT_2_BACKLOG_INPUT.md.

Aplica también las reglas de ai-pipeline/prompts/system/SYSTEM_PROMPT.md.

## MVP 2 V2.0 Result: FAIL (1 HIGH, 3 MEDIUM, 6 LOW)

Correcciones requeridas antes de P01:

1. VAL-201 (HIGH): DEC-01..DEC-07 no existen en el backlog ni en otro artefacto. Crear tabla "Proposed Decisions" con IDs sin colisión con P03 (DEC-001..003).
2. VAL-202: actualizar la deuda del MVP 1 (CSRF y N+1 ya corregidos en 689e25e y 6bea185).
3. VAL-203: HU14 pide "clave, métrica y dificultad"; el contexto cambió "dificultad" por "unit note length" sin marcarlo PROPOSAL.
4. VAL-204: el borrado de comentarios contradice P03 DEC-002 (Approved) y no se reporta.

Siguiente paso: generar PROJECT_CONTEXT v2.1 y re-validar.

## 00. Context (MVP 2): regeneración v2.1

Ejecuta la etapa P00 (prompt v2.0, modo incremental) aplicando las
correcciones VAL-201..VAL-210 de CONTEXT_VALIDATION.md sobre
ai-pipeline/outputs/00_context/PROJECT_CONTEXT.md (v2.0 → v2.1).

Cambios principales: tabla "Proposed Decisions" PDEC-201..PDEC-210 en lugar de
DEC-01..DEC-07; deuda MVP 1 verificada contra el repo; HU14 con "dificultad";
desviación de P03 DEC-002 reportada (Q-017); nuevas Q-016, Q-018, ASM-009, ASM-010,
EXT-005, EXT-006.

## MVP 2 V2.1 Result: PASS_WITH_WARNINGS (0 HIGH, 0 MEDIUM, 2 LOW)

- VAL-211 (LOW): escribir CR-001 completo (campos del SYSTEM_PROMPT §11) en P01/P02.
- VAL-212 (LOW): RELEASE_PLAN.md no incluye HU11–HU18.

Estado del contexto: READY_WITH_ASSUMPTIONS. Puede avanzar a P01 — Discovery.
Decisiones del equipo pendientes: PDEC-201..PDEC-210 (Q-007), fechas y responsables (Q-010),
presupuesto y llaves de API (Q-011).

## 00. Context (MVP 2): decisiones + HU19 → v2.2

Johan delegó las decisiones al pipeline ("respecto a decisiones toma las que consideres mejor")
y pidió agregar la carga de archivos `.abc` como nueva HU del MVP 2.

- Nuevo insumo: `outputs/00_context/DECISIONS_MVP2.md` (DEC-201..DEC-218; ratificación del resto del equipo pendiente, Q-020).
- `SPRINT_2_BACKLOG_INPUT.md`: addendum fechado con HU19 / US-019 "Carga de Partitura desde Archivo .abc" (2 SP, Should), CR-002.
- `INITIAL_PROJECT_INPUT.md`: referencia al addendum y al registro de decisiones.
- `PROJECT_CONTEXT.md` v2.2: PDEC → DEC, MVP-019, 31 SP, DEFECT-001 (placeholder ABC muestra `&#10;`, `frontend/src/ScoreCreatePage.tsx:76`).

## MVP 2 V2.2 Result (run 3): PASS_WITH_WARNINGS (0 HIGH, 0 MEDIUM, 2 LOW)

- VAL-212: RELEASE_PLAN.md sin HU11–HU19.
- VAL-213: decisiones aprobadas por un solo miembro; ratificar antes de P03.

## 00. Context (MVP 2): v2.3 — corrección de redacción

Tras P02 (REQ-VAL-202, REQ-VAL-203): HU14 "clave" = clef (no key) en §3 y MVP-014; Q-002 y Q-006 sincronizadas con su resolución del MVP 1. Sin cambio de alcance.

## MVP 2 V2.3 Result (run 4): PASS_WITH_WARNINGS (2 LOW sin cambios: VAL-212, VAL-213)

## MVP 2 — Segundo lote de decisiones (DEC-219..DEC-229)

Johan pidió dejar listas las decisiones recomendadas tras P05. Se registraron en `DECISIONS_MVP2.md` §3:
DEC-219 motores falsos en CI (enmienda DEC-202), DEC-220 transcripción de voz hasta 1.000 caracteres,
DEC-221 tiempos de espera iniciales, DEC-222 20 transcripciones por día, DEC-223 audio en webm/ogg,
DEC-224 texto del tutor en cabecera, DEC-225 UX-PROP-001..007 aprobadas, DEC-226 aviso nombra a OpenAI,
DEC-227 tutor con tonalidad y tempo si existen, DEC-228 sin borrado de cuenta, DEC-229 BR-013/014/025 como versión inicial.
Siguen abiertos: Q-009 (Railway), Q-010, Q-011, Q-012, Q-020 y la aprobación de ADRs por TEAM-002.
