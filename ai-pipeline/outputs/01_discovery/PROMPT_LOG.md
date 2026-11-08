## 01. Discovery:

Actúa siguiendo las reglas de:
#ai-pipeline/prompts/system/SYSTEM_PROMPT.md

Ejecuta la etapa P01 usando:
#ai-pipeline/prompts/01_discovery/P01_product_discovery.md

Usa como entradas:
#ai-pipeline/outputs/00_context/PROJECT_CONTEXT.md
#ai-pipeline/outputs/00_context/CONTEXT_VALIDATION.md

Consulta también, únicamente si está aprobado como fuente del proyecto:
#ai-pipeline/prompts/system/RELEASE_PLAN.md

Genera el contenido completo de:
#ai-pipeline/outputs/01_discovery/PRODUCT_VISION.md

Conserva la trazabilidad con P00 y distingue claramente:
FACT,
ASSUMPTION,
PROPOSAL,
UNKNOWN y
CONFLICT
cuando corresponda.

No inventes usuarios, necesidades, métricas, funcionalidades, tecnologías,
arquitectura, APIs, integraciones ni decisiones de negocio.

Respeta el alcance confirmado de Notara:

* MVP textual con formatos `.abc` y texto plano.
* Contenido no vacío de máximo 1.000 caracteres.
* Validación básica de sintaxis para `.abc`.
* Texto plano con formato libre.
* Visualización legible conservando saltos de línea y distinguiendo el formato.
* Título, instrumento, contenido y descripción obligatorios.
* Perfil con nombre de usuario, nombre, descripción, instrumento y cambio de contraseña.
* Sin imágenes, audio, entrada por voz ni OMR en MVP 1.

Clasifica las capacidades como:

MVP CORE,
MVP SUPPORTING,
FUTURE,
OUT OF SCOPE o
UNDEFINED / REQUIRES DECISION.

Mantén visibles las preguntas abiertas y los riesgos que deban pasar a P02.

## 01. Discovery: Validation

Usa el archivo:
#ai-pipeline/prompts/01_discovery/P01_validation.md

Aplica también las reglas de:
#ai-pipeline/prompts/system/SYSTEM_PROMPT.md

Valida:
#ai-pipeline/outputs/01_discovery/PRODUCT_VISION.md

Contra:
#ai-pipeline/outputs/00_context/PROJECT_CONTEXT.md
#ai-pipeline/outputs/00_context/CONTEXT_VALIDATION.md

Consulta:
#ai-pipeline/prompts/system/RELEASE_PLAN.md

Usa el RELEASE_PLAN únicamente para la trazabilidad HU01–HU10
si está aprobado como fuente del proyecto. Si existe un conflicto,
repórtalo y no lo resuelvas silenciosamente.

Genera el contenido completo de:
#ai-pipeline/outputs/01_discovery/PRODUCT_VISION_VALIDATION.md

Verifica:

* La estructura completa de PRODUCT_VISION.md.
* La trazabilidad con P00.
* La trazabilidad con HU01–HU10 cuando esté autorizada.
* La definición del problema y los usuarios.
* Las necesidades y Jobs To Be Done.
* La propuesta de valor.
* La experiencia principal del producto.
* La clasificación del MVP.
* El soporte de `.abc` y texto plano.
* El límite de 1.000 caracteres.
* La validación básica de `.abc`.
* El texto plano con formato libre.
* Los campos obligatorios de publicación.
* La exclusión de imágenes, audio, voz y OMR del MVP 1.
* Las preguntas abiertas, riesgos e indicadores de éxito.
* La preparación para P02 — Requirements.

No modifiques:

* `ai-pipeline/outputs/00_context/PROJECT_CONTEXT.md`
* `ai-pipeline/outputs/00_context/CONTEXT_VALIDATION.md`
* `ai-pipeline/outputs/01_discovery/PRODUCT_VISION.md`
* `ai-pipeline/prompts/system/RELEASE_PLAN.md`

El resultado de validación debe ser exactamente uno de:

PASS,
PASS_WITH_WARNINGS,
FAIL o
BLOCKED.

## Estado de ejecución

### P01 — Product Vision

Resultado:
GENERADO

Artefacto:
#ai-pipeline/outputs/01_discovery/PRODUCT_VISION.md

### P01 — Product Vision Validation

Resultado:
PASS_WITH_WARNINGS

Artefacto generado:
#ai-pipeline/outputs/01_discovery/PRODUCT_VISION_VALIDATION.md

La validación de Product Vision solo debe ejecutarse después de generar
`ai-pipeline/outputs/01_discovery/PRODUCT_VISION.md`.

Artefacto generado:
#ai-pipeline/outputs/01_discovery/PRODUCT_VISION_VALIDATION.md

P02 readiness:
READY_WITH_ASSUMPTIONS