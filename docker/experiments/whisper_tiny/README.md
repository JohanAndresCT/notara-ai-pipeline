# Experimental spike: faster-whisper multilingual tiny

This is an isolated experiment. It does not import or modify the Notara Django
backend, change `DEC-201`, or establish that a local model is approved or
production-ready.

The script loads `WhisperModel("tiny", device="cpu", compute_type="int8")`,
requests Spanish transcription, and emits a JSON report to stdout. The default
configuration asks CTranslate2 for two CPU threads and one model worker; pass
`--threads` explicitly when comparing runs.

## Requirements

- CPython 3.12.x (the version intended for this experiment and the backend).
- Windows 10/11 or a Linux x86_64 environment with wheels available for the
  pinned packages.
- Internet access on the first run to retrieve the model from Hugging Face.
- A local audio file readable by PyAV. A separate FFmpeg installation is not
  required by faster-whisper's documented PyAV decoding path.

The current checkout was inspected with Python 3.13.15 on Windows 11; this is
not the requested Python 3.12 runtime, and no model inference was run as part of
creating this experiment.

## Windows PowerShell

From the repository root:

```powershell
py -3.12 -m venv experiments\whisper_tiny\.venv
.\experiments\whisper_tiny\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r experiments\whisper_tiny\requirements.txt
python experiments\whisper_tiny\run_whisper.py --audio "C:\path\to\sample.wav" --threads 2 --cache-dir "experiments\whisper_tiny\models"
```

Replace the sample path with a file you are authorized to process. If PowerShell
blocks activation, use the virtual environment interpreter directly:

```powershell
.\experiments\whisper_tiny\.venv\Scripts\python.exe -m pip install -r experiments\whisper_tiny\requirements.txt
.\experiments\whisper_tiny\.venv\Scripts\python.exe experiments\whisper_tiny\run_whisper.py --audio "C:\path\to\sample.wav" --threads 2 --cache-dir "experiments\whisper_tiny\models"
```

## Linux

From the repository root:

```bash
python3.12 -m venv experiments/whisper_tiny/.venv
source experiments/whisper_tiny/.venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r experiments/whisper_tiny/requirements.txt
python experiments/whisper_tiny/run_whisper.py --audio /path/to/sample.wav --threads 2 --cache-dir experiments/whisper_tiny/models
```

## Model download and reproducibility

`faster-whisper` resolves the name `tiny` to the multilingual
`Systran/faster-whisper-tiny` model on the Hugging Face Hub. The first call to
`WhisperModel("tiny", ...)` downloads model files; subsequent runs use the
local cache. `--cache-dir` sets the model download/cache directory. Without it,
the library uses its Hugging Face cache defaults, which can be redirected with
the Hugging Face cache environment variables.

Model weights are not dependencies in `requirements.txt` and must not be added
to Git. The experiment `.gitignore` excludes its model/cache and common audio
sample formats. The library's `tiny` alias follows the Hub's current default
revision; this experiment pins Python package versions, **not** an immutable
model revision or model-file checksums. For a reproducible comparison, record
the run date and cache provenance, and use the same cached model snapshot for
all compared audio.

The requirements file pins the direct runtime packages, including the
inference/runtime dependencies. Pip may still resolve transitive dependencies
of those packages according to their metadata; this is not a platform-specific
wheel lockfile.

## Measurements and limitations

The JSON report contains Python and OS versions, detected CPU count, configured
CTranslate2 CPU threads and workers, installed package versions, model/audio
metadata, and timings.

- **Model load time** starts just before importing `faster_whisper` and ends
  after model construction. It includes import and, on a cold cache, model
  download. Compare cold-cache and warm-cache runs separately; do not treat a
  cold run as pure model initialization time.
- **Transcription time** includes the `transcribe` call and fully iterating its
  lazy segment generator. It excludes model load and does not include time spent
  preparing or recording audio outside this process.
- **Maximum RSS** is the maximum sampled resident set size of this Python
  process, sampled every 20 ms with `psutil`. It is approximate and can miss
  short-lived peaks between samples. It excludes other Railway processes and is
  not a container/cgroup peak-memory measurement. Compare it with platform
  memory telemetry; do not infer service-wide headroom from this number.
- The reported CPU-thread value is the requested CTranslate2 setting, not a
  measurement of all native threads created by the process.
- The script includes recognized text in stdout by default for manual quality
  review. Treat the output as potentially sensitive; use `--hide-transcript`
  when it should not be printed. No result file is written automatically.

## Quality and resource evaluation

Use the same approved, representative Spanish recordings for repeated runs.
For each recording, compare the transcript with a human-verified reference,
including musical vocabulary, note names, accidentals, durations, bars, noise,
speakers, and recording conditions. Record results in
[`RESULTS_TEMPLATE.md`](./RESULTS_TEMPLATE.md). Keep raw recordings and
transcripts local and do not commit them.

No latency, quality, concurrency, or memory acceptance threshold is approved
here. The result template leaves these as team decisions. A local run is not
evidence for the approximately 1 GB / 2 vCPU Railway deployment: production
viability requires measurements on a representative Railway staging instance,
with Django, Gunicorn, Nginx, model loading, realistic concurrency, and
service-wide memory telemetry. Do not deploy this experiment to Railway.
