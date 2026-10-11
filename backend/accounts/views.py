import json
from json import JSONDecodeError

from django.contrib.auth import login
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db import IntegrityError, transaction
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_POST

from .models import User


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
    return JsonResponse(
        {"user": {"id": user.pk, "name": user.name, "email": user.email}},
        status=201,
    )


@require_GET
def current_user_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({"message": "Authentication is required."}, status=401)

    return JsonResponse(
        {
            "user": {
                "id": request.user.pk,
                "name": request.user.name,
                "email": request.user.email,
            }
        }
    )
