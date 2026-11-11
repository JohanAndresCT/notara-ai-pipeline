# CR-004 - Migracion de Whisper Tiny a Whisper Base

## Control del cambio

- Fecha: 2026-11-09
- Proyecto: Notara ? MVP 2, Sprint 2
- Estado: APROBADO POR EL SOLICITANTE PARA IMPLEMENTACION
- Antecedente: CR-003 (aprobado)
- Decisi?n afectada: DEC-201
- Historias afectadas: HU11 y potencialmente HU12
- Aprobacion del solicitante: confirmada el 2026-11-09.

## Problema identificado

La prueba de dictado musical con Whisper Tiny produjo:
`?Dorre mi, faso la s?!`

Esta transcripci?n no representa correctamente la secuencia de
notas y puede impedir que el parser determinista genere ABC.

## Cambio propuesto

Sustituir exclusivamente el modelo STT multiling?e Tiny por Base,
manteniendo faster-whisper, CPU/int8, idioma espa?ol y SttAdapter.

Modelo: Systran/faster-whisper-base
Revisi?n: ebe41f70d5b6dfa9166e2c581c45c9c0cfc57b66

Mantener:
- Endpoint y contrato de respuesta HU11.
- Parser determinista y reglas ABC.
- Autenticaci?n, CSRF y cuota diaria.
- L?mites de tama?o y duraci?n del audio.
- Pol?tica de privacidad y retenci?n.
- Descarga del modelo durante Docker build.
- Verificaci?n de integridad mediante manifiesto SHA-256.
- Sin fallback a proveedores STT externos.

## Evidencia local

- Audio de prueba: acc.aac.
- Tiny: `?Dorre mi, faso la s?!`
- Base: `Do, re, mi, fa, sol, la, si.`
- Modelo Base cargado localmente en CPU/int8.
- Integridad de los cuatro archivos del modelo verificada.
- Pruebas Django del m?dulo voice: 21 detectadas,
  resultado OK, una omitida.
- Pruebas backend completas: 112 detectadas,
  resultado OK, una omitida.

La mejora observada corresponde a un solo audio.
No constituye una medici?n de precisi?n general ni una
validaci?n integral del endpoint.

## Archivos de implementaci?n afectados

- backend/voice/model_config.py
- backend/voice/model_sha256.json
- backend/voice/provision_model.py
- backend/notara_backend/settings.py
- backend/voice/tests.py
- Dockerfile
- .env.example

Otros cambios locales del parser, endpoint y frontend
requieren revisi?n independiente antes de integrarse.

## Riesgos y verificaciones pendientes

1. Medir calidad con el corpus aprobado para HU11.
2. Medir p95 con modelo cargado y audios de hasta 30 segundos.
3. Medir memoria total de Django, Gunicorn, Nginx y modelo.
4. Confirmar capacidad de Railway para el modelo Base.
5. Validar arranque, readiness y verificaci?n de pesos en Docker.
6. Ejecutar pruebas de integraci?n, seguridad y regresi?n.
7. Revisar variables STT configuradas en Railway.
8. Confirmar autorizaci?n de staging, rollback y despliegue.

Objetivos previamente establecidos:
- Al menos 100 audios de cinco hablantes.
- Al menos 90 % de ABC exacto.
- p95 de transcripci?n menor o igual a 15 segundos.
- Memoria total menor o igual a 800 MiB en 1 GiB.
- Una inferencia STT simult?nea por proceso.

Estos objetivos no se consideran cumplidos.

## Trazabilidad

CR-003 permanece intacto como decisi?n hist?rica aprobada.
CR-004 reemplaza la selecci?n de tama?o de modelo de CR-003,
sin cambiar los contratos ni las decisiones ajenas a STT.

DECISIONS_MVP2 registra la aprobaci?n de CR-004. La sincronizaci?n de requisitos, arquitectura, validaciones y registro de implementaci?n contin?a pendiente.

## Resolucion

CR-004 aprobado por el solicitante para implementar la
migracion a Whisper Base.

La aprobacion de los demas integrantes del equipo no se
presume ni se registra como confirmada.

La implementacion local fue probada y los resultados
disponibles se documentan en este cambio.

Permanecen pendientes la evaluacion con el corpus completo,
las mediciones de rendimiento y memoria, la validacion
en Railway y la aceptacion de produccion.

Esta aprobacion no autoriza por si sola el despliegue
en produccion.
