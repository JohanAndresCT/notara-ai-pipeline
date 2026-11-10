"""Voice synthesis service: cache → quota → primary engine → fallback (HU13, HU14, HU16, HU17)."""

import hashlib
import logging

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.db import IntegrityError
from django.db.models import F
from django.utils import timezone

from .models import SynthesizedAudio, VoiceSynthesisQuota
from .tts import TtsAdapter, TtsProviderError, engine_chain

logger = logging.getLogger(__name__)
LANGUAGE = "es"


class SynthesisLimitReached(Exception):
    pass


class SynthesisUnavailable(Exception):
    pass


def cache_key(kind: str, text: str, adapter: TtsAdapter) -> str:
    raw = f"{kind}|{text}|{adapter.engine}:{adapter.voice_id}|{LANGUAGE}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def _read_cached(key: str) -> bytes | None:
    cached = SynthesizedAudio.objects.filter(key=key).first()
    if cached is None:
        return None
    try:
        with default_storage.open(cached.file.name, "rb") as stored:
            return stored.read()
    except OSError:
        cached.delete()  # file lost (e.g. non-persistent volume); regenerate
        return None


def _store(key: str, kind: str, adapter: TtsAdapter, audio: bytes) -> None:
    try:
        name = default_storage.save(f"audio_cache/{key}.mp3", ContentFile(audio))
        SynthesizedAudio.objects.create(
            key=key,
            kind=kind,
            engine=adapter.engine,
            voice_id=adapter.voice_id,
            language=LANGUAGE,
            file=name,
            size_bytes=len(audio),
        )
    except IntegrityError:
        pass  # a concurrent request stored the same audio first
    except OSError as exc:  # storage failure must not block the user (AC-058)
        logger.warning("Synthesized audio could not be stored (%s).", type(exc).__name__)


def _reserve(user_id: int) -> bool:
    day = timezone.now().date()
    VoiceSynthesisQuota.objects.get_or_create(user_id=user_id, day=day, defaults={"syntheses": 0})
    return (
        VoiceSynthesisQuota.objects.filter(
            user_id=user_id, day=day, syntheses__lt=settings.VOICE_DAILY_LIMIT
        ).update(syntheses=F("syntheses") + 1)
        == 1
    )


def _release(user_id: int) -> None:
    VoiceSynthesisQuota.objects.filter(
        user_id=user_id, day=timezone.now().date(), syntheses__gt=0
    ).update(syntheses=F("syntheses") - 1)


def synthesize(kind: str, texts: dict[bool, str], user_id: int, context: str) -> bytes:
    """Return MP3 bytes for ``texts`` (keyed by whether the engine supports pause markup).

    Never reveals which engine produced the audio (DEC-216); logs fallback use without
    personal content.
    """
    chain = engine_chain()
    keyed = [(adapter, texts[adapter.supports_pause_markup]) for adapter in chain]

    for adapter, text in keyed:
        cached = _read_cached(cache_key(kind, text, adapter))
        if cached is not None:
            return cached

    if not _reserve(user_id):
        raise SynthesisLimitReached

    for position, (adapter, text) in enumerate(keyed):
        try:
            audio = adapter.synthesize(text)
        except TtsProviderError as exc:
            if position + 1 < len(keyed):
                logger.warning("voice_fallback %s engine=%s reason=%s", context, adapter.engine, exc)
            else:
                logger.error("voice_unavailable %s engine=%s reason=%s", context, adapter.engine, exc)
            continue
        _store(cache_key(kind, text, adapter), kind, adapter, audio)
        return audio

    _release(user_id)
    raise SynthesisUnavailable
