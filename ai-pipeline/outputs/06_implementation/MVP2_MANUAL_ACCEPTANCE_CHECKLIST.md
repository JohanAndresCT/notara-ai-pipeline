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
