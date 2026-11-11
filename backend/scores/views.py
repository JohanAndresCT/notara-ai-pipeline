import json
import re
from json import JSONDecodeError

from django.conf import settings
from django.core.exceptions import RequestDataTooBig
from django.core.files.storage import default_storage
from django.db.models import Count, Exists, IntegerField, OuterRef, Subquery
from django.db.models.functions import Coalesce
from django.http import FileResponse, HttpResponse, JsonResponse
from django.http.multipartparser import MultiPartParserError
from django.views.decorators.http import require_http_methods

from voice.errors import error_response
from voice.transcription import TranscriptionError, transcribe_upload

from .abc_reader import playback_data
from .models import Comment, Like, Reaction, Score

VOICE_COMMENT_MESSAGES = {
    "AUDIO_TOO_LARGE": "La grabación es demasiado grande (máximo 2 MB).",
    "AUDIO_INVALID": "El formato, la duración o el contenido del audio no son válidos.",
    "STT_UNAVAILABLE": "No se pudo transcribir tu comentario. Puedes intentarlo de nuevo o escribirlo.",
    "STT_DAILY_LIMIT_REACHED": "Alcanzaste el límite diario de transcripciones.",
    "TRANSCRIPTION_FAILED": "No se pudo transcribir tu comentario. Puedes intentarlo de nuevo o escribirlo.",
    "TRANSCRIPTION_TOO_LONG": "La transcripción supera los 1.000 caracteres. Graba un comentario más corto.",
}

ABC_REQUIRED_FIELDS = ("X", "T", "M", "L", "K")
ABC_NOTE_PATTERN = re.compile(r"(?<![A-Za-z])[A-Ga-gzZ](?:[,']*)(?:\d+|/\d+)?")
ABC_MUSIC_LINE_PATTERN = re.compile(r"^[A-Ga-gzZ0-9|:\[\](){}<>^_=,'/.\-\s]+$")


def _count_subquery(model):
    """Cuenta los registros de `model` ligados a cada partitura, sin multiplicar filas."""
    return Coalesce(
        Subquery(
            model.objects.filter(score=OuterRef("pk"))
            .order_by()
            .values("score")
            .annotate(total=Count("pk"))
            .values("total"),
            output_field=IntegerField(),
        ),
        0,
    )


def _scores_with_stats(user):
    """Partituras con conteos y estado del usuario calculados en la misma consulta."""
    return Score.objects.select_related("owner").annotate(
        reaction_total=_count_subquery(Reaction),
        like_total=_count_subquery(Like),
        comment_total=_count_subquery(Comment),
        user_reacted_flag=Exists(Reaction.objects.filter(score=OuterRef("pk"), user=user)),
        is_liked_flag=Exists(Like.objects.filter(score=OuterRef("pk"), user=user)),
    )


def _score_stats(score, user):
    if hasattr(score, "reaction_total"):
        return {
            "reaction_count": score.reaction_total,
            "user_reacted": score.user_reacted_flag,
            "like_count": score.like_total,
            "is_liked": score.is_liked_flag,
            "comment_count": score.comment_total,
        }
    # Partitura recién creada o sin anotar: se calculan los conteos con consultas sueltas.
    return {
        "reaction_count": score.reactions.count(),
        "user_reacted": score.reactions.filter(user=user).exists() if user else False,
        "like_count": score.likes.count(),
        "is_liked": score.likes.filter(user=user).exists() if user else False,
        "comment_count": score.comments.count(),
    }


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
        **_score_stats(score, user),
        "is_owner": user is not None and score.owner_id == user.pk,
    }


