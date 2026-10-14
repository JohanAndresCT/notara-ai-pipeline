import json
import re
import warnings
from json import JSONDecodeError
from pathlib import Path

from PIL import Image, UnidentifiedImageError
from django.conf import settings
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db import IntegrityError, transaction
from django.core.files.storage import default_storage
from django.http import FileResponse, JsonResponse
from django.http.multipartparser import MultiPartParser, MultiPartParserError
from django.db.models import Count
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_http_methods, require_POST

from .models import User

PROFILE_INSTRUMENTS = {"Piano", "Guitarra", "Violín", "Flauta", "Voz", "Otro"}


@ensure_csrf_cookie
@require_GET
def csrf_token_view(request):
    return JsonResponse({"csrfToken": get_token(request)})


@require_POST
def register_view(request):
    try:
        payload = json.loads(request.body or "{}")
    except (JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"message": "Request body must be valid JSON."}, status=400)

    if not isinstance(payload, dict):
        return JsonResponse({"message": "Request body must be a JSON object."}, status=400)

    raw_name = payload.get("name")
    raw_email = payload.get("email")
    password = payload.get("password")
    errors = {}

    name = raw_name.strip() if isinstance(raw_name, str) else ""
    email = User.objects.normalize_address(raw_email) if isinstance(raw_email, str) else ""

    if not name:
        errors["name"] = ["Enter your name."]
    elif len(name) > 150:
        errors["name"] = ["Name must be 150 characters or fewer."]

    if not email:
        errors["email"] = ["Enter your email address."]
    else:
        try:
            validate_email(email)
        except ValidationError:
            errors["email"] = ["Enter a valid email address."]
        else:
            if len(email) > 254:
                errors["email"] = ["Email address must be 254 characters or fewer."]
            elif User.objects.filter(email=email).exists():
                errors["email"] = ["An account with this email already exists."]

    if not isinstance(password, str) or not password:
        errors["password"] = ["Enter a password."]
    elif len(password) < 8:
        errors["password"] = ["Password must be at least 8 characters long."]

    if errors:
        return JsonResponse({"errors": errors}, status=400)

    try:
        with transaction.atomic():
            user = User.objects.create_user(email=email, name=name, password=password)
    except IntegrityError:
        return JsonResponse(
            {"errors": {"email": ["An account with this email already exists."]}},
            status=400,
        )

    login(request, user, backend="django.contrib.auth.backends.ModelBackend")
    return JsonResponse({"user": _profile_data(user)}, status=201)


@require_POST
def login_view(request):
    try:
        payload = json.loads(request.body or "{}")
    except (JSONDecodeError, UnicodeDecodeError):
        payload = {}

    if not isinstance(payload, dict):
        payload = {}

    raw_email = payload.get("email")
    password = payload.get("password")
    email = User.objects.normalize_address(raw_email) if isinstance(raw_email, str) else ""

    user = None
    if email and isinstance(password, str) and password:
        user = authenticate(request, username=email, password=password)

    if user is None:
        return JsonResponse(
            {"message": "Email or password is incorrect."},
            status=400,
        )

    login(request, user)
    return JsonResponse({"user": _profile_data(user)})


@require_POST
def logout_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({"message": "Authentication is required."}, status=401)

    logout(request)
    return JsonResponse({"message": "Logged out."})


def _profile_data(user):
    from scores.models import Score

    score_stats = Score.objects.filter(owner=user).aggregate(
        score_count=Count("id", distinct=True),
        likes_received=Count("reactions", distinct=True),
    )
    return {
        "id": user.pk,
        "username": user.username,
        "name": user.name,
        "email": user.email,
        "description": user.description,
        "main_instrument": user.main_instrument,
        "date_joined": user.date_joined.isoformat(),
        "score_count": score_stats["score_count"],
        "likes_received": score_stats["likes_received"],
        "photo_url": "/api/v1/me/photo/" if user.photo else None,
    }


def _profile_photo_error(upload):
    allowed_extensions = {".jpg": "JPEG", ".jpeg": "JPEG", ".png": "PNG"}
    extension = Path(upload.name).suffix.lower()
    if extension not in allowed_extensions:
        return "Choose a JPG or PNG image."
    if upload.size > settings.PROFILE_PHOTO_MAX_BYTES:
        return "The image exceeds the configured upload size limit."

    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            with Image.open(upload) as image:
                image_format = image.format
                image.verify()
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError, Image.DecompressionBombWarning):
        return "The uploaded file is not a valid JPG or PNG image."
    finally:
        upload.seek(0)

    if image_format != allowed_extensions[extension]:
        return "The image content does not match its JPG or PNG file extension."
    return None


