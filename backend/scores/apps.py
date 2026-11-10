from django.apps import AppConfig


class ScoresConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "scores"

    def ready(self):
        from . import signals  # noqa: F401  (registers the audio cleanup handler)
