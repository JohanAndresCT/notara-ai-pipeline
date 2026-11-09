# CR-003 — Cambio arquitectónico aprobado: Whisper Tiny local

## Estado y control

| Campo | Valor |
|---|---|
| ID | CR-003 |
| Fecha | 2026-11-08 |
| Release | Notara MVP 2 — Sprint 2 |
| Estado | `APPROVED — authorization reported by requester` |
| Origen | Solicitud del equipo; evidencia experimental reportada por el solicitante |
| Decisiones afectadas | DEC-201; aviso de privacidad en DEC-214 |
| Alcance | Sustituir solo el motor STT; no cambia el alcance de HU11/HU12 ni los contratos existentes |

CR-001 y CR-002 ya existían; CR-003 se creó como solicitud nueva. El solicitante informa que el equipo aprobó CR-003 y la enmienda a DEC-201. No se proporcionaron nombres de aprobadores, fecha de aprobación ni acta; no se infieren. La aprobación cubre exclusivamente el cambio STT y el aviso asociado, no ratifica el resto de DEC-201-DEC-218 ni valida calidad o producción.

## Motivo

DEC-201 seleccionó Whisper vía OpenAI API para dictado y comentarios de voz. El equipo reporta no disponer de créditos de OpenAI y propone ejecutar el modelo multilingüe `tiny` mediante `faster-whisper` en CPU/int8 dentro del backend Django. El cambio evita que el backend invoque la API OpenAI para STT, manteniendo el patrón `SttAdapter`, el endpoint propuesto y la conversión posterior de la transcripción a ABC.

## Evidencia del spike recibida

Los siguientes valores fueron proporcionados por el solicitante el 2026-11-08. No se recibió junto con esta solicitud el audio, el JSON de salida, la referencia humana de transcripción ni una captura de herramientas del host; se registran como evidencia reportada, no como mediciones independientemente verificadas.

| Campo | Evidencia reportada |
|---|---|
| Python / sistema | Python 3.11.9, Windows |
| `faster-whisper` | 1.2.1 |
| Configuración | CPU, `int8`, 2 hilos |
| Duración de audio | 3,81 s |
| Tiempo de transcripción | 1,06 s |
| Carga inicial | 9,66 s, incluyendo importación y descarga |
| RSS máximo | Aproximadamente 249 MB, máximo muestreado |
| Transcripción devuelta | «¡Dorre mi, faso la sí!» |
| Interpretación | La precisión musical no está validada; la salida reportada no demuestra reconocimiento correcto del dictado musical. |

El audio de 3,81 segundos no representa la duración máxima permitida ni una muestra de usuarios/condiciones de producción. El RSS del proceso no mide el uso total del contenedor, puede perder picos entre muestras y no permite inferir el margen disponible con Django, Nginx y Gunicorn. No se probó concurrencia, Railway ni calidad contra una referencia. La carga inicial mezcla importación y descarga; no es una medición de arranque con pesos precargados.

El spike reduce incertidumbre sobre que el modelo pueda ejecutarse en una máquina Windows concreta, pero no cierra los gates de calidad, latencia, memoria total, concurrencia ni operación en Railway.

## Cambio aprobado y aplicado documentalmente

### Tecnología y comportamiento

La enmienda aprobada a DEC-201 selecciona:

- `faster-whisper` con el modelo multilingüe `tiny`;
- inferencia `device="cpu"`, `compute_type="int8"`, idioma fijado a `es`;
- selección desde la implementación concreta detrás de `SttAdapter`;
- el adaptador devuelve texto de transcripción; el módulo determinista `dictation` continúa interpretándolo según BR-013 y componiendo ABC según BR-025;
- el mismo adaptador local puede servir HU11 y HU12. Las reglas de persistencia del audio de cada flujo no cambian.
- no usar OpenAI API, Deepgram ni fallback STT.

La interfaz del adaptador, su frontera con el parser y los códigos/cuerpos del endpoint permanecen separados de la tecnología concreta. El spike no crea el adaptador de producto.

### Contrato que se conserva

Mantener la propuesta P05 para:

`POST /api/v1/audio/stt/`

Solicitud multipart con `audio` (≤ 2 MB; tipos admitidos definidos en P05) y `title` opcional. Respuesta `200 {transcript, meter, abc_line, abc_document}` después de ejecutar la transcripción y la conversión determinista a ABC. Mantener autenticación por sesión, CSRF, límites existentes, el formato de errores tipados, la validación MVP 1 del contenido y la regla de no publicar automáticamente.

