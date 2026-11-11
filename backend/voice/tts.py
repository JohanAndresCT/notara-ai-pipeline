"""Text-to-speech engines behind one adapter interface (P05 ADR-006, ADR-015).

- ``fake``: deterministic bytes, no network (automated tests and CI, DEC-230).
- ``edge``: ``edge-tts`` online voice; default in local development and fallback (DEC-202).
- ``elevenlabs``: AI voice, primary whenever ``ELEVENLABS_API_KEY`` is set (DEC-202, DEC-241).
"""

import asyncio
import hashlib
import json
import logging
import urllib.error
import urllib.request
from abc import ABC, abstractmethod

from django.conf import settings

logger = logging.getLogger(__name__)


class TtsProviderError(Exception):
    """The engine could not produce audio (credits, rate limit, outage, timeout)."""


class TtsAdapter(ABC):
    engine = ""
    supports_pause_markup = False

    @property
    @abstractmethod
    def voice_id(self) -> str:
        raise NotImplementedError

    @abstractmethod
    def synthesize(self, text: str) -> bytes:
        raise NotImplementedError


class FakeTtsAdapter(TtsAdapter):
    engine = "fake"

    @property
    def voice_id(self) -> str:
        return "fake-es"

    def synthesize(self, text: str) -> bytes:
        # Minimal ID3-tagged payload; deterministic so tests can compare bytes.
        return b"ID3\x04\x00\x00\x00\x00\x00\x00" + hashlib.sha256(text.encode()).digest()


class EdgeTtsAdapter(TtsAdapter):
    engine = "edge"

    @property
    def voice_id(self) -> str:
        return settings.EDGE_TTS_VOICE

    def synthesize(self, text: str) -> bytes:
        try:
            return asyncio.run(asyncio.wait_for(self._collect(text), settings.TTS_TIMEOUT_SECONDS))
        except Exception as exc:  # network, service or timeout errors from edge-tts
            raise TtsProviderError(type(exc).__name__) from exc

    async def _collect(self, text: str) -> bytes:
        import edge_tts

        chunks = []
        async for chunk in edge_tts.Communicate(text, self.voice_id).stream():
            if chunk.get("type") == "audio":
                chunks.append(chunk["data"])
        audio = b"".join(chunks)
        if not audio:
            raise TtsProviderError("empty audio")
        return audio


class ElevenLabsTtsAdapter(TtsAdapter):
    engine = "elevenlabs"
    supports_pause_markup = True
    url = "https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=mp3_44100_128"

    @property
    def voice_id(self) -> str:
        return settings.ELEVENLABS_VOICE_ID

    # Only these models accept ``language_code``; others (e.g. eleven_multilingual_v2)
    # reject the request when it is present, so it is sent only where supported.
    LANGUAGE_CODE_MODELS = {"eleven_turbo_v2_5", "eleven_flash_v2_5"}

    def payload(self, text: str) -> dict:
        body = {"text": text, "model_id": settings.ELEVENLABS_MODEL_ID}
        if settings.ELEVENLABS_MODEL_ID in self.LANGUAGE_CODE_MODELS:
            body["language_code"] = "es"
        return body

    def synthesize(self, text: str) -> bytes:
        if not settings.ELEVENLABS_API_KEY or not settings.ELEVENLABS_VOICE_ID:
            raise TtsProviderError("not configured")
        request = urllib.request.Request(
            self.url.format(voice=self.voice_id),
            data=json.dumps(self.payload(text)).encode(),
            headers={
                "xi-api-key": settings.ELEVENLABS_API_KEY,
                "Content-Type": "application/json",
                "Accept": "audio/mpeg",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=settings.TTS_TIMEOUT_SECONDS) as response:
                audio = response.read()
        except urllib.error.HTTPError as exc:  # 402 no credits, 429 rate limit, 5xx outage
            raise TtsProviderError(f"HTTP {exc.code}") from exc
        except (urllib.error.URLError, TimeoutError, OSError) as exc:
            raise TtsProviderError(type(exc).__name__) from exc
        if not audio:
            raise TtsProviderError("empty audio")
        return audio


ENGINES = {
    "fake": FakeTtsAdapter,
    "edge": EdgeTtsAdapter,
    "elevenlabs": ElevenLabsTtsAdapter,
}


def engine_chain() -> list[TtsAdapter]:
    """Primary engine first, then the free fallback (HU17)."""
    primary = settings.VOICE_PRIMARY_ENGINE
    chain = [ENGINES[primary]()]
    if primary == "elevenlabs":
        chain.append(EdgeTtsAdapter())
    return chain
