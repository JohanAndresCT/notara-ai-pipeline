from django.conf import settings
from django.db import models


class STTInferenceQuota(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="stt_inference_quotas",
    )
    day = models.DateField()
    admitted_inferences = models.PositiveIntegerField(default=0)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("user", "day"),
                name="unique_stt_quota_user_day",
            )
        ]


class VoiceSynthesisQuota(models.Model):
    """New voice syntheses per user and UTC day (DEC-213; cache hits do not count)."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="voice_synthesis_quotas",
    )
    day = models.DateField()
    syntheses = models.PositiveIntegerField(default=0)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("user", "day"),
                name="unique_tts_quota_user_day",
            )
        ]


class SynthesizedAudio(models.Model):
    """Stored synthesized audio, keyed by kind + spoken text + voice + language (DEC-210).

    Contains no user voice and is not linked to users (DEC-214)."""

    class Kind(models.TextChoices):
        SOLFEGE = "SOLFEGE", "Solfege"
        TUTOR = "TUTOR", "Tutor"

    key = models.CharField(max_length=64, unique=True)
    kind = models.CharField(max_length=8, choices=Kind.choices)
    engine = models.CharField(max_length=16)
    voice_id = models.CharField(max_length=128)
    language = models.CharField(max_length=8, default="es")
    file = models.FileField(upload_to="audio_cache/")
    size_bytes = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
