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


class Reaction(models.Model):
    score = models.ForeignKey(
        Score,
        on_delete=models.CASCADE,
        related_name="reactions",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reactions",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["score", "user"],
                name="unique_reaction_per_user_per_score",
            )
        ]

    def __str__(self) -> str:
        return f"{self.user} → {self.score}"


class Comment(models.Model):
    score = models.ForeignKey(
        Score,
        on_delete=models.CASCADE,
        related_name="comments",
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="comments",
    )
    body = models.TextField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("created_at",)

    def __str__(self) -> str:
        return f"{self.author} on {self.score}: {self.body[:40]}"
