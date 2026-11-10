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
    class Kind(models.TextChoices):
        TEXT = "TEXT", "Text"
        VOICE = "VOICE", "Voice"  # HU12: transcribed text plus its audio

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
    # 500 characters for text comments; up to 1,000 for voice transcripts (DEC-231),
    # enforced in the views.
    body = models.TextField(max_length=1000)
    kind = models.CharField(max_length=5, choices=Kind.choices, default=Kind.TEXT)
    audio = models.FileField(upload_to="voice_comments/%Y/%m/", blank=True)
    audio_mime = models.CharField(max_length=32, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("created_at", "id")
        indexes = [
            models.Index(fields=("score", "created_at", "id"), name="comment_score_recent_idx")
        ]

    def __str__(self) -> str:
        return f"Comment by {self.author} on {self.score}"


class Like(models.Model):
    score = models.ForeignKey(
        Score,
        on_delete=models.CASCADE,
        related_name="likes",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="likes",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("score", "user"),
                name="unique_score_like_per_user",
            )
        ]
        indexes = [
            models.Index(fields=("score", "created_at"), name="like_score_recent_idx")
        ]

    def __str__(self) -> str:
        return f"Like by {self.user} on {self.score}"