La sustitución no autoriza a cambiar rutas, nombres de campos, esquema de éxito, límites o comportamiento del parser. Si la capa HTTP no puede terminar dentro del límite aprobado, debe mapearse a un error tipado compatible —la propuesta es `STT_UNAVAILABLE` (503)— y nunca producir una respuesta de éxito vacía o un error 500 no controlado.

### Privacidad

- El navegador seguirá enviando el audio a Notara. El aviso debe decir con precisión que el audio se envía a servidores de Notara para su transcripción local; no prometer que el audio permanece en el dispositivo ni que no sale del proveedor de alojamiento.
- El backend no enviará audio a OpenAI ni a otro proveedor STT en este diseño.
- El audio de dictado no se persistirá. Si PyAV o la implementación requieren un archivo temporal, se eliminará en `finally` tanto en éxito como en error.
- El audio de comentario de voz seguirá guardándose con el comentario y tendrá su ciclo de vida actual; la transcripción seguirá siendo texto del comentario.
- No registrar audio, transcripción, ruta/nombre original, claves, ni mensajes de error que contengan esos datos. Los logs operativos podrán registrar categoría de error, duración y estado agregado sin contenido personal.
- Verificar por separado condiciones del proveedor de infraestructura (por ejemplo, Railway) y políticas de privacidad aplicables; inferencia local dentro del proceso no significa que el alojamiento no sea un tercero.

## Impacto por artefacto y cambios documentales aplicados

| Artefacto | Resultado |
|---|---|
| `outputs/00_context/DECISIONS_MVP2.md` | DEC-201 y el aviso de DEC-214 enmendados por CR-003. La autorización se registra según el solicitante; no se inventan aprobadores ni fecha. |
| P02 `REQUIREMENTS.md`, `product_backlog.json`, `REQUIREMENTS_VALIDATION.md` | Actualizados para STT local, aviso de privacidad, eliminación de audio temporal, dependencias separadas para STT/TTS y trazabilidad CR-003. Contratos y alcance de HU11/HU12 se conservan; límites y calidad siguen abiertos. |
| P03 `PRIORITIZATION.md`, `product_backlog.json`, `PRIORITIZATION_VALIDATION.md` | PRE-004 queda limitada a TTS comercial; HU11 deja de depender de una clave STT. Prioridad/SP no se alteran. Se registra riesgo de calidad y recursos de inferencia local. |
| P04 `UX_SPEC.md`, `UX_SPEC_VALIDATION.md` | M-11 informa que el audio se envía al backend de Notara y que el proveedor de alojamiento procesa el tráfico; diferencia dictado de audio de comentario persistido. UX-Q-002 queda resuelta por CR-003. |
| P05 `ARCHITECTURE.md`, `ARCHITECTURE_VALIDATION.md` | Actualizados para inferencia local, configuración propuesta, carga de pesos, concurrencia, errores y gates mensurables. El endpoint, `SttAdapter` y conversión ABC se conservan. Railway/calidad siguen sin validarse. |
| P06 `IMPLEMENTATION_LOG_MVP2.md` | Añadido registro documental de CR-003 y del spike reportado. No se implementan HU11, endpoints, modelos Django ni UI; la fundación y MVP 1 se mantienen intactos. La validación histórica P06.1 no se altera. |

No es necesario cambiar los requisitos funcionales de conversión a ABC ni los criterios de publicación MVP 1. Cualquier cambio futuro de respuesta o ruta requiere un CR aparte.

## Configuración, concurrencia y fallos

Valores de partida para implementación y medición, no configuración desplegada:

