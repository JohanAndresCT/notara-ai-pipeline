# Notara

Comunidad web responsiva y gestor básico de partituras para estudiantes de música y músicos aficionados. Permite crear, publicar, explorar, comentar y reaccionar a partituras breves en notación ABC o texto libre.

## Versiones

| Versión | Estado | Contenido |
|---|---|---|
| **MVP 1** (`v1.0.0`) | Entregado | Registro e inicio de sesión, perfil, publicación ABC o texto (máx. 1.000 caracteres), feed con filtro por instrumento, reacciones y comentarios. |
| **MVP 2** (Sprint 2, 28 oct – 11 nov 2026) | Implementado; aceptación manual pendiente | HU11–HU21: dictado por voz con interpretación por IA, comentarios de voz, solfeo y tutor hablados, caché y voz de respaldo, reproducción con piano, guitarra e instrumentos generados por IA, descarga MP3, carga de `.abc` y tutor conversacional por voz. |

## Flujo del MVP 2

**Dictar → publicar → escuchar → preguntar.** El usuario dicta la melodía y Notara la convierte en ABC; la revisa y la publica; la escucha (solfeo, instrumentos, MP3); y le pregunta al tutor.

## Inteligencia artificial y voz

| Tipo | Uso en Notara | Tecnología |
|---|---|---|
| STT (voz → texto) | Dictado (HU11) y comentarios de voz (HU12) | Whisper Base local (`faster-whisper`); Google Gemini reinterpreta transcripciones dudosas sin añadir notas |
| TTS (texto → voz) | Solfeo (HU13), tutor auditivo (HU14), MP3 (HU18) | ElevenLabs como voz principal; `edge-tts` de respaldo (HU17) |
| STS (voz → voz) | Tutor conversacional (HU21) | Gemini Live con tokens temporales de un solo uso |
| Audio de instrumentos | Violín, flauta, trompeta y saxofón (HU20) | Magenta DDSP con TensorFlow.js; respaldo Tone.js |

Las claves de los proveedores solo existen en el servidor; las pruebas automáticas usan sustitutos (*fakes*) y no necesitan claves.

## Estado de verificación

- Pruebas: 175 de backend en SQLite y PostgreSQL 16, `tsc` y build sin errores, Playwright 9/9 (ver [Pruebas](TESTING.md)).
- Evaluación P10: `NEEDS_ITERATION`; falta la aceptación manual (micrófono real, escucha, corpus de dictado) y el acta de aprobación de CR-005/006/007 (ver [Limitaciones conocidas](KNOWN_LIMITATIONS.md)).
- Despliegue histórico: <https://notara-production.up.railway.app> (verificado el 2026-10-14; el MVP 2 aún no está desplegado).

## Contenido

- [Instalación y configuración](SETUP.md)
- [Arquitectura](ARCHITECTURE.md)
- [API](API.md) y [contrato de dictado STT (HU11)](API_STT_HU11.md)
- [Modelo de datos](DATA_MODEL.md)
- [Guía de usuario](USER_GUIDE.md)
- [Pruebas](TESTING.md)
- [Cobertura de requisitos](REQUIREMENTS_COVERAGE.md)
- [Limitaciones conocidas](KNOWN_LIMITATIONS.md)

## Repositorio y pipeline

- Código: <https://github.com/JohanAndresCT/notara-ai-pipeline>
- Registros del pipeline P00–P10: [`ai-pipeline/outputs/`](https://github.com/JohanAndresCT/notara-ai-pipeline/tree/main/ai-pipeline/outputs)
- Reporte de documentación P09: [DOCUMENTATION_REPORT.md](https://github.com/JohanAndresCT/notara-ai-pipeline/blob/main/ai-pipeline/outputs/09_documentation/DOCUMENTATION_REPORT.md)
- Evaluación P10: [MVP_EVALUATION.md](https://github.com/JohanAndresCT/notara-ai-pipeline/blob/main/ai-pipeline/outputs/10_evaluation/MVP_EVALUATION.md)
