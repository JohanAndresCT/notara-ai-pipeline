import os
from pathlib import Path

from dotenv import load_dotenv
from voice.model_config import MODEL_REVISION

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR.parent / ".env")


def _project_path(value: str, default: Path | None = None) -> str:
    if not value:
        return str(default.resolve()) if default is not None else ""
    candidate = Path(value)
    if not candidate.is_absolute():
        candidate = BASE_DIR.parent / candidate
    return str(candidate.resolve())


SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-secret-key-change-me")
DEBUG = os.getenv("DJANGO_DEBUG", "True").lower() == "true"
railway_public_domain = os.getenv("RAILWAY_PUBLIC_DOMAIN", "").strip()
allowed_hosts_setting = os.getenv("DJANGO_ALLOWED_HOSTS")
if allowed_hosts_setting:
    ALLOWED_HOSTS = [host.strip() for host in allowed_hosts_setting.split(",") if host.strip()]
elif DEBUG:
    ALLOWED_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0", "backend"]
else:
    ALLOWED_HOSTS = [host for host in (railway_public_domain, "healthcheck.railway.app") if host]

if not DEBUG:
    if SECRET_KEY == "dev-secret-key-change-me":
        raise ValueError("DJANGO_SECRET_KEY must be set when DJANGO_DEBUG is false.")
    if not allowed_hosts_setting:
        raise ValueError("Set DJANGO_ALLOWED_HOSTS explicitly for production.")
    if not ALLOWED_HOSTS or "*" in ALLOWED_HOSTS:
        raise ValueError("Set specific DJANGO_ALLOWED_HOSTS for production.")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "accounts.apps.AccountsConfig",
    "scores.apps.ScoresConfig",
    "voice.apps.VoiceConfig",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "notara_backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "notara_backend.wsgi.application"
ASGI_APPLICATION = "notara_backend.asgi.application"

DATABASE_ENGINE = os.getenv("DJANGO_DB_ENGINE", "postgresql").lower()
if DATABASE_ENGINE == "sqlite":
    # Local/test database: switch to PostgreSQL with DJANGO_DB_ENGINE=postgresql.
    sqlite_path = Path(os.getenv("SQLITE_DB_PATH", "db.sqlite3"))
    if not sqlite_path.is_absolute():
        sqlite_path = BASE_DIR.parent / sqlite_path
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": sqlite_path,
        }
    }
elif DATABASE_ENGINE in {"postgres", "postgresql"}:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.getenv("POSTGRES_DB", "notara"),
            "USER": os.getenv("POSTGRES_USER", "notara"),
            "PASSWORD": os.getenv("POSTGRES_PASSWORD", "notara"),
            "HOST": os.getenv("POSTGRES_HOST", "localhost"),
            "PORT": os.getenv("POSTGRES_PORT", "5432"),
        }
    }
else:
    raise ValueError("DJANGO_DB_ENGINE must be 'sqlite' or 'postgresql'.")

MEDIA_ROOT = Path(os.getenv("MEDIA_ROOT", BASE_DIR.parent / "media"))
if not MEDIA_ROOT.is_absolute():
    MEDIA_ROOT = BASE_DIR.parent / MEDIA_ROOT
STATIC_ROOT = Path(os.getenv("STATIC_ROOT", BASE_DIR.parent / "staticfiles"))
PROFILE_PHOTO_MAX_BYTES = int(os.getenv("PROFILE_PHOTO_MAX_BYTES", 5 * 1024 * 1024))
STT_DAILY_LIMIT = int(os.getenv("STT_DAILY_LIMIT", "30"))
STT_MODEL_ID = os.getenv(
    "STT_MODEL_ID",
    "Systran/faster-whisper-base",
).strip()
STT_MODEL_SIZE = os.getenv("STT_MODEL_SIZE", "base").strip()
STT_MODEL_DIR = _project_path(os.getenv("STT_MODEL_DIR", "").strip())
STT_MODEL_REVISION = os.getenv("STT_MODEL_REVISION", MODEL_REVISION).strip()
STT_MODEL_MANIFEST = _project_path(
    os.getenv("STT_MODEL_MANIFEST", "").strip(),
    BASE_DIR / "voice" / "model_sha256.json",
)
STT_MODEL_REQUIRED = os.getenv("STT_MODEL_REQUIRED", "false").lower() == "true"
STT_DEVICE = os.getenv("STT_DEVICE", "cpu").strip()
STT_COMPUTE_TYPE = os.getenv("STT_COMPUTE_TYPE", "int8").strip()
STT_LANGUAGE = os.getenv("STT_LANGUAGE", "es").strip()
STT_CPU_THREADS = int(os.getenv("STT_CPU_THREADS", "2"))
STT_MAX_CONCURRENT = int(os.getenv("STT_MAX_CONCURRENT", "1"))
AUDIO_MAX_BYTES = int(os.getenv("AUDIO_MAX_BYTES", str(2 * 1024 * 1024)))
AUDIO_MAX_SECONDS = int(os.getenv("AUDIO_MAX_SECONDS", "30"))
if STT_DAILY_LIMIT < 1:
    raise ValueError("STT_DAILY_LIMIT must be a positive integer.")
