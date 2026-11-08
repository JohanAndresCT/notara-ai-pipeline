# Product Backlog - Sprint 2: Módulo Audio, Speech & TTS/STT

**Proyecto:** Notara - Comunidad web y gestor de partituras  
**Asignatura:** Proyecto Integrador II  
**Épica:** Integración de Servicios de Voz y Audio (STT & TTS)  
**Total de Historias de Usuario:** 8  
**Total Story Points (SP):** 26 SP  

---

## 1. Resumen de la Priorización (MOSCoW & SP)

| ID | Código | Historia de Usuario | Categoría | Tecnología | SP | MOSCoW |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **HU11** | US-011 | Dictado de Partitura por Voz | Entrada (STT) | Whisper (OpenAI) | 5 | Must Have |
| **HU12** | US-012 | Transcripción de Comentarios por Audio | Entrada (STT) | Whisper / Deepgram | 3 | Should Have |
| **HU13** | US-013 | Solfeo Hablado/Cantado de la Partitura | Salida (TTS) | ElevenLabs / Azure | 5 | Must Have |
| **HU14** | US-014 | Resumen y Explicación Educativa por Voz | Salida (TTS) | ElevenLabs / Google | 3 | Should Have |
| **HU15** | US-015 | Reproducción Instrumental MIDI | Audio | Tone.js / FluidSynth | 3 | Must Have |
| **HU16** | US-016 | Caché de Audios Sintetizados | Arquitectura | Django Storage / Media | 3 | Must Have |
| **HU17** | US-017 | Respaldo Automático de Voz (*Fallback*) | Arquitectura | Python `edge-tts` | 2 | Should Have |
| **HU18** | US-018 | Descarga de Partitura en MP3 | Audio | PyDub / FFmpeg | 2 | Could Have |

---

## 2. Especificación Detallada por Historia de Usuario

### Módulo A: Entrada por Voz (STT - Speech to Text)

#### HU11 / US-011: Dictado de Partitura por Voz
* **Como** estudiante o profesor de música,
* **Quiero** dictar notas y compases a través del micrófono en español,
* **Para** que se traduzcan automáticamente a notación ABC en el editor sin escribirlas a mano.

**Criterios de Aceptación (Dado / Cuando / Entonces):**
* **AC-011-01:** **Dado** que el usuario está en `ScoreCreatePage` o `ScoreEditPage`, **cuando** presione el botón de micrófono y dicte *"Compás cuatro cuartos, Do negra, Re corchea, Mi corchea"*, **entonces** el audio se enviará al endpoint `/api/v1/audio/stt/` y el backend en Django procesará el audio con **Whisper**.
* **AC-011-02:** **Dado** que Whisper transcribió el comando correctamente, **cuando** retorne la respuesta al frontend, **entonces** el texto interpretado se insertará estructurado en notación ABC (`M:4/4`, `C D/2 E/2`) en el campo de contenido.
* **AC-011-03:** **Dado** que la grabación contiene ruido ininteligible, **cuando** falle la transcripción, **entonces** la interfaz mostrará una notificación toast indicando *"No se pudo interpretar el dictado musical"*.

---

#### HU12 / US-012: Transcripción de Comentarios por Audio
* **Como** miembro de la comunidad Notara,
* **Quiero** grabar observaciones de voz en las partituras de otros usuarios,
* **Para** dejar retroalimentación rápida que se publique como texto y audio.

**Criterios de Aceptación:**
* **AC-012-01:** **Dado** que un usuario autenticado ve el detalle de una partitura (`ScoreDetailPage`), **cuando** grabe una nota de voz de hasta 30 segundos y confirme el envío, **entonces** el backend procesará la voz con **Whisper / Deepgram**.
* **AC-012-02:** **Dado** que el audio se transcribió con éxito, **cuando** finalice la petición `POST /api/v1/scores/<id>/comments/`, **entonces** se creará un registro `Comment` que guarde la transcripción en texto y enlace la ruta del archivo `.wav` grabado.

---

### Módulo B: Salida Auditiva y Síntesis (TTS - Text to Speech)