| Parámetro | Propuesta inicial | Estado |
|---|---|---|
| Modelo | Alias `tiny` multilingüe, no `tiny.en`; fijar revisión inmutable del modelo antes de producción | Pendiente |
| Dispositivo / cuantización | CPU / `int8` | Configuración del spike reportada; validar en plataforma objetivo |
| Idioma | `es` explícito; no autodetección para HU11/HU12 en MVP2 | Propuesta coherente con DEC-215 |
| Hilos CTranslate2 | Empezar con 2 hilos configurables, sin asumir que configuran todos los hilos nativos | Medido localmente como configuración reportada; Railway no medido |
| Workers y concurrencia STT | Empezar con 1 proceso Gunicorn con modelo, hasta 4 threads HTTP, 2 hilos CTranslate2, una inferencia simultánea por proceso y sin cola; saturación devuelve `STT_UNAVAILABLE` (503). Una instancia/replica Railway durante la primera prueba. Más procesos/replicas duplican memoria/modelo y requieren un límite global antes de escalar. | Propuesta para probar; no aprobada como configuración de producción |
| Timeout | `STT_TIMEOUT_SECONDS=25` como candidato; el timeout HTTP/Gunicorn no garantiza interrumpir una inferencia CTranslate2 en ejecución. Medir comportamiento y ajustar con Q-012. | Q-012 pendiente |
| Modelo y descarga | `Systran/faster-whisper-tiny`; descargar durante build/precarga, nunca en petición; exigir revisión inmutable y hashes SHA-256; readiness falla si pesos no están disponibles; runtime sin red. Pesos fuera de Git. | Revisión y build pendientes |
| Errores | Audio inválido/corrupto -> códigos actuales de audio; modelo ausente/corrupto, fallo de inicialización/inferencia, timeout o saturación -> `STT_UNAVAILABLE` (503); transcripción vacía/no interpretable -> `DICTATION_UNINTERPRETABLE` (422). No fallback externo ni respuesta vacía exitosa. | Contrato conservado; probar cada rama |

Variables propuestas: `STT_MODEL_ID=Systran/faster-whisper-tiny`, `STT_MODEL_REVISION` (commit inmutable obligatorio), `STT_MODEL_DIR=/app/models/faster-whisper-tiny`, `STT_MODEL_SIZE=tiny`, `STT_DEVICE=cpu`, `STT_COMPUTE_TYPE=int8`, `STT_LANGUAGE=es`, `STT_CPU_THREADS=2`, `STT_MAX_CONCURRENT=1`, `STT_TIMEOUT_SECONDS=25`. La revisión no tiene valor aprobado. `OPENAI_API_KEY` deja de ser requisito STT; `ELEVENLABS_API_KEY` continúa separado para TTS.

### Criterios de aceptación verificables — propuestas pendientes de aprobación

1. **Calidad HU11:** al menos 100 clips autorizados, de ≥5 hablantes y condiciones variadas, con referencias de transcripción y ABC esperada; ≥90% deben producir el ABC esperado exacto tras el parser determinista. Informar WER y matriz de falsos aceptados/rechazados. El equipo debe aprobar corpus y umbral (Q-028).
2. **Tiempo:** con modelo cargado y audio máximo de 30 s, p95 de transcripción ≤15 s bajo una inferencia a la vez; completar o devolver error tipado antes de 25 s. Medir cold start aparte.
3. **Memoria Railway:** pico total de contenedor (cgroup/Railway) ≤800 MiB bajo límite de 1 GiB, incluyendo Django, Gunicorn, Nginx y carga/inferencia.
4. **Concurrencia:** una inferencia simultánea; rechazar una solicitud paralela como `STT_UNAVAILABLE` (503) sin bloquear otras rutas ni crear inferencias adicionales. Probar límite entre procesos/replicas antes de escalar.
5. **Arranque/pesos:** revisión inmutable y hashes verificados; carga antes de readiness, runtime sin red; modelo ausente/corrupto impide readiness con diagnóstico operativo que no exponga audio/transcripción.
6. **Privacidad/contrato:** ninguna llamada a proveedor STT, audio dictado no persistido, audio/transcripción ausentes de logs; endpoint/campos de éxito, autenticación/CSRF, límites y parser sin cambios.

Los umbrales de 100 clips, 90%, 15 s, 25 s y 800 MiB son propuestas, no decisiones aprobadas ni resultados del spike.

## Pruebas y evidencia requeridas antes de autorizar implementación/producción

1. **Calidad de HU11:** conjunto representativo y autorizado de dictados españoles, con transcripción humana de referencia; cubrir notas, alteraciones, duraciones, compases, silencio, diferentes voces/ruido y el vocabulario cerrado. Registrar tasa de error y éxito del parser determinista. El equipo debe aprobar umbrales.
2. **HU12:** audios conversacionales representativos y evaluación humana del texto; comprobar audio y texto asociados y ciclo de vida del comentario.
3. **Repetibilidad local:** misma revisión de modelo, dependencias/versiones, archivos de audio y configuración; registrar cold/warm runs y equipo. Adjuntar salida JSON/metadata sanitizada.
4. **Pruebas del adaptador:** contrato con fake; modelo ausente o corrupto; archivo no soportado/corrupto; transcripción vacía; excepciones CTranslate2; limpieza temporal siempre; idioma `es`; no audio/transcript en logs.
5. **Endpoint en un incremento futuro:** autenticación, CSRF, límite de 30 s/2 MB, allowlist MIME/firma, 413/400/422/503, contrato de éxito exacto y resultado ABC. Verificar no persistencia del audio de dictado y que no cambian las reglas de publicación MVP 1.
6. **Capacidad:** perfil de memoria por proceso y total de contenedor, pico de RSS/cgroup, importación, carga y warm inference; medir concurrencia, p50/p95 y comportamiento ante saturación. Repetir con Django, Nginx y configuración de Gunicorn prevista.
7. **Despliegue:** no probar en producción. Si el equipo aprueba un despliegue de evaluación, ejecutar solo en Railway staging con autorización explícita, recursos observados, presupuesto/cambio comunicado, rollback y comprobación de salud. La evidencia de staging no se presume.
8. **Regresión:** pruebas backend `accounts` y `scores`, E2E existentes y pruebas del API; confirmar rutas y comportamiento MVP 1 sin cambios.

