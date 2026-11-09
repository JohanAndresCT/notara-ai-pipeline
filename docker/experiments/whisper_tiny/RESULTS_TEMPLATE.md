# faster-whisper tiny spike results

> Reported experiment evidence is recorded below as supplied by the requester;
> raw outputs and audio were not available for independent verification.
> Do not commit recordings or personal transcripts unless their inclusion is
> explicitly approved.

## Reported run (2026-11-08)

| Field | Reported result |
|---|---|
| Evidence source | Requester-provided spike summary; raw JSON/audio not attached |
| Python | 3.11.9 |
| Operating system | Windows (version not reported) |
| `faster-whisper` | 1.2.1 |
| Model | `tiny`, multilingual (model revision not reported) |
| Device / compute type | CPU / int8 |
| Configured CPU threads | 2 |
| Audio duration | 3.81 seconds |
| Transcription time | 1.06 seconds |
| Initial load | 9.66 seconds, including import and model download |
| Maximum process RSS | Approximately 249 MB, sampled |
| Transcript returned | «¡Dorre mi, faso la sí!» |
| Musical transcription quality | Not validated; reported output does not demonstrate correct musical recognition |

### Limitations of this evidence

- Short single clip; no representative corpus, human reference, word error
  calculation, or parser-success measurement was supplied.
- The initial load combines import, download, and model initialization.
- Sampled process RSS is approximate and is not total service/container memory;
  it may miss peaks between samples.
- No concurrency, Django/Gunicorn, Linux, Railway, cold/warm comparison, or
  30-second/2-MB boundary test was reported.
- Results are provided by the requester and have not been independently
  reproduced in this workspace.

## Run metadata

| Field | Result |
|---|---|
| Run date/time and timezone | TBD |
| Operator | TBD |
| Git commit | TBD |
| Host / environment | TBD |
| Python version | TBD |
| Operating system and version | TBD |
| CPU model / logical CPUs | TBD |
| Configured CTranslate2 CPU threads | TBD |
| Configured model workers | TBD |
| Dependency versions (attach script JSON) | TBD |
| Model source / cached revision provenance | TBD |
| Cache state (`cold` / `warm`) | TBD |

## Recording set

Use recordings authorized for this evaluation. Identify samples with non-
personal IDs; do not paste audio or personal data into this report.

| Sample ID | Duration | Recording conditions / vocabulary coverage | Reference reviewed by |
|---|---:|---|---|
| TBD | TBD | TBD | TBD |

## Measurements

| Sample ID | Model load (s) | Transcription (s) | Sampled max process RSS (MiB) | Reference quality / error notes |
|---|---:|---:|---:|---|
| TBD | TBD | TBD | TBD | TBD |

Attach or summarize the JSON stdout with transcript redacted if appropriate.
Repeat cold-cache and warm-cache runs separately. Measure concurrency on an
approved staging environment and record both process RSS and total service or
container memory.

## Criteria requiring approval before a go/no-go decision

| Criterion | Proposed measurement | Acceptance threshold | Approver / status |
|---|---|---|---|
| Recognition quality for representative Spanish speech | Human-checked word/phrase accuracy and musical-vocabulary coverage | TBD | Pending |
| Transcription latency | p50 / p95 for representative clips, with warm cache | TBD | Pending (Q-012) |
| Cold start / model initialization | Duration and availability during download vs. warm cache | TBD | Pending |
| Memory headroom | Peak total service/container memory, not only sampled Python RSS | TBD | Pending |
| Concurrency and saturation behavior | Latency, errors, CPU and memory at agreed concurrent request counts | TBD | Pending |
| Model provenance | Immutable model revision and integrity/provenance record | TBD | Pending |

## Decision

- **Status:** Not evaluated / pending evidence.
- **Deployment viable:** Not determined.
- **DEC-201:** Unchanged and not approved by this experiment.
- **Follow-up / risks:** TBD.