def _profile_update_data(request):
    if request.content_type == "application/json":
        try:
            data = json.loads(request.body or "{}")
        except (JSONDecodeError, UnicodeDecodeError):
            return None, request.FILES
        return (data, request.FILES) if isinstance(data, dict) else (None, request.FILES)

    if request.method == "PATCH" and request.content_type.startswith("multipart/form-data"):
        try:
            return MultiPartParser(
                request.META,
                request,
                request.upload_handlers,
                request.encoding,
            ).parse()
        except MultiPartParserError:
            return None, request.FILES

    return request.POST, request.FILES


@require_http_methods(["GET", "PATCH"])
def current_user_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({"message": "Authentication is required."}, status=401)

    if request.method == "GET":
        return JsonResponse({"user": _profile_data(request.user)})

    user = request.user
    errors = {}
    update_fields = []
    profile_data, uploaded_files = _profile_update_data(request)
    if profile_data is None:
        return JsonResponse({"message": "Profile update must contain valid form data."}, status=400)

    if "name" in profile_data:
        raw_name = profile_data.get("name")
        name = raw_name.strip() if isinstance(raw_name, str) else ""
        if not name:
            errors["name"] = ["Name is required."]
        elif len(name) > 150:
            errors["name"] = ["Name must be 150 characters or fewer."]
        else:
            user.name = name
            update_fields.append("name")

    if "username" in profile_data:
        raw_username = profile_data.get("username")
        username = raw_username.strip().lower() if isinstance(raw_username, str) else ""
        if not username:
            errors["username"] = ["Username is required."]
        elif len(username) > 30 or not re.fullmatch(r"[a-z0-9._-]+", username):
            errors["username"] = [
                "Use up to 30 lowercase letters, numbers, dots, underscores, or hyphens."
            ]
        elif User.objects.filter(username=username).exclude(pk=user.pk).exists():
            errors["username"] = ["This username is already taken."]
        else:
            user.username = username
            update_fields.append("username")

    if "description" in profile_data:
        raw_description = profile_data.get("description")
        description = raw_description.strip() if isinstance(raw_description, str) else ""
        if len(description) > 500:
            errors["description"] = ["Description must be 500 characters or fewer."]
        else:
            user.description = description
            update_fields.append("description")

    if "main_instrument" in profile_data:
        raw_instrument = profile_data.get("main_instrument")
        instrument = raw_instrument.strip() if isinstance(raw_instrument, str) else ""
        if instrument and instrument not in PROFILE_INSTRUMENTS:
            errors["main_instrument"] = ["Choose an instrument from the list."]
        else:
            user.main_instrument = instrument
            update_fields.append("main_instrument")

    photo = uploaded_files.get("photo")
    if photo:
        photo_error = _profile_photo_error(photo)
        if photo_error:
            errors["photo"] = [photo_error]
        else:
            update_fields.append("photo")

    if errors:
        return JsonResponse({"errors": errors}, status=400)

    previous_photo_name = user.photo.name if user.photo else ""
    if photo:
        user.photo = photo
    if update_fields:
        user.save(update_fields=update_fields)
    if photo and previous_photo_name and previous_photo_name != user.photo.name:
        default_storage.delete(previous_photo_name)

    return JsonResponse({"user": _profile_data(user)})


@require_GET
def profile_photo_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({"message": "Authentication is required."}, status=401)
    if not request.user.photo:
        return JsonResponse({"message": "No profile photo is set."}, status=404)

    suffix = Path(request.user.photo.name).suffix.lower()
    content_type = "image/png" if suffix == ".png" else "image/jpeg"
    response = FileResponse(
        default_storage.open(request.user.photo.name, "rb"),
        content_type=content_type,
    )
    response["Cache-Control"] = "private, no-store"
    response["X-Content-Type-Options"] = "nosniff"
    return response


@require_POST
def change_password_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({"message": "Authentication is required."}, status=401)

    try:
        payload = json.loads(request.body or "{}")
    except (JSONDecodeError, UnicodeDecodeError):
        payload = {}
    if not isinstance(payload, dict):
        payload = {}

    current_password = payload.get("current_password")
    new_password = payload.get("new_password")
    errors = {}
    if not isinstance(current_password, str) or not current_password:
        errors["current_password"] = ["Enter your current password."]
    elif not request.user.check_password(current_password):
        errors["current_password"] = ["Current password is incorrect."]

    if not isinstance(new_password, str) or not new_password:
        errors["new_password"] = ["Enter a new password."]
    elif len(new_password) < 8:
        errors["new_password"] = ["Password must be at least 8 characters long."]

    if errors:
        return JsonResponse({"errors": errors}, status=400)

    request.user.set_password(new_password)
    request.user.save(update_fields=["password"])
    update_session_auth_hash(request, request.user)
    return JsonResponse({"message": "Password changed."})
