import json
import re
from json import JSONDecodeError

from django.http import HttpResponse, JsonResponse
from django.middleware.csrf import CsrfViewMiddleware
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import Comment, Like, Reaction, Score

ABC_REQUIRED_FIELDS = ("X", "T", "M", "L", "K")
ABC_NOTE_PATTERN = re.compile(r"(?<![A-Za-z])[A-Ga-gzZ](?:[,']*)(?:\d+|/\d+)?")
ABC_MUSIC_LINE_PATTERN = re.compile(r"^[A-Ga-gzZ0-9|:\[\](){}<>^_=,'/.\-\s]+$")
_csrf_middleware = CsrfViewMiddleware(lambda request: None)


def _score_data(score, user=None):
    return {
        "id": score.pk,
        "title": score.title,
        "instrument": score.instrument,
        "description": score.description,
        "format": score.score_format,
        "content": score.content,
        "author": score.owner.name,
        "author_id": score.owner_id,
        "created_at": score.created_at.isoformat(),
        "reaction_count": score.reactions.count(),
        "user_reacted": score.reactions.filter(user=user).exists() if user else False,
        "like_count": score.likes.count(),
        "is_liked": score.likes.filter(user=user).exists() if user else False,
        "comment_count": score.comments.count(),
        "is_owner": user is not None and score.owner_id == user.pk,
    }


def _comment_data(comment):
    return {
        "id": comment.pk,
        "body": comment.body,
        "author": comment.author.name,
        "author_id": comment.author_id,
        "created_at": comment.created_at.isoformat(),
    }


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


def _abc_validation_error(content):
    lines = content.splitlines()
    if any(not any(line.startswith(f"{field}:") for line in lines) for field in ABC_REQUIRED_FIELDS):
        return "ABC score must include X:, T:, M:, L:, and K: fields."
    music_lines = [line for line in lines if line and not re.match(r"^[A-Za-z]:", line)]
    if not any(
        ABC_MUSIC_LINE_PATTERN.fullmatch(line) and ABC_NOTE_PATTERN.search(line)
        for line in music_lines
    ):
        return "ABC score must contain at least one note or rest on a musical line."
    return None


def _score_payload_errors(payload):
    values = {
        "title": payload.get("title"),
        "instrument": payload.get("instrument"),
        "description": payload.get("description"),
        "content": payload.get("content"),
    }
    normalized = {
        key: value.strip() if key != "content" and isinstance(value, str) else value
        for key, value in values.items()
    }
    errors = {}
    for field in ("title", "instrument", "description"):
        if not isinstance(normalized[field], str) or not normalized[field]:
            errors[field] = [f"{field.replace('_', ' ').capitalize()} is required."]
    score_format = payload.get("format")
    if score_format not in Score.Format.values:
        errors["format"] = ["Choose ABC notation or plain text."]
    content = normalized["content"]
    if not isinstance(content, str) or not content.strip():
        errors["content"] = ["Score content is required."]
    elif len(content) > 1000:
        errors["content"] = ["Score content must be 1,000 characters or fewer."]
    elif score_format == Score.Format.ABC:
        error = _abc_validation_error(content)
        if error:
            errors["content"] = [error]
    return normalized, score_format, errors


