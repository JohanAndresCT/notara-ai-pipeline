from django.db.models import F
from django.utils import timezone

from .models import STTInferenceQuota


def reserve_daily_inference(user_id: int, limit: int) -> bool:
    day = timezone.now().date()
    STTInferenceQuota.objects.get_or_create(
        user_id=user_id,
        day=day,
        defaults={"admitted_inferences": 0},
    )
    return (
        STTInferenceQuota.objects.filter(
            user_id=user_id,
            day=day,
            admitted_inferences__lt=limit,
        ).update(admitted_inferences=F("admitted_inferences") + 1)
        == 1
    )
