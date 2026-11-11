import logging

import av
from django.conf import settings
from django.core.exceptions import RequestDataTooBig
from django.db import DatabaseError
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.http.multipartparser import MultiPartParserError

from .adapters import get_stt_adapter
from .audio import AudioTooLarge, InvalidAudio, validate_audio_upload
from .dictation import DICTATION_PROMPT, Uninterpretable, compose_document, parse
from .normalizer import NormalizerError, get_normalizer
from .errors import error_response
from .inference import inference_slot
from .quota import reserve_daily_inference

logger = logging.getLogger(__name__)


def _service_unavailable() -> JsonResponse:
    return error_response(
        "STT_UNAVAILABLE",
        "El servicio de transcripción no está disponible. Puedes escribir la partitura.",
        503,
    )


@require_POST
def stt_view(request):
    if not request.user.is_authenticated:
        return error_response(
            "AUTHENTICATION_REQUIRED",
            "Se requiere una sesión autenticada.",
            401,
        )

    try:
        audio_file = request.FILES.get("audio")
        title = request.POST.get("title")
    except (RequestDataTooBig, MultiPartParserError):
        return error_response(
            "AUDIO_TOO_LARGE",
            "El audio no puede superar los 2 MB.",
            413,
        )
    if audio_file is None:
        return error_response("AUDIO_INVALID", "Envía un archivo de audio válido.", 400)
    if title is not None and not isinstance(title, str):
        return error_response("AUDIO_INVALID", "El título no es válido.", 400)

    try:
        validate_audio_upload(audio_file)
    except AudioTooLarge:
        return error_response(
            "AUDIO_TOO_LARGE",
            "El audio no puede superar los 2 MB.",
            413,
        )
    except InvalidAudio:
        return error_response(
            "AUDIO_INVALID",
            "El formato, la duración o el contenido del audio no son válidos.",
            400,
        )

    adapter = get_stt_adapter()
    if adapter is None:
        return _service_unavailable()
    if not inference_slot.acquire(blocking=False):
        return _service_unavailable()

    try:
        try:
            admitted = reserve_daily_inference(
                request.user.pk,
                settings.STT_DAILY_LIMIT,
            )
        except DatabaseError as exc:
            logger.error("STT quota reservation failed (%s).", type(exc).__name__)
            return _service_unavailable()
        if not admitted:
            return error_response(
                "STT_DAILY_LIMIT_REACHED",
                f"Alcanzaste el límite diario de {settings.STT_DAILY_LIMIT} transcripciones.",
                429,
            )

        try:
            transcript = adapter.transcribe(audio_file, prompt=DICTATION_PROMPT, fallback=False)
        except (av.error.FFmpegError, OSError, RuntimeError, ValueError) as exc:
            logger.error("STT inference failed (%s).", type(exc).__name__)
            return _service_unavailable()
    finally:
        inference_slot.release()

    # Parsing and the optional AI interpretation run after the inference slot is released.
    ai_interpreted = False
    try:
        result = parse(transcript)
    except Uninterpretable:
        result = interpret_with_ai(transcript)
        if result is None:
            return error_response(
                "DICTATION_UNINTERPRETABLE",
                "No se pudo interpretar el dictado musical.",
                422,
            )
        ai_interpreted = True
    return JsonResponse(
        {
            "transcript": transcript,
            "meter": result.meter,
            "abc_line": result.abc_line,
            "abc_document": compose_document(result, title),
            "ai_interpreted": ai_interpreted,
        }
    )


def _music_tokens(abc_line: str) -> int:
    return sum(1 for token in abc_line.split() if token != "|")


def interpret_with_ai(transcript: str):
    """CR-006 / BR-032: let Gemini fix the transcript wording, then parse it again.

    Returns a DictationResult or None. Never raises: provider problems mean M-01.
    """
    normalizer = get_normalizer()
    if normalizer is None or not transcript.strip():
        return None
    try:
        normalized = normalizer.normalize(transcript)
    except NormalizerError as exc:
        logger.warning("dictation_ai_unavailable reason=%s", exc)
        return None
    if not normalized:
        return None
    try:
        result = parse(normalized)
    except Uninterpretable:
        return None
    # Safety check: the AI may split or fix words but must not create notes.
    if _music_tokens(result.abc_line) > len(transcript.replace(",", " ").split()):
        logger.warning("dictation_ai_rejected reason=more_notes_than_words")
        return None
    logger.info("dictation_ai_used")
    return result
