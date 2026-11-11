"""Synthesis endpoints: spoken solfege (HU13) and audio tutor (HU14).

Both return the MP3 body directly so the client can play it and offer it for
download without a second synthesis (HU18, DEC-204)."""

from urllib.parse import quote

from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.http import require_POST

from scores.abc_reader import UnsupportedAbc, read_abc, solfege_text, tutor_text
from scores.models import Score

from .errors import error_response
from .models import SynthesizedAudio
from .synthesis import SynthesisLimitReached, SynthesisUnavailable, synthesize


def _load_reading(request, score_id):
    if not request.user.is_authenticated:
        return None, error_response("AUTHENTICATION_REQUIRED", "Se requiere una sesión autenticada.", 401)
    try:
        score = Score.objects.get(pk=score_id)
    except Score.DoesNotExist:
        return None, error_response("SCORE_NOT_FOUND", "No se encontró la partitura.", 404)
    if score.score_format != Score.Format.ABC:
        return None, error_response("NOT_ABC", "Disponible solo para partituras en ABC", 409)
    try:
        return read_abc(score.content), None
    except UnsupportedAbc:
        return None, error_response(
            "ABC_UNSUPPORTED",
            "Esta partitura contiene elementos que no se pueden reproducir.",
            422,
        )


def _audio_response(kind, texts, request, score_id):
    try:
        audio = synthesize(kind, texts, request.user.pk, context=f"score={score_id} kind={kind}")
    except SynthesisLimitReached:
        return None, error_response(
            "DAILY_LIMIT_REACHED",
            f"Alcanzaste el límite diario de {settings.VOICE_DAILY_LIMIT} audios nuevos. Los audios ya generados siguen disponibles.",
            429,
        )
    except SynthesisUnavailable:
        return None, error_response("AUDIO_UNAVAILABLE", "No se pudo generar el audio. Inténtalo más tarde.", 503)
    response = HttpResponse(audio, content_type="audio/mpeg")
    response["Cache-Control"] = "private, no-store"
    response["X-Content-Type-Options"] = "nosniff"
    return response, None


@require_POST
def solfege_view(request, score_id):
    reading, error = _load_reading(request, score_id)
    if error:
        return error
    texts = {False: solfege_text(reading, with_pauses=False), True: solfege_text(reading, with_pauses=True)}
    response, error = _audio_response(SynthesizedAudio.Kind.SOLFEGE, texts, request, score_id)
    return error or response


@require_POST
def tutor_view(request, score_id):
    reading, error = _load_reading(request, score_id)
    if error:
        return error
    text = tutor_text(reading)
    response, error = _audio_response(SynthesizedAudio.Kind.TUTOR, {False: text, True: text}, request, score_id)
    if error:
        return error
    response["X-Notara-Tutor-Text"] = quote(text)  # DEC-234; shown as text (UX-PROP-005)
    return response

