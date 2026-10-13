import json
import re
from json import JSONDecodeError

from django.core.paginator import Paginator
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

from .models import Comment, Like, Score

ABC_REQUIRED_FIELDS = ("X", "T", "M", "L", "K")
ABC_NOTE_PATTERN = re.compile(r"(?<![A-Za-z])[A-Ga-gzZ](?:[,']*)(?:\d+|/\d+)?")
ABC_MUSIC_LINE_PATTERN = re.compile(r"^[A-Ga-gzZ0-9|:\[\](){}<>^_=,'/.\-\s]+$")


def _score_data(score, user=None, include_content=True):
    data = {
        "id": score.pk,
        "title": score.title,
        "instrument": score.instrument,
        "description": score.description,
        "format": score.score_format,
        "author": score.owner.name,
        "created_at": score.created_at.isoformat(),
        "like_count": getattr(score, "like_count", score.likes.count()),
        "comment_count": getattr(score, "comment_count", score.comments.count()),
        "is_owner": user is not None and score.owner_id == user.pk,
    }
    if include_content:
        data["content"] = score.content
    if user is not None:
        data["is_liked"] = score.likes.filter(user=user).exists()
    return data


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


def _score_payload_errors(payload):
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
    return normalized, score_format, errors


def _json_payload(request):
    if request.content_type != "application/json":
        return None, {"message": "Request body must be JSON."}
    try:
        payload = json.loads(request.body or "{}")
    except (JSONDecodeError, UnicodeDecodeError):
        return None, {"message": "Request body must be valid JSON."}
    if not isinstance(payload, dict):
        return None, {"message": "Request body must be a JSON object."}
    return payload, None


def scores_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({"message": "Authentication is required."}, status=401)

    if request.method == "GET":
        scores = Score.objects.select_related("owner").all()
        instrument = request.GET.get("instrument", "").strip()
        if instrument:
            scores = scores.filter(instrument__iexact=instrument)
        paginator = Paginator(scores, 10)
        page_number = request.GET.get("page", "1")
        try:
            page = paginator.page(page_number)
        except (TypeError, ValueError):
            return JsonResponse({"message": "Page must be a positive number."}, status=400)
        return JsonResponse({
            "scores": [_score_data(score, request.user) for score in page.object_list],
            "page": page.number,
            "page_size": paginator.per_page,
            "total_pages": paginator.num_pages,
            "total_scores": paginator.count,
        })

    payload, payload_error = _json_payload(request)
    if payload_error:
        return JsonResponse(payload_error, status=400)
    normalized, score_format, errors = _score_payload_errors(payload)

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


scores_view = require_http_methods(["GET", "POST"])(scores_view)


@require_http_methods(["GET", "PATCH", "DELETE"])
def score_detail_view(request, score_id):
    if not request.user.is_authenticated:
        return JsonResponse({"message": "Authentication is required."}, status=401)
    try:
        score = Score.objects.select_related("owner").get(pk=score_id)
    except Score.DoesNotExist:
        return JsonResponse({"message": "Score not found."}, status=404)

    if request.method == "GET":
        data = _score_data(score, request.user)
        data["comments"] = [
            _comment_data(comment)
            for comment in score.comments.select_related("author").all()
        ]
        return JsonResponse({"score": data})
    if score.owner_id != request.user.pk:
        return JsonResponse({"message": "Only the owner can change this score."}, status=403)
    if request.method == "DELETE":
        score.delete()
        return JsonResponse({"message": "Score deleted."})

    payload, payload_error = _json_payload(request)
    if payload_error:
        return JsonResponse(payload_error, status=400)
    normalized, score_format, errors = _score_payload_errors(payload)
    if errors:
        return JsonResponse({"errors": errors}, status=400)
    for field, value in normalized.items():
        setattr(score, field if field != "content" else "content", value)
    score.score_format = score_format
    score.save()
    return JsonResponse({"score": _score_data(score, request.user)})


@require_http_methods(["POST"])
def comment_create_view(request, score_id):
    if not request.user.is_authenticated:
        return JsonResponse({"message": "Authentication is required."}, status=401)
    try:
        score = Score.objects.get(pk=score_id)
    except Score.DoesNotExist:
        return JsonResponse({"message": "Score not found."}, status=404)
    if score.owner_id == request.user.pk:
        return JsonResponse({"message": "You cannot comment on your own score."}, status=403)
    payload, payload_error = _json_payload(request)
    if payload_error:
        return JsonResponse(payload_error, status=400)
    body = payload.get("body")
    if not isinstance(body, str) or not body.strip():
        return JsonResponse({"errors": {"body": ["Comment is required."]}}, status=400)
    comment = Comment.objects.create(score=score, author=request.user, body=body.strip())
    return JsonResponse({"comment": _comment_data(comment)}, status=201)


def _comment_data(comment):
    return {
        "id": comment.pk,
        "body": comment.body,
        "author": comment.author.name,
        "author_id": comment.author_id,
        "created_at": comment.created_at.isoformat(),
    }


@require_http_methods(["DELETE"])
def comment_delete_view(request, comment_id):
    if not request.user.is_authenticated:
        return JsonResponse({"message": "Authentication is required."}, status=401)
    try:
        comment = Comment.objects.get(pk=comment_id)
    except Comment.DoesNotExist:
        return JsonResponse({"message": "Comment not found."}, status=404)
    if comment.author_id != request.user.pk:
        return JsonResponse({"message": "Only the author can delete this comment."}, status=403)
    comment.delete()
    return JsonResponse({"message": "Comment deleted."})


@require_http_methods(["PUT", "DELETE"])
def score_like_view(request, score_id):
    if not request.user.is_authenticated:
        return JsonResponse({"message": "Authentication is required."}, status=401)
    try:
        score = Score.objects.get(pk=score_id)
    except Score.DoesNotExist:
        return JsonResponse({"message": "Score not found."}, status=404)
    if score.owner_id == request.user.pk:
        return JsonResponse({"message": "You cannot react to your own score."}, status=403)
    if request.method == "PUT":
        Like.objects.get_or_create(score=score, user=request.user)
    else:
        Like.objects.filter(score=score, user=request.user).delete()
    return JsonResponse({
        "liked": request.method == "PUT",
        "like_count": score.likes.count(),
    })
