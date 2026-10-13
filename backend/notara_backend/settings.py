import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR.parent / ".env")

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
