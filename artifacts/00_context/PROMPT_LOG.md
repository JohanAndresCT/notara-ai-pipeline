## 00. Context:

Actúa siguiendo las reglas de:
#prompts/system/SYSTEM_PROMPT.md

Ejecuta la etapa P00 usando:
#prompts/00_context/P00_project_context.md

Usa como entrada:
#artifacts/00_context/INITIAL_PROJECT_INPUT.md

Genera el contenido completo de:
#artifacts/00_context/PROJECT_CONTEXT.md

No inventes información. Marca cada elemento como FACT,
ASSUMPTION o UNKNOWN cuando corresponda.
Respeta el formato definido por el prompt.

## 00. Context: Validation

Usa el archivo prompts/00_context/P00_validation.md
para validar artifacts/00_context/PROJECT_CONTEXT.md
contra artifacts/00_context/INITIAL_PROJECT_INPUT.md.

Aplica también las reglas de prompts/system/SYSTEM_PROMPT.md.

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