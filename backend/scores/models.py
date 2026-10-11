from django.conf import settings
from django.db import models


class Score(models.Model):
    class Format(models.TextChoices):
        ABC = "ABC", "ABC notation"
        TEXT = "TEXT", "Plain text"

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="scores",
    )
    title = models.TextField()
    instrument = models.TextField()
    description = models.TextField()
    score_format = models.CharField(max_length=4, choices=Format.choices)
    content = models.TextField(max_length=1000)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at", "-id")
        indexes = [models.Index(fields=("-created_at", "-id"), name="score_recent_idx")]

    def __str__(self) -> str:
        return self.title
