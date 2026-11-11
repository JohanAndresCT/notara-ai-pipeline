"""AI interpretation of dictation transcripts with Google Gemini (CR-006, BR-032).

Used only when the deterministic parser rejects a Whisper transcript. Gemini receives the
transcript *text* (never audio) and rewrites it using the BR-013 vocabulary; the result is
parsed again by the same deterministic parser, which stays the only source of ABC.
"""

import json
import logging
import urllib.error
import urllib.request
from abc import ABC, abstractmethod

from django.conf import settings

logger = logging.getLogger(__name__)

API_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

INSTRUCTION = """Eres un corrector de dictados musicales en español para una app de partituras.
Recibes la transcripción automática (con errores) de una persona que dictó notas.
Reescríbela usando SOLO este vocabulario, separado por comas:
- Notas: Do, Re, Mi, Fa, Sol, La, Si (opcionalmente seguidas de "sostenido" o "bemol").
- Figuras después de la nota: redonda, blanca, negra, corchea, semicorchea.
- Silencios: "silencio de redonda", "silencio de blanca", "silencio de negra", "silencio de corchea", "silencio de semicorchea".
- Compás: "compás dos cuartos", "compás tres cuartos", "compás cuatro cuartos", "compás seis octavos".
- Barra de compás: "barra".
Reglas estrictas:
- Corrige ortografía, palabras unidas o partidas y errores de reconocimiento evidentes
  (ej.: "Donegra" -> "Do negra", "se mi corchea" -> "semicorchea", "Son" -> "Sol", "con paz" -> "compás").
- NO inventes, añadas, quites ni reordenes notas, figuras, silencios, barras ni compases.
- Si una palabra no se puede relacionar con certeza con el vocabulario, o el texto no es un dictado musical,
  responde status "unintelligible".
Responde solo con el JSON pedido."""

SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "status": {"type": "STRING", "enum": ["ok", "unintelligible"]},
        "text": {"type": "STRING"},
    },
    "required": ["status"],
}


class NormalizerError(Exception):
    """The AI provider could not produce a usable answer (not configured, timeout, HTTP error)."""


class DictationNormalizer(ABC):
    @abstractmethod
    def normalize(self, transcript: str) -> str | None:
        """Return the transcript rewritten in the vocabulary, or None if unintelligible."""


class GeminiNormalizer(DictationNormalizer):
    def normalize(self, transcript: str) -> str | None:
        if not settings.GEMINI_API_KEY:
            raise NormalizerError("not configured")
        body = {
            "systemInstruction": {"parts": [{"text": INSTRUCTION}]},
            "contents": [{"role": "user", "parts": [{"text": transcript[:600]}]}],
            "generationConfig": {
                "temperature": 0,
                "maxOutputTokens": 256,
                "responseMimeType": "application/json",
                "responseSchema": SCHEMA,
            },
        }
        request = urllib.request.Request(
            API_URL.format(model=settings.GEMINI_MODEL),
            data=json.dumps(body).encode(),
            headers={"Content-Type": "application/json", "x-goog-api-key": settings.GEMINI_API_KEY},
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=settings.GEMINI_TIMEOUT_SECONDS) as response:
                payload = json.load(response)
        except urllib.error.HTTPError as exc:
            raise NormalizerError(f"HTTP {exc.code}") from exc
        except (urllib.error.URLError, TimeoutError, OSError, ValueError) as exc:
            raise NormalizerError(type(exc).__name__) from exc
        try:
            raw = payload["candidates"][0]["content"]["parts"][0]["text"]
            answer = json.loads(raw)
        except (KeyError, IndexError, TypeError, ValueError) as exc:
            raise NormalizerError("unexpected response") from exc
        if answer.get("status") != "ok":
            return None
        text = str(answer.get("text") or "").strip()
        return text or None


def get_normalizer() -> DictationNormalizer | None:
    """The configured normalizer, or None when dictation AI is disabled."""
    if not settings.DICTATION_AI_ENABLED:
        return None
    return GeminiNormalizer()
