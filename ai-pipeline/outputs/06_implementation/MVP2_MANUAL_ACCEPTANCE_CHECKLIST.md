# MVP 2 — Lista de pruebas manuales y pendientes de equipo

**Fecha:** 2026-11-10 · **Rama:** `pipeline/mvp2-p00-context`

El código de HU01–HU19 está completo y validado con pruebas automáticas (134 backend: 133 OK, 1 omitida; `tsc` y `vite build` OK) y en el navegador. Esta lista cubre lo que **solo una persona del equipo puede comprobar**. Marca cada casilla y anota la evidencia (captura, duración, navegador) en el registro de la historia correspondiente.

## 1. Preparación

- Backend en `http://localhost:8000` y frontend en `http://localhost:5173` (ver `docs/SETUP.md`).
- Abrir la app en **Chrome o Edge de escritorio** (no en el navegador integrado: bloquea el micrófono).
- Dos cuentas: **A** (autora) y **B** (oyente), en ventanas distintas (una en incógnito).
- Internet activo (la voz usa Edge TTS). La transcripción funciona sin internet.

## 2. Micrófono real

| # | Historia | Prueba | Resultado esperado | ✔ |
|---|---|---|---|---|
| 1 | HU11 | A → Crear partitura → Dictar → decir «Compás cuatro cuartos, Do negra, Re corchea, Mi corchea» | Campo con ABC completo, formato ABC, mensaje «Dictado insertado» (AC-030/031) | ☐ |
| 2 | HU11 | Grabar 30 s sin parar | Se detiene sola y avisa (AC-034) | ☐ |
| 3 | HU11 | Bloquear el micrófono en el navegador y pulsar Dictar | Mensaje claro; el formulario sigue usable (AC-035) | ☐ |
| 4 | HU11 | Decir algo fuera del vocabulario («hola qué tal») | «No se pudo interpretar el dictado musical», contenido intacto (AC-032) | ☐ |
| 5 | HU11 | A → Editar una partitura ABC con `L:1/8` → Dictar «Do negra, Sol blanca» | Se añade al final `C2 G4`; cabeceras intactas (DEC-239) | ☐ |
| 6 | HU12 | B → partitura de A → Grabar comentario → escuchar → Enviar | Comentario con texto y audio reproducible (AC-037/038) | ☐ |
| 7 | HU12 | B elimina su comentario de voz | Pide confirmación; desaparecen texto y audio (AC-042) | ☐ |

## 3. Escuchar (oído humano)

| # | Historia | Prueba | Resultado esperado | ✔ |
|---|---|---|---|---|
| 8 | HU13 | Escuchar Solfeo en una partitura ABC | Voz en español dice las notas en orden | ☐ |
| 9 | HU14 | Tutor Auditivo | Dice clave, tonalidad, compás y dificultad; el texto aparece debajo | ☐ |
| 10 | HU15 | Reproducir Piano | Suena la melodía con el ritmo correcto; «Detener piano» la para | ☐ |
| 11 | HU18 | Descargar MP3 después del solfeo | Se guarda `<titulo>-solfeo.mp3` y se reproduce fuera de la app | ☐ |
| 12 | HU16 | Pedir el mismo solfeo otra vez | Responde casi al instante (caché) | ☐ |

## 4. Metas de aceptación de HU11 (AC-070..072, Q-028)

- Reunir **al menos 9 grabaciones de al menos 3 personas distintas** con frases del vocabulario y su ABC esperado (Q-028, PRE-011).
- Metas: **≥ 7 de 9** con el ABC exacto (AC-070); **p95 ≤ 15 s** con grabaciones de 30 s, reportando aparte el arranque en frío (AC-071); memoria total **≤ 800 MiB** en un contenedor de 1 GiB, con una sola inferencia a la vez (AC-072).
- Anotar resultados en `US-011_DICTATION_VALIDATION.md` (IMPL-VAL-011-01 y -02).

## 5. Infraestructura (responsable de despliegue)

| # | Pendiente | Cómo cerrarlo | ✔ |
|---|---|---|---|
| 13 | **ElevenLabs (PRE-004)** | Poner `VOICE_PRIMARY_ENGINE=elevenlabs`, `ELEVENLABS_API_KEY` y `ELEVENLABS_VOICE_ID` en el `.env`; repetir pruebas 8–9. Luego poner una clave inválida y comprobar que sigue sonando (respaldo Edge, HU17) | ☐ |
| 14 | **Railway `/data` (PRE-005)** | Confirmar que el volumen persistente está montado en `MEDIA_ROOT`; crear un comentario de voz, redeplegar y comprobar que el audio sigue disponible | ☐ |
| 15 | Migraciones en Railway | `python manage.py migrate` aplica `scores.0006` y `voice.0002` | ☐ |

## 6. Decisiones de equipo

| # | Tema | Estado |
|---|---|---|
| 16 | Ratificar DEC-230..239 con todo el equipo (Q-020) | Pendiente |
| 17 | Licencia de muestras de piano (ARCH-RISK-206); hoy suena un sintetizador | Pendiente |
| 18 | Revisión de los umbrales de dificultad BR-014 por un profesor de música | Recomendado |
| 19 | ¿Se permite dar «me gusta» a la propia partitura? (IMPL-VAL-009-01) | Pendiente |

Cuando 1–15 estén marcados, las historias con `IMPLEMENTED_WITH_GAPS` pasan a `IMPLEMENTED` y se puede ejecutar **P07 (Testing)**.

---

## 7. Evidencia de la ejecución asistida (2026-11-10)

