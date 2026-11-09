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
