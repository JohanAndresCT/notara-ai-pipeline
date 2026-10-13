## 02. Requirements:

### P02 - Requirements Engineering

Actúa siguiendo las reglas de:
`ai-pipeline/prompts/system/SYSTEM_PROMPT.md`

Ejecuta la generación de requisitos usando:
`ai-pipeline/prompts/02_requirements/P02_requirements.md`

Usa como entradas:

- `ai-pipeline/outputs/01_discovery/PRODUCT_VISION.md`
- `ai-pipeline/outputs/01_discovery/PRODUCT_VISION_VALIDATION.md`
- `ai-pipeline/prompts/system/SYSTEM_PROMPT.md`

Genera:

- `ai-pipeline/outputs/02_requirements/REQUIREMENTS.md`
- `ai-pipeline/outputs/02_requirements/product_backlog.json`

La especificación se adaptó al dominio de Notara y conserva:

- Partituras `.abc` y texto plano.
- Contenido no vacío de máximo 1.000 caracteres.
- Validación básica de sintaxis `.abc`.
- Título, instrumento, descripción y contenido textual.
- Visualización legible, saltos de línea y distinción de formato.
- Registro, autenticación, perfil, publicaciones propias, dashboard, feed,
  filtro por instrumento, comentarios y reacciones.
- Exclusión de audio, imágenes, voz, OMR y roles diferenciados del MVP 1.
- Trazabilidad P01 y `HU01`-`HU10` cuando la fuente esté autorizada.
- Separación entre requisitos, arquitectura y planificación P03.

### P02 - Requirements Validation

Usa el archivo:
`ai-pipeline/prompts/02_requirements/P02_validation.md`

Aplica también:
`ai-pipeline/prompts/system/SYSTEM_PROMPT.md`

Valida:

- `ai-pipeline/outputs/02_requirements/REQUIREMENTS.md`
- `ai-pipeline/outputs/02_requirements/product_backlog.json`

Contra:

- `ai-pipeline/outputs/01_discovery/PRODUCT_VISION.md`
- `ai-pipeline/outputs/01_discovery/PRODUCT_VISION_VALIDATION.md`

Genera:
`ai-pipeline/outputs/02_requirements/REQUIREMENTS_VALIDATION.md`

La validación debe revisar estructura, reglas de contenido Notara, cobertura
`HU01`-`HU10`, trazabilidad, criterios de aceptación, alcance MVP,
supuestos, preguntas abiertas, consistencia Markdown/JSON, ausencia de
decisiones técnicas prematuras y ausencia de decisiones de planificación.

El resultado de validación debe ser exactamente uno de:

```text
PASS
PASS_WITH_WARNINGS
FAIL
BLOCKED
```

No modificar durante la validación:

- `ai-pipeline/outputs/02_requirements/REQUIREMENTS.md`
- `ai-pipeline/outputs/02_requirements/product_backlog.json`
- `ai-pipeline/outputs/01_discovery/PRODUCT_VISION.md`
- `ai-pipeline/outputs/01_discovery/PRODUCT_VISION_VALIDATION.md`

## Estado de ejecución

### P02 - Requirements Prompt

Resultado: GENERADO

Prompt:
`ai-pipeline/prompts/02_requirements/P02_requirements.md`

### P02 - Requirements Validation Prompt

Resultado: GENERADO

Prompt:
`ai-pipeline/prompts/02_requirements/P02_validation.md`

## Resultado de ejecución

Estado actual: `VALIDADO`

### Control de versiones de requisitos

#### Versión 1.0.0

En la versión `1.0.0` las preguntas `Q-001` a `Q-006` permanecían abiertas.
Por ese motivo, los requisitos se clasificaban como
`READY_WITH_ASSUMPTIONS` y el documento no podía considerarse completamente
cerrado para la planificación.

Las preguntas pendientes eran:

- `Q-001`: subconjunto exacto de sintaxis ABC.
- `Q-002`: navegadores y tamaños de viewport.
- `Q-003`: orden y paginación del feed.
- `Q-004`: edición y eliminación de comentarios.
- `Q-005`: recuperación de cuenta.
- `Q-006`: criterios de éxito medibles del MVP.

#### Versión 2.0.0

En la versión `2.0.0` el equipo estableció una respuesta para cada pregunta.
Estas respuestas se incorporaron a `REQUIREMENTS.md`, al backlog JSON y a los
criterios de aceptación afectados. Como consecuencia, el estado de requisitos
pasó a `READY`.

La versión `2.0.0` no agrega funcionalidades fuera del alcance: formaliza
decisiones del MVP y mantiene separadas las decisiones de producto de las
decisiones técnicas y de planificación.

Artefactos generados:

- `ai-pipeline/outputs/02_requirements/REQUIREMENTS.md`
- `ai-pipeline/outputs/02_requirements/product_backlog.json`

Estado de requisitos: `READY`

Versión actual de requisitos: `2.0.0`

La generación conserva la trazabilidad con P01 y `HU01`-`HU10`, las reglas de
partituras `.abc` y texto plano, el límite de 1.000 caracteres, la validación
básica ABC, la propiedad de publicaciones y las exclusiones del MVP 1.

Las decisiones abiertas Q-001 a Q-006 fueron aprobadas para el MVP:

- ABC mínimo con campos `X:`, `T:`, `M:`, `L:`, `K:` y una línea musical
  válida; las funciones avanzadas quedan fuera del MVP 1.
- Chrome, Edge y Firefox actuales en anchos de 360 px, 768 px y 1280 px;
  Safari queda fuera de la validación inicial.
- Feed descendente por fecha, con 10 publicaciones por página y sin otros
  ordenamientos.
- Los comentarios no se pueden editar ni eliminar en MVP 1.
- La recuperación de cuenta queda fuera del MVP 1; sí se permite cambiar la
  contraseña con sesión iniciada.
- El éxito del MVP se demuestra cubriendo HU01-HU10, los criterios principales
  y el flujo de registro, publicación, descubrimiento, comentarios y
  reacciones sin funciones fuera de alcance.

Verificaciones realizadas:

- `product_backlog.json` es JSON válido.
- El backlog contiene 4 épicas y 10 historias de usuario.
- Cada historia tiene requisitos y criterios de aceptación.
- Los campos de planificación de P03 permanecen sin asignar.
- `REQUIREMENTS.md` y el backlog usan los mismos identificadores principales.
- Las seis preguntas abiertas quedaron registradas como `Resolved`.

Artefacto de validación generado:

- `ai-pipeline/outputs/02_requirements/REQUIREMENTS_VALIDATION.md`

Resultado final de validación: `PASS`

Las advertencias anteriores quedaron resueltas:

- La metadata de `REQUIREMENTS.md` y `product_backlog.json` está alineada en
  versión `2.0`.
- `PRODUCT_VISION_VALIDATION.md` fue reconciliado en su revisión `1.1` y
  registra Q-001 a Q-006 como resueltas mediante las decisiones aprobadas en
  P02.

No quedan correcciones pendientes para avanzar a P03.