Q-012 (latencia) y Q-028 (corpus/calidad) siguen abiertos hasta que el equipo apruebe o sustituya los umbrales candidatos. El límite de 800 MiB, el p95 de 15 s, el corpus de 100 clips y el 90% son propuestas, no decisiones aprobadas.

## Decisiones y aprobaciones pendientes

1. Producto/docencia: resolver Q-021/Q-023 (BR-013/BR-025) y Q-028 (corpus/umbral); la calidad musical no se infiere del spike.
2. UX/privacidad: revisar M-11 y las obligaciones frente al proveedor de alojamiento; no afirmar ejecución en el dispositivo ni ausencia total de terceros.
3. Arquitectura/DevOps: fijar revisión/hash del modelo, método de precarga/build y configuración de workers/replicas.
4. Equipo: resolver Q-012, Q-027 y los límites propuestos de latencia, memoria/concurrencia.
5. Autorizar por separado pruebas de carga en Railway staging. CR-003 no autoriza despliegue ni producción.

## Impacto y riesgos

- **Beneficio potencial:** evita OpenAI API y sus créditos para STT, mantiene audio detrás del backend y reduce exposición del audio a un proveedor STT externo.
- **Riesgo funcional:** salida reportada «¡Dorre mi, faso la sí!» no valida vocabulario musical; podría generar rechazo frecuente por el parser.
- **Riesgo operacional:** inferencia CPU ocupa workers; múltiples procesos pueden duplicar el modelo y agotar memoria; una medición de RSS de 249 MB no mide el contenedor completo.
- **Riesgo de arranque/distribución:** descarga en runtime crea dependencia de red y cold start; incluir pesos aumenta tamaño/tiempo de la imagen y exige fijar procedencia.
- **Riesgo de privacidad:** el navegador sube audio al backend alojado por un proveedor de infraestructura; no equivale a procesamiento local en el dispositivo ni a ausencia de terceros de infraestructura.
- **Alcance:** no introduce nuevos flujos, no modifica TTS/DEC-202, contratos REST, el parser ABC ni MVP 1.

## Revalidación y ruta de aprobación

1. Se aplicó documentalmente la autorización de CR-003 a DEC-201/DEC-214 y P02–P06. No se asignaron nombres ni fecha de aprobación.
2. Las validaciones P02–P05 se actualizaron como PASS_WITH_WARNINGS, con riesgos y gates pendientes explícitos; el spike no se elevó a prueba de calidad o producción.
3. Resolver BR-013/BR-025, Q-012, Q-021/Q-023/Q-027/Q-028 y fijar revisión/hash, concurrencia y límites operativos antes del gate de HU11 completo.
4. La implementación de endpoint, modelos y UI queda fuera de esta CR documental y no se realizó.
5. Un eventual despliegue a Railway requiere autorización adicional para staging; producción requiere otra decisión y pruebas aprobadas.

## Resolución

- **Aprobación de CR-003 y enmienda DEC-201:** Aprobadas según autorización informada por el solicitante; fecha, nombres y acta no proporcionados.
- **DEC-201/DEC-214:** Enmendadas documentalmente; los demás acuerdos MVP 2 no se consideran ratificados por esta aprobación.
- **P02–P05:** Actualizados con el cambio y sus validaciones; los criterios operativos y de calidad siguen propuestos/pendientes.
- **HU11:** Preparación documental completada. La implementación funcional debe esperar la aprobación de BR-013/BR-025 y los gates de calidad/performance definidos; no se implementa en CR-003.
- **Railway/producción:** No probado ni autorizado por este CR.
