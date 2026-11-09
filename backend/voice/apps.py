import sys

from django.apps import AppConfig
from django.conf import settings


class VoiceConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "voice"

    def ready(self):
        setup_commands = {
            "check",
            "collectstatic",
            "makemigrations",
            "migrate",
            "showmigrations",
            "test",
        }
        is_setup_command = (
            len(sys.argv) > 1
            and sys.argv[0].endswith("manage.py")
            and sys.argv[1] in setup_commands
        )
        if settings.STT_MODEL_REQUIRED and not is_setup_command:
            from .adapters import initialize_stt_adapter

            initialize_stt_adapter()