if AUDIO_MAX_BYTES < 1 or AUDIO_MAX_SECONDS < 1:
    raise ValueError("STT audio limits must be positive integers.")
if STT_CPU_THREADS < 1:
    raise ValueError("STT_CPU_THREADS must be a positive integer.")
if STT_MODEL_ID != "Systran/faster-whisper-base" or STT_MODEL_SIZE != "base":
    raise ValueError("HU11 requires the multilingual Systran/faster-whisper-base model.")
if STT_MODEL_REVISION != MODEL_REVISION:
    raise ValueError(f"HU11 model revision is pinned to {MODEL_REVISION}.")
if STT_DEVICE != "cpu" or STT_COMPUTE_TYPE != "int8" or STT_LANGUAGE != "es":
    raise ValueError("HU11 requires CPU/int8 inference with language=es.")
if STT_MAX_CONCURRENT != 1:
    raise ValueError("HU11 supports exactly one concurrent inference per process.")
if STT_MODEL_REQUIRED and not STT_MODEL_DIR:
    raise ValueError("STT_MODEL_DIR is required when STT_MODEL_REQUIRED is true.")

# MVP 2 voice synthesis (HU13, HU14, HU16, HU17; DEC-202, DEC-213, DEC-230, DEC-232).
VOICE_PRIMARY_ENGINE = os.getenv("VOICE_PRIMARY_ENGINE", "edge").strip().lower()
VOICE_DAILY_LIMIT = int(os.getenv("VOICE_DAILY_LIMIT", "20"))
TTS_TIMEOUT_SECONDS = int(os.getenv("TTS_TIMEOUT_SECONDS", "20"))
EDGE_TTS_VOICE = os.getenv("EDGE_TTS_VOICE", "es-ES-ElviraNeural").strip()
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "").strip()
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "").strip()
ELEVENLABS_MODEL_ID = os.getenv("ELEVENLABS_MODEL_ID", "eleven_multilingual_v2").strip()
if VOICE_PRIMARY_ENGINE not in {"fake", "edge", "elevenlabs"}:
    raise ValueError("VOICE_PRIMARY_ENGINE must be fake, edge or elevenlabs.")
if VOICE_DAILY_LIMIT < 1 or TTS_TIMEOUT_SECONDS < 1:
    raise ValueError("VOICE_DAILY_LIMIT and TTS_TIMEOUT_SECONDS must be positive integers.")
VOICE_COMMENT_MAX_CHARS = 1000  # DEC-231
CSRF_FAILURE_VIEW = "voice.csrf.csrf_failure"
STORAGES = {
    "default": {
        "BACKEND": os.getenv(
            "DJANGO_FILE_STORAGE_BACKEND",
            "django.core.files.storage.FileSystemStorage",
        )
    },
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"
    },
}

AUTH_USER_MODEL = "accounts.User"
default_csrf_origins = (
    "http://localhost:5173,http://127.0.0.1:5173"
    if DEBUG
    else f"https://{railway_public_domain}" if railway_public_domain else ""
)
CSRF_TRUSTED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("DJANGO_CSRF_TRUSTED_ORIGINS", default_csrf_origins).split(",")
    if origin.strip()
]
if not DEBUG and not CSRF_TRUSTED_ORIGINS:
    raise ValueError("Set DJANGO_CSRF_TRUSTED_ORIGINS for production.")
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
SECURE_SSL_REDIRECT = not DEBUG
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https") if not DEBUG else None
SECURE_HSTS_SECONDS = 31_536_000 if not DEBUG else 0

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication"
    ],
}
