"""Shared transcription for voice comments (HU12).

Same safeguards as the dictation endpoint: validated upload, one inference per
process, shared per-user daily STT quota (DEC-219), no audio or transcript logged."""

import logging

import av
from django.conf import settings
from django.db import DatabaseError

from .adapters import get_stt_adapter
from .audio import AudioTooLarge, InvalidAudio, validate_audio_upload
from .inference import inference_slot
from .quota import reserve_daily_inference

logger = logging.getLogger(__name__)


class TranscriptionError(Exception):
    def __init__(self, code: str, status: int):
        super().__init__(code)
        self.code = code
        self.status = status


def transcribe_upload(user_id: int, upload) -> str:
    try:
        validate_audio_upload(upload)
    except AudioTooLarge as exc:
        raise TranscriptionError("AUDIO_TOO_LARGE", 413) from exc
    except InvalidAudio as exc:
        raise TranscriptionError("AUDIO_INVALID", 400) from exc

    adapter = get_stt_adapter()
    if adapter is None or not inference_slot.acquire(blocking=False):
        raise TranscriptionError("STT_UNAVAILABLE", 503)
    try:
        try:
            admitted = reserve_daily_inference(user_id, settings.STT_DAILY_LIMIT)
        except DatabaseError as exc:
            logger.error("STT quota reservation failed (%s).", type(exc).__name__)
            raise TranscriptionError("STT_UNAVAILABLE", 503) from exc
        if not admitted:
            raise TranscriptionError("STT_DAILY_LIMIT_REACHED", 429)
        try:
            return adapter.transcribe(upload).strip()
        except (av.error.FFmpegError, OSError, RuntimeError, ValueError) as exc:
            logger.error("STT inference failed (%s).", type(exc).__name__)
            raise TranscriptionError("STT_UNAVAILABLE", 503) from exc
    finally:
        inference_slot.release()
