"""HU21 / CR-007 endpoints: live tutor session token and typed-question fallback."""

import json
import logging

from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.http import require_POST

from scores.models import Score

from .errors import error_response
from .tutor import TutorUnavailable, answer_text, create_live_session, release, reserve

logger = logging.getLogger(__name__)
MAX_QUESTION_CHARS = 500


def _load_score(request, score_id):
    if not request.user.is_authenticated:
        return None, error_response("AUTHENTICATION_REQUIRED", "Se requiere una sesión autenticada.", 401)
    try:
        return Score.objects.get(pk=score_id), None
    except Score.DoesNotExist:
        return None, error_response("SCORE_NOT_FOUND", "No se encontró la partitura.", 404)


def _unavailable():
    return error_response(
        "TUTOR_UNAVAILABLE",
        "El tutor no está disponible en este momento. Inténtalo más tarde.",
        503,
    )


@require_POST
def tutor_session_view(request, score_id):
    score, error = _load_score(request, score_id)
    if error:
        return error
    if not reserve(request.user.pk, "sessions", settings.TUTOR_DAILY_SESSIONS):
        return error_response(
            "TUTOR_DAILY_LIMIT_REACHED",
            f"Alcanzaste el límite diario de {settings.TUTOR_DAILY_SESSIONS} conversaciones con el tutor.",
            429,
        )
    try:
        session = create_live_session(score)
    except TutorUnavailable as exc:
        release(request.user.pk, "sessions")
        logger.warning("tutor_live_unavailable score=%s reason=%s", score_id, exc)
        return _unavailable()
    response = JsonResponse(session)
    response["Cache-Control"] = "no-store"
    return response


@require_POST
def tutor_ask_view(request, score_id):
    score, error = _load_score(request, score_id)
    if error:
        return error
    try:
        question = str(json.loads(request.body or "{}").get("question", "")).strip()
    except (ValueError, AttributeError):
        question = ""
    if not question or len(question) > MAX_QUESTION_CHARS:
        return error_response(
            "QUESTION_INVALID",
            f"Escribe una pregunta de 1 a {MAX_QUESTION_CHARS} caracteres.",
            400,
        )
    if not reserve(request.user.pk, "questions", settings.TUTOR_DAILY_QUESTIONS):
        return error_response(
            "TUTOR_DAILY_LIMIT_REACHED",
            f"Alcanzaste el límite diario de {settings.TUTOR_DAILY_QUESTIONS} preguntas al tutor.",
            429,
        )
    try:
        answer = answer_text(score, question)
    except TutorUnavailable as exc:
        release(request.user.pk, "questions")
        logger.warning("tutor_text_unavailable score=%s reason=%s", score_id, exc)
        return _unavailable()
    return JsonResponse({"answer": answer})