@require_http_methods(["GET", "POST"])
def scores_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({"message": "Authentication is required."}, status=401)

    if request.method == "GET":
        try:
            page = int(request.GET.get("page", "1"))
            if page < 1:
                raise ValueError
        except (TypeError, ValueError):
            return JsonResponse({"message": "Page must be a positive integer."}, status=400)
        scores = Score.objects.select_related("owner").all()
        instrument = request.GET.get("instrument", "").strip()
        if instrument:
            scores = scores.filter(instrument__iexact=instrument)
        if request.GET.get("mine") == "1":
            scores = scores.filter(owner=request.user)
        page_size = 10
        total_count = scores.count()
        total_pages = max(1, (total_count + page_size - 1) // page_size)
        start = (page - 1) * page_size
        page_scores = scores[start : start + page_size]
        return JsonResponse({
            "scores": [_score_data(score, request.user) for score in page_scores],
            "page": page,
            "page_size": page_size,
            "total_count": total_count,
            "total_pages": total_pages,
            "total_scores": total_count,
            "has_next": page < total_pages,
            "has_previous": page > 1,
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


@csrf_exempt
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

    csrf_failure = _csrf_middleware.process_view(request, None, (), {})
    if csrf_failure is not None:
        return csrf_failure
    if score.owner_id != request.user.pk:
        return JsonResponse({"message": "You do not have permission to edit this score."}, status=403)
    if request.method == "DELETE":
        score.delete()
        return HttpResponse(status=204)

    payload, payload_error = _json_payload(request)
    if payload_error:
        return JsonResponse(payload_error, status=400)
    errors = {}
    for field in ("title", "instrument", "description"):
        if field in payload and (
            not isinstance(payload[field], str) or not payload[field].strip()
        ):
            errors[field] = [f"{field.replace('_', ' ').capitalize()} is required."]
    if "format" in payload and payload["format"] not in Score.Format.values:
        errors["format"] = ["Choose ABC notation or plain text."]
    content = payload.get("content", score.content)
    score_format = payload.get("format", score.score_format)
    if "content" in payload:
        if not isinstance(content, str) or not content.strip():
            errors["content"] = ["Score content is required."]
        elif len(content) > 1000:
            errors["content"] = ["Score content must be 1,000 characters or fewer."]
        elif score_format == Score.Format.ABC and _abc_validation_error(content):
            errors["content"] = [_abc_validation_error(content)]
    elif score_format == Score.Format.ABC and score.score_format != Score.Format.ABC:
        abc_error = _abc_validation_error(content)
        if abc_error:
            errors["content"] = [abc_error]
    if errors:
        return JsonResponse({"errors": errors}, status=400)

    for field in ("title", "instrument", "description"):
        if field in payload:
            setattr(score, field, payload[field].strip())
    if "format" in payload:
        score.score_format = score_format
    if "content" in payload:
        score.content = content
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
        score = Score.objects.get(pk=score_id)
    except Score.DoesNotExist:
        return JsonResponse({"message": "Score not found."}, status=404)
    deleted, _ = Reaction.objects.filter(score=score, user=request.user).delete()
    if deleted:
        return JsonResponse({"reacted": False, "reaction_count": score.reactions.count()})
    Reaction.objects.create(score=score, user=request.user)
    return JsonResponse(
        {"reacted": True, "reaction_count": score.reactions.count()},
        status=201,
    )


@csrf_exempt
@require_http_methods(["GET", "POST"])
def score_comments_view(request, score_id):
    if not request.user.is_authenticated:
        return JsonResponse({"message": "Authentication is required."}, status=401)
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
        return JsonResponse({"comments": [_comment_data(comment) for comment in comments]})
    payload, payload_error = _json_payload(request)
    if payload_error:
        return JsonResponse(payload_error, status=400)
    body = payload.get("body", "")
    if not isinstance(body, str) or not body.strip():
        return JsonResponse({"errors": {"body": ["Comment body is required."]}}, status=400)
    if len(body) > 500:
        return JsonResponse(
            {"errors": {"body": ["Comment must be 500 characters or fewer."]}},
            status=400,
        )
    comment = Comment.objects.create(score=score, author=request.user, body=body.strip())
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
        comment = Comment.objects.get(pk=comment_id, score_id=score_id)
    except Comment.DoesNotExist:
        return JsonResponse({"message": "Comment not found."}, status=404)
    if comment.author_id != request.user.pk:
        return JsonResponse({"message": "You do not have permission to delete this comment."}, status=403)
    comment.delete()
    return HttpResponse(status=204)


@require_http_methods(["POST"])
def comment_create_view(request, score_id):
    if not request.user.is_authenticated:
        return JsonResponse({"message": "Authentication is required."}, status=401)
    try:
        score = Score.objects.get(pk=score_id)
    except Score.DoesNotExist:
        return JsonResponse({"message": "Score not found."}, status=404)
    payload, payload_error = _json_payload(request)
    if payload_error:
        return JsonResponse(payload_error, status=400)
    body = payload.get("body")
    if not isinstance(body, str) or not body.strip():
        return JsonResponse({"errors": {"body": ["Comment is required."]}}, status=400)
    if len(body) > 500:
        return JsonResponse({"errors": {"body": ["Comment must be 500 characters or fewer."]}}, status=400)
    comment = Comment.objects.create(score=score, author=request.user, body=body.strip())
    return JsonResponse({"comment": _comment_data(comment)}, status=201)


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
    if request.method == "PUT":
        Like.objects.get_or_create(score=score, user=request.user)
    else:
        Like.objects.filter(score=score, user=request.user).delete()
    return JsonResponse({"liked": request.method == "PUT", "like_count": score.likes.count()})