Ejecutada en el navegador integrado y con scripts locales (Windows, Python 3.13, Whisper Base int8, 2 hilos). El micrófono se **simuló** inyectando voz sintética de Edge TTS como flujo de micrófono (`getUserMedia`), así que el recorrido de la app (grabación → envío → transcripción → inserción) es real, pero la voz no es humana. Por eso las casillas siguen sin marcar: falta la confirmación con micrófono y oído reales.

| # | Resultado con micrófono simulado / verificación automática | Estado |
|---|---|---|
| 1 | ABC `X:1 … M:4/4 … C D/2 E/2` insertado, formato ABC, «Dictado insertado»; respuesta 1,5 s | ✔ simulado |
| 2 | La grabación se detiene sola a los **30,0 s** (audio enviado de 29,46 s). El dictado cortado a mitad de palabra fue «No se pudo interpretar» (ver hallazgo B) | ✔ corte · ⚠ resultado |
| 3 | Verificado el 2026-11-09 en el navegador integrado (micrófono bloqueado → M-04, formulario usable) | ✔ |
| 4 | «Hola, qué tal, buenos días» → «No se pudo interpretar el dictado musical», campo intacto | ✔ simulado |
| 5 | En Editar con `L:1/8`: se añadió `C2 D E \| G4`, cabeceras intactas; guardado y visible en el detalle | ✔ simulado |
| 6 | Vista previa, envío, insignia «Comentario de voz», audio servido (`audio/webm`, 200). Texto: «…el segundo **con paz** suena muy bien» (Whisper confundió «compás») | ✔ simulado |
| 7 | Confirmación «¿Eliminar tu comentario? También se eliminará su audio…»; comentario eliminado; audio → 404 | ✔ |
| 8 | Solfeo transcrito de vuelta con Whisper: «SOL LA SIDO RE MI REDOSI» = notas esperadas en orden | ✔ automático |
| 9 | Tutor transcrito: «Partitura en clave de sol, tonalidad de sol mayor, … tempo de 90 pulsos por minuto, dificultad estimada, baja» | ✔ automático |
| 10 | El piano arranca (osciladores activos), pausa el solfeo y se detiene con «Detener piano». **La afinación solo se puede confirmar de oído** | ⚠ falta oído |
| 11 | `estrellita-donde-estas-solfeo.mp3`: 112 KB, cabecera MPEG válida, 18,7 s decodificables | ✔ automático |
| 12 | Segunda petición del mismo solfeo: **11 ms** (frente a ~1,8 s la primera), bytes idénticos | ✔ |

### Corpus sintético (proxy de AC-070..072, no sustituye a personas reales)

- **Exactitud:** 9 frases × 3 voces Edge (es-ES Elvira, es-MX Jorge, es-CO Salomé): **21/27 exactas, 7/9 por voz** (meta AC-070: ≥ 7/9). Fallos: «Donegra», «se mi corchea» (semicorchea ×2), «Son blanca», «resonda/re ronda».
- **Sin el prompt de vocabulario** la misma voz fallaba ya en la frase 1 («Donegra, recorcea…»).
- **Latencia (AC-071):** frases cortas 1,4–2,6 s; dictados de ~23 s: mediana 1,5 s, máx. 1,6 s; dictados cortados a 30 s: 2,5–2,6 s, **pero un caso de 30 s cortado a mitad de palabra tardó 19,3–25,6 s** (ver hallazgo A).
- **Memoria (AC-072):** proceso con Django + modelo + 9 inferencias: conjunto de trabajo **214 MiB (pico 353 MiB)**, memoria privada comprometida 735 MiB. Medido en Windows, **no** en un contenedor de 1 GiB: falta la medición en Railway.

### Hallazgos

| ID | Severidad | Hallazgo | Recomendación |
|---|---|---|---|
| A | MEDIUM | Con audio de baja confianza, faster-whisper reintenta con temperaturas crecientes (*temperature fallback*): un dictado de 30 s tardó 19–26 s, por encima del p95 de 15 s (AC-071) y rozando el techo de 25 s (DEC-232). Con `temperature=0` el mismo audio tardó 5,1 s y la exactitud del corpus no cambió (6/9 en ambos casos con dictados largos). **Aplicado (DEC-240):** el dictado usa una sola pasada con `temperature=0`. Peor caso medido con la clase real de la app: 23,1 s → **5,0 s**, mismo texto; corpus sintético sin cambios (21/27, p95 1,8 s). Confirmar con el corpus real. |
| B | MEDIUM | El analizador es «todo o nada»: si el corte automático de 30 s parte la última palabra, se pierde todo el dictado (M-01). | Avisar en la UI de dictar menos de 25 s, o que el analizador ignore solo un fragmento final incompleto (cambio de BR-013, requiere decisión). |
| C | LOW | Errores de transcripción típicos: «semicorchea» → «se mi corchea», «Do negra» → «Donegra», «compás» → «con paz». | Ampliar sinónimos tolerados en el analizador (BR-013) tras el corpus real. |
| D | LOW | Edge TTS lee el solfeo rápido (9 notas en 4,2 s). | Valorar una velocidad menor para el solfeo (cambia la clave de caché). |

### Sigue pendiente (no se puede hacer desde aquí)

- Repetir 1, 2, 4, 6 con **micrófono real** y 8–10 **escuchando**.
- **Corpus real**: ≥ 9 grabaciones de ≥ 3 personas.
- **ElevenLabs** con clave (13), **Railway** `/data` y migraciones (14, 15), y las decisiones de equipo (16–19, ratificar DEC-240 y el hallazgo B).