#### HU13 / US-013: Solfeo Hablado/Cantado de la Partitura
* **Como** estudiante de música,
* **Quiero** escuchar una voz sintetizada pronunciar las notas a tiempo,
* **Para** aprender la lectura a primera vista y la entonación de la partitura.

**Criterios de Aceptación:**
* **AC-013-01:** **Dado** que el usuario visualiza una partitura con código ABC válido, **cuando** presione "Escuchar Solfeo", **entonces** el backend parseará el código ABC a nombres de notas (*"Do, Re, Mi..."*) y solicitará la pista de voz a **ElevenLabs API** (o **Azure Speech**).
* **AC-013-02:** **Dado** que el servicio devuelve el flujo de audio MP3, **cuando** el cliente lo reciba, **entonces** el reproductor de la app iniciará la reproducción auditiva del solfeo.

---

#### HU14 / US-014: Resumen y Explicación Educativa por Voz
* **Como** usuario aficionado,
* **Quiero** escuchar un resumen ejecutivo del contenido técnico de la partitura,
* **Para** entender la clave, métrica y dificultad antes de practicarla.

**Criterios de Aceptación:**
* **AC-014-01:** **Dado** que el usuario presiona el botón "Tutor Auditivo" en el detalle de la partitura, **cuando** se active la función, **entonces** el motor de síntesis TTS generará una locución informativa (ej. *"Partitura en clave de Sol, compás de 4/4, ritmo moderado"*).

---

#### HU15 / US-015: Reproducción Instrumental MIDI
* **Como** usuario,
* **Quiero** escuchar el sonido del instrumento interpretando la partitura,
* **Para** saber exactamente cómo debe sonar la melodía.

**Criterios de Aceptación:**
* **AC-015-01:** **Dado** que una partitura contiene sintaxis ABC válida, **cuando** el usuario presione "Reproducir Piano", **entonces** la librería **Tone.js** (Frontend) o el motor **FluidSynth** (Backend) sintetizará las notas a audio sin consumir consumo de APIs externas de TTS.

---

### Módulo C: Arquitectura, Caché y Rendimiento (Infraestructura)

#### HU16 / US-016: Almacenamiento en Caché de Audios Sintetizados
* **Como** administrador del sistema,
* **Quiero** almacenar localmente los archivos de audio que ya fueron generados por las APIs de TTS,
* **Para** no sobrepasar la cuota de créditos mensuales ni realizar peticiones duplicadas.

**Criterios de Aceptación:**
* **AC-016-01:** **Dado** que una partitura solicita por primera vez su audio de solfeo TTS, **cuando** la API externa devuelva el archivo `.mp3`, **entonces** Django lo guardará en el almacenamiento persistente (`/data/media/audio_cache/`) indexado por el HASH del contenido de la partitura.
* **AC-016-02:** **Dado** que un segundo usuario solicita la misma partitura, **cuando** exista el archivo en caché, **entonces** Django devolverá el MP3 local en $O(1)$ sin realizar peticiones HTTP a ElevenLabs.

---

#### HU17 / US-017: Modo Respaldo / Fallback de Voz Offline
* **Como** desarrollador del proyecto,
* **Quiero** que el backend conmute a una librería gratuita cuando la API comercial de TTS falle o no tenga créditos,
* **Para** garantizar disponibilidad continua durante las demostraciones del proyecto.

**Criterios de Aceptación:**
* **AC-017-01:** **Dado** que la petición a ElevenLabs devuelva error `402 Payment Required` o `429 Too Many Requests`, **cuando** la vista en Django capture la excepción, **entonces** llamará internamente al paquete Python **`edge-tts`** para generar la voz de respaldo sin arrojar un error HTTP 500 al usuario.

---

#### HU18 / US-018: Descarga de Audio Sintetizado en MP3
* **Como** estudiante de música,
* **Quiero** descargar el archivo de audio sintetizado a mi equipo,
* **Para** escucharlo sin necesidad de conexión a internet.

**Criterios de Aceptación:**
* **AC-018-01:** **Dado** que la pista de audio (Voz TTS + Instrumento) ya fue sintetizada, **cuando** el usuario haga clic en "Descargar MP3", **entonces** el navegador iniciará la descarga del archivo binario comprimido `.mp3`.