from abc import ABC, abstractmethod
from pathlib import Path
from threading import Lock

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

from .model_manifest import verify_manifest

_adapter_lock = Lock()
_stt_adapter = None


class SttAdapter(ABC):
    @abstractmethod
    def transcribe(self, audio_file, prompt: str | None = None) -> str:
        raise NotImplementedError


class FasterWhisperSttAdapter(SttAdapter):
    def __init__(self, model_path: Path, cpu_threads: int):
        self.model_path = model_path
        self.cpu_threads = cpu_threads
        self.model = None

    def load(self) -> None:
        if not settings.STT_MODEL_REVISION or not settings.STT_MODEL_MANIFEST:
            raise ImproperlyConfigured(
                "STT_MODEL_REVISION and STT_MODEL_MANIFEST are required with STT_MODEL_DIR."
            )
        try:
            verify_manifest(
                self.model_path,
                Path(settings.STT_MODEL_MANIFEST),
                settings.STT_MODEL_REVISION,
            )
        except (OSError, ValueError) as exc:
            raise ImproperlyConfigured(f"Whisper model verification failed: {exc}") from exc

        from faster_whisper import WhisperModel

        self.model = WhisperModel(
            str(self.model_path),
            device=settings.STT_DEVICE,
            compute_type=settings.STT_COMPUTE_TYPE,
            cpu_threads=self.cpu_threads,
        )

    def transcribe(self, audio_file, prompt: str | None = None) -> str:
        if self.model is None:
            raise RuntimeError("Whisper model has not been loaded.")
        audio_file.seek(0)
        # An optional vocabulary prompt biases decoding (used by dictation only).
        options = {"initial_prompt": prompt} if prompt else {}
        segments, _ = self.model.transcribe(
            audio_file,
            language=settings.STT_LANGUAGE,
            **options,
        )
        transcript = " ".join(segment.text.strip() for segment in segments).strip()
        audio_file.seek(0)
        return transcript


def initialize_stt_adapter() -> None:
    global _stt_adapter
    with _adapter_lock:
        if _stt_adapter is not None:
            return
        if not settings.STT_MODEL_DIR:
            if settings.STT_MODEL_REQUIRED:
                raise ImproperlyConfigured("STT_MODEL_DIR must be configured.")
            return
        adapter = FasterWhisperSttAdapter(
            Path(settings.STT_MODEL_DIR),
            settings.STT_CPU_THREADS,
        )
        adapter.load()
        _stt_adapter = adapter


def get_stt_adapter():
    return _stt_adapter