def _comment_data(comment):
    return {
        "id": comment.pk,
        "body": comment.body,
        "kind": comment.kind,
        "audio_url": f"/api/v1/comments/{comment.pk}/audio/" if comment.audio else None,
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
        scores = _scores_with_stats(request.user)
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


@require_http_methods(["GET", "PATCH", "DELETE"])
def score_detail_view(request, score_id):
    if not request.user.is_authenticated:
        return JsonResponse({"message": "Authentication is required."}, status=401)
    try:
        score = _scores_with_stats(request.user).get(pk=score_id)
    except Score.DoesNotExist:
        return JsonResponse({"message": "Score not found."}, status=404)

    if request.method == "GET":
        data = _score_data(score, request.user)
        data["comments"] = [
            _comment_data(comment)
            for comment in score.comments.select_related("author").all()
        ]
        data["playback"] = playback_data(score.content, score.score_format)  # HU15, ADR-010
        return JsonResponse({"score": data})

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


@require_http_methods(["POST"])
def score_reaction_view(request, score_id):
    if not request.user.is_authenticated:
        return JsonResponse({"message": "Authentication is required."}, status=401)
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


@require_http_methods(["GET", "POST"])
def score_comments_view(request, score_id):
    if not request.user.is_authenticated:
        return JsonResponse({"message": "Authentication is required."}, status=401)
    try:
        score = Score.objects.get(pk=score_id)
    except Score.DoesNotExist:
        return JsonResponse({"message": "Score not found."}, status=404)
    if request.method == "GET":
        comments = score.comments.select_related("author").all()
        return JsonResponse({"comments": [_comment_data(comment) for comment in comments]})
    if (request.content_type or "").startswith("multipart/form-data"):
        return _create_voice_comment(request, score)
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


def _voice_comment_error(code, status):
    return error_response(code, VOICE_COMMENT_MESSAGES.get(code, VOICE_COMMENT_MESSAGES["STT_UNAVAILABLE"]), status)


def _create_voice_comment(request, score):
    """HU12: transcribe a recorded note and store it with its audio as one comment."""
    if score.owner_id == request.user.pk:
        return error_response("OWN_SCORE", "No puedes comentar en tu propia partitura.", 403)
    try:
        upload = request.FILES.get("audio")
    except (RequestDataTooBig, MultiPartParserError):
        return _voice_comment_error("AUDIO_TOO_LARGE", 413)
    if upload is None:
        return _voice_comment_error("AUDIO_INVALID", 400)
    try:
        transcript = transcribe_upload(request.user.pk, upload)
    except TranscriptionError as exc:
        return _voice_comment_error(exc.code, exc.status)
    if not transcript:
        return _voice_comment_error("TRANSCRIPTION_FAILED", 422)
    if len(transcript) > settings.VOICE_COMMENT_MAX_CHARS:
        return _voice_comment_error("TRANSCRIPTION_TOO_LONG", 422)
    upload.seek(0)
    comment = Comment.objects.create(
        score=score,
        author=request.user,
        body=transcript,
        kind=Comment.Kind.VOICE,
        audio=upload,
        audio_mime=(upload.content_type or "").split(";", 1)[0].strip().lower(),
    )
    return JsonResponse({"comment": _comment_data(comment)}, status=201)


@require_http_methods(["GET"])
def comment_audio_view(request, comment_id):
    """Serve a voice comment's audio to authenticated users only (DEC-214)."""
    if not request.user.is_authenticated:
        return JsonResponse({"message": "Authentication is required."}, status=401)
    try:
        comment = Comment.objects.get(pk=comment_id)
    except Comment.DoesNotExist:
        return JsonResponse({"message": "Comment not found."}, status=404)
    if not comment.audio:
        return JsonResponse({"message": "Comment not found."}, status=404)
    try:
        stored = default_storage.open(comment.audio.name, "rb")
    except OSError:
        return JsonResponse({"message": "Comment not found."}, status=404)
    response = FileResponse(stored, content_type=comment.audio_mime or "application/octet-stream")
    response["X-Content-Type-Options"] = "nosniff"
    response["Cache-Control"] = "private, no-store"
    return response


@require_http_methods(["DELETE"])
def score_comment_detail_view(request, score_id, comment_id):
    if not request.user.is_authenticated:
        return JsonResponse({"message": "Authentication is required."}, status=401)
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
