import json
import re
from json import JSONDecodeError

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

from .models import Score

ABC_REQUIRED_FIELDS = ("X", "T", "M", "L", "K")
ABC_NOTE_PATTERN = re.compile(r"(?<![A-Za-z])[A-Ga-gzZ](?:[,']*)(?:\d+|/\d+)?")
ABC_MUSIC_LINE_PATTERN = re.compile(r"^[A-Ga-gzZ0-9|:\[\](){}<>^_=,'/.\-\s]+$")


def _score_data(score):
    return {
        "id": score.pk,
        "title": score.title,
        "instrument": score.instrument,
        "description": score.description,
        "format": score.score_format,
        "content": score.content,
        "author": score.owner.name,
        "created_at": score.created_at.isoformat(),
    }


def _abc_validation_error(content):
    lines = content.splitlines()
    missing_fields = [
        field
        for field in ABC_REQUIRED_FIELDS
        if not any(line.startswith(f"{field}:") for line in lines)
    ]
    if missing_fields:
        return "ABC score must include X:, T:, M:, L:, and K: fields."

    music_lines = [line for line in lines if line and not re.match(r"^[A-Za-z]:", line)]
    if not any(
        ABC_MUSIC_LINE_PATTERN.fullmatch(line) and ABC_NOTE_PATTERN.search(line)
        for line in music_lines
    ):
        return "ABC score must contain at least one note or rest on a musical line."
    return None


def scores_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({"message": "Authentication is required."}, status=401)

    if request.method == "GET":
        scores = Score.objects.select_related("owner").all()
        return JsonResponse({"scores": [_score_data(score) for score in scores]})

    if request.content_type != "application/json":
        return JsonResponse({"message": "Request body must be JSON."}, status=400)
    try:
        payload = json.loads(request.body or "{}")
    except (JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"message": "Request body must be valid JSON."}, status=400)
    if not isinstance(payload, dict):
        return JsonResponse({"message": "Request body must be a JSON object."}, status=400)

    errors = {}
    title = payload.get("title")
    instrument = payload.get("instrument")
    description = payload.get("description")
    score_format = payload.get("format")
    content = payload.get("content")

    normalized = {
        "title": title.strip() if isinstance(title, str) else "",
        "instrument": instrument.strip() if isinstance(instrument, str) else "",
        "description": description.strip() if isinstance(description, str) else "",
        "content": content if isinstance(content, str) else "",
    }
    for field, value in normalized.items():
        if field != "content" and not value:
            errors[field] = [f"{field.replace('_', ' ').capitalize()} is required."]

    if score_format not in Score.Format.values:
        errors["format"] = ["Choose ABC notation or plain text."]
    if not normalized["content"].strip():
        errors["content"] = ["Score content is required."]
    elif len(normalized["content"]) > 1000:
        errors["content"] = ["Score content must be 1,000 characters or fewer."]
    elif score_format == Score.Format.ABC:
        abc_error = _abc_validation_error(normalized["content"])
        if abc_error:
            errors["content"] = [abc_error]

    if errors:
        return JsonResponse({"errors": errors}, status=400)

    score = Score.objects.create(
        owner=request.user,
        title=normalized["title"],
        instrument=normalized["instrument"],
        description=normalized["description"],
        score_format=score_format,
        content=normalized["content"],
    )
    return JsonResponse({"score": _score_data(score)}, status=201)


scores_view = require_http_methods(["GET", "POST"])(scores_view)
