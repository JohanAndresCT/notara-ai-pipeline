import json
import re
from json import JSONDecodeError

from django.http import JsonResponse
from django.middleware.csrf import CsrfViewMiddleware
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

_csrf_middleware = CsrfViewMiddleware(lambda req: None)

from django.db import IntegrityError
from .models import Score, Reaction, Comment

ABC_REQUIRED_FIELDS = ("X", "T", "M", "L", "K")
ABC_NOTE_PATTERN = re.compile(r"(?<![A-Za-z])[A-Ga-gzZ](?:[,']*)(?:\d+|/\d+)?")
ABC_MUSIC_LINE_PATTERN = re.compile(r"^[A-Ga-gzZ0-9|:\[\](){}<>^_=,'/.\-\s]+$")


def _score_data(score, user=None):
    return {
        "id": score.pk,
        "title": score.title,
        "instrument": score.instrument,
        "description": score.description,
        "format": score.score_format,
        "content": score.content,
        "author": score.owner.name,
        "author_id": score.owner.pk,
        "created_at": score.created_at.isoformat(),
        "reaction_count": score.reactions.count(),
        "user_reacted": (
            score.reactions.filter(user=user).exists() if user else False
        ),
    }


def _comment_data(comment):
    return {
        "id": comment.pk,
        "body": comment.body,
        "author": comment.author.name,
        "author_id": comment.author.pk,
        "created_at": comment.created_at.isoformat(),
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
        return JsonResponse({"scores": [_score_data(score, request.user) for score in scores]})

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
    return JsonResponse({"score": _score_data(score, request.user)}, status=201)


@csrf_exempt
@require_http_methods(["PATCH", "DELETE"])
def score_detail_view(request, score_id):
    if not request.user.is_authenticated:
        return JsonResponse({"message": "Authentication is required."}, status=401)

    csrf_failure = _csrf_middleware.process_view(request, None, (), {})
    if csrf_failure is not None:
        return csrf_failure

    try:
        score = Score.objects.select_related("owner").get(pk=score_id)
    except Score.DoesNotExist:
        return JsonResponse({"message": "Score not found."}, status=404)

    if score.owner != request.user:
        return JsonResponse({"message": "You do not have permission to edit this score."}, status=403)

    if request.method == "DELETE":
        score.delete()
        return JsonResponse({}, status=204)

    if request.content_type != "application/json":
        return JsonResponse({"message": "Request body must be JSON."}, status=400)
    try:
        payload = json.loads(request.body or "{}")
    except (JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"message": "Request body must be valid JSON."}, status=400)
    if not isinstance(payload, dict):
        return JsonResponse({"message": "Request body must be a JSON object."}, status=400)

    errors = {}
    if "title" in payload:
        if not isinstance(payload["title"], str) or payload["title"].strip() == "":
            errors["title"] = ["Title is required."]
    if "instrument" in payload:
        if not isinstance(payload["instrument"], str) or payload["instrument"].strip() == "":
            errors["instrument"] = ["Instrument is required."]

    if errors:
        return JsonResponse({"errors": errors}, status=400)

    if "title" in payload:
        score.title = payload["title"].strip()
    if "instrument" in payload:
        score.instrument = payload["instrument"].strip()
    if "description" in payload:
        score.description = payload["description"] if isinstance(payload["description"], str) else ""

    score.save()
    return JsonResponse({"score": _score_data(score, request.user)})


@csrf_exempt
@require_http_methods(["POST"])
def score_reaction_view(request, score_id):
    if not request.user.is_authenticated:
        return JsonResponse({"message": "Authentication is required."}, status=401)

    csrf_failure = _csrf_middleware.process_view(request, None, (), {})
    if csrf_failure is not None:
        return csrf_failure

    try:
        score = Score.objects.select_related("owner").get(pk=score_id)
    except Score.DoesNotExist:
        return JsonResponse({"message": "Score not found."}, status=404)

    if score.owner == request.user:
        return JsonResponse(
            {"message": "You cannot react to your own score."}, status=403
        )

    deleted, _ = Reaction.objects.filter(
        score=score, user=request.user
    ).delete()

    if deleted:
        return JsonResponse(
            {
                "reacted": False,
                "reaction_count": score.reactions.count(),
            },
            status=200,
        )

    Reaction.objects.create(score=score, user=request.user)
    return JsonResponse(
        {
            "reacted": True,
            "reaction_count": score.reactions.count(),
        },
        status=201,
    )


@csrf_exempt
@require_http_methods(["GET", "POST"])
def score_comments_view(request, score_id):
    if not request.user.is_authenticated:
        return JsonResponse({"message": "Authentication is required."}, status=401)

    # CSRF only required on writes
    if request.method == "POST":
        csrf_failure = _csrf_middleware.process_view(request, None, (), {})
        if csrf_failure is not None:
            return csrf_failure

    try:
        score = Score.objects.get(pk=score_id)
    except Score.DoesNotExist:
        return JsonResponse({"message": "Score not found."}, status=404)

    if request.method == "GET":
        comments = score.comments.select_related("author").all()
        return JsonResponse(
            {"comments": [_comment_data(c) for c in comments]},
            status=200,
        )

    # POST — create comment
    if request.content_type != "application/json":
        return JsonResponse({"message": "Request body must be JSON."}, status=400)
    try:
        payload = json.loads(request.body or "{}")
    except (JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"message": "Request body must be valid JSON."}, status=400)
    if not isinstance(payload, dict):
        return JsonResponse({"message": "Request body must be a JSON object."}, status=400)

    body = payload.get("body", "")
    if not isinstance(body, str) or not body.strip():
        return JsonResponse({"errors": {"body": ["Comment body is required."]}}, status=400)
    if len(body) > 500:
        return JsonResponse(
            {"errors": {"body": ["Comment must be 500 characters or fewer."]}},
            status=400,
        )

    comment = Comment.objects.create(
        score=score,
        author=request.user,
        body=body.strip(),
    )
    return JsonResponse({"comment": _comment_data(comment)}, status=201)


@csrf_exempt
@require_http_methods(["DELETE"])
def score_comment_detail_view(request, score_id, comment_id):
    if not request.user.is_authenticated:
        return JsonResponse({"message": "Authentication is required."}, status=401)

    csrf_failure = _csrf_middleware.process_view(request, None, (), {})
    if csrf_failure is not None:
        return csrf_failure

    try:
        comment = Comment.objects.select_related("author", "score").get(
            pk=comment_id, score_id=score_id
        )
    except Comment.DoesNotExist:
        return JsonResponse({"message": "Comment not found."}, status=404)

    if comment.author != request.user:
        return JsonResponse(
            {"message": "You do not have permission to delete this comment."},
            status=403,
        )

    comment.delete()
    return JsonResponse({}, status=204)


scores_view = require_http_methods(["GET", "POST"])(scores_view)
