"""Conversational music tutor with Google Gemini (HU21 / CR-007).

- Live voice: the server creates a single-use ephemeral token whose Live setup (model,
  instructions, output) is locked, so the browser never sees the API key and cannot change
  the tutor's role. Audio flows browser <-> Gemini only during the session; Notara stores none.
- Text fallback: a typed question is answered with ``generateContent`` (AC-087).
"""

import datetime as dt
import json
import logging
import urllib.error
import urllib.request

from django.conf import settings
from django.db.models import F
from django.utils import timezone

from scores.abc_reader import UnsupportedAbc, read_abc, tutor_text
from scores.models import Score

from .models import TutorUsageQuota

logger = logging.getLogger(__name__)

API = "https://generativelanguage.googleapis.com"
LIVE_WS_URL = (
    "wss://generativelanguage.googleapis.com/ws/"
    "google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContentConstrained"
)


class TutorUnavailable(Exception):
    """Gemini is not configured or did not answer."""


def score_context(score: Score) -> str:
    lines = [
        f"Título: {score.title}",
        f"Instrumento: {score.instrument}",
        f"Descripción: {score.description}",
        f"Formato: {'notación ABC' if score.score_format == Score.Format.ABC else 'texto libre'}",
    ]
    if score.score_format == Score.Format.ABC:
        try:
            lines.append(f"Resumen: {tutor_text(read_abc(score.content))}")
        except UnsupportedAbc:
            lines.append("Resumen: la partitura usa elementos ABC que Notara no reproduce.")
    lines.append("Contenido de la partitura:\n" + score.content[:1000])
    return "\n".join(lines)


def instruction(score: Score, spoken: bool) -> str:
    style = (
        "Hablas en voz alta: responde en 2 a 4 frases cortas, tono cálido y claro."
        if spoken
        else "Responde por escrito en un máximo de 5 frases."
    )
    return (
        "Eres el tutor musical de Notara, una comunidad para compartir partituras. "
        "Hablas siempre en español, con paciencia, para estudiantes de música. "
        f"{style} "
        "Responde solo sobre la partitura indicada y sobre teoría o práctica musical; si te "
        "preguntan otra cosa, di amablemente que solo puedes ayudar con música. "
        "No inventes datos que no estén en la partitura; si algo no se puede saber, dilo. "
        "Si la partitura es texto libre, explícala con lo que contiene y menciona que la "
        "reproducción y el solfeo necesitan notación ABC.\n\n"
        "PARTITURA:\n" + score_context(score)
    )


def _post(url: str, body: dict, timeout: int = 15) -> dict:
    if not settings.GEMINI_API_KEY:
        raise TutorUnavailable("not configured")
    request = urllib.request.Request(
        url,
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "x-goog-api-key": settings.GEMINI_API_KEY},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return json.load(response)
    except urllib.error.HTTPError as exc:
        raise TutorUnavailable(f"HTTP {exc.code}") from exc
    except (urllib.error.URLError, TimeoutError, OSError, ValueError) as exc:
        raise TutorUnavailable(type(exc).__name__) from exc


def create_live_session(score: Score) -> dict:
    """Single-use token (1 min to connect, session capped by the client timer)."""
    now = dt.datetime.now(dt.timezone.utc)
    iso = lambda moment: moment.strftime("%Y-%m-%dT%H:%M:%SZ")  # noqa: E731
    setup = {
        "model": f"models/{settings.TUTOR_LIVE_MODEL}",
        "generationConfig": {"responseModalities": ["AUDIO"]},
        "systemInstruction": {"parts": [{"text": instruction(score, spoken=True)}]},
        "inputAudioTranscription": {},
        "outputAudioTranscription": {},
    }
    payload = _post(
        f"{API}/v1alpha/auth_tokens",
        {
            "uses": 1,
            "expireTime": iso(now + dt.timedelta(seconds=settings.TUTOR_SESSION_SECONDS + 60)),
            "newSessionExpireTime": iso(now + dt.timedelta(minutes=1)),
            "bidiGenerateContentSetup": setup,
        },
    )
    token = payload.get("name")
    if not token:
        raise TutorUnavailable("no token")
    return {
        "token": token,
        "ws_url": LIVE_WS_URL,
        "model": setup["model"],
        "max_seconds": settings.TUTOR_SESSION_SECONDS,
    }


def answer_text(score: Score, question: str) -> str:
    payload = _post(
        f"{API}/v1beta/models/{settings.TUTOR_TEXT_MODEL}:generateContent",
        {
            "systemInstruction": {"parts": [{"text": instruction(score, spoken=False)}]},
            "contents": [{"role": "user", "parts": [{"text": question}]}],
            "generationConfig": {"temperature": 0.4, "maxOutputTokens": 400},
        },
        timeout=20,
    )
    try:
        parts = payload["candidates"][0]["content"]["parts"]
        text = "".join(part.get("text", "") for part in parts).strip()
    except (KeyError, IndexError, TypeError) as exc:
        raise TutorUnavailable("unexpected response") from exc
    if not text:
        raise TutorUnavailable("empty answer")
    return text


def reserve(user_id: int, field: str, limit: int) -> bool:
    day = timezone.now().date()
    TutorUsageQuota.objects.get_or_create(user_id=user_id, day=day)
    return (
        TutorUsageQuota.objects.filter(user_id=user_id, day=day, **{f"{field}__lt": limit}).update(
            **{field: F(field) + 1}
        )
        == 1
    )


def release(user_id: int, field: str) -> None:
    TutorUsageQuota.objects.filter(user_id=user_id, day=timezone.now().date(), **{f"{field}__gt": 0}).update(
        **{field: F(field) - 1}
    )
