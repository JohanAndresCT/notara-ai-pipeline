from django.contrib import admin
from django.http import JsonResponse
from django.urls import path

from accounts.views import (
    change_password_view,
    current_user_view,
    csrf_token_view,
    login_view,
    logout_view,
    profile_photo_view,
    register_view,
)
from scores.views import (
    comment_create_view,
    comment_delete_view,
    score_comment_detail_view,
    score_comments_view,
    score_detail_view,
    score_like_view,
    score_reaction_view,
    scores_view,
)


def health_check(request):
    return JsonResponse({"status": "ok", "service": "notara-backend"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health_check, name="health-check"),
    path("api/csrf/", csrf_token_view, name="csrf-token"),
    path("api/auth/register/", register_view, name="register"),
    path("api/auth/login/", login_view, name="login"),
    path("api/auth/logout/", logout_view, name="logout"),
    path("api/me/", current_user_view, name="current-user"),
    path("api/me/photo/", profile_photo_view, name="profile-photo"),
    path("api/me/password/", change_password_view, name="change-password"),
    path("api/scores/", scores_view, name="scores"),
    path("api/scores/<int:score_id>/", score_detail_view, name="score-detail"),
    path(
        "api/scores/<int:score_id>/comments/",
        comment_create_view,
        name="comment-create",
    ),
    path(
        "api/comments/<int:comment_id>/",
        comment_delete_view,
        name="comment-delete",
    ),
    path("api/scores/<int:score_id>/like/", score_like_view, name="score-like"),
    path("api/v1/health/", health_check, name="health-check-v1"),
    path("api/v1/csrf/", csrf_token_view, name="csrf-token-v1"),
    path("api/v1/auth/register/", register_view, name="register-v1"),
    path("api/v1/auth/login/", login_view, name="login-v1"),
    path("api/v1/auth/logout/", logout_view, name="logout-v1"),
    path("api/v1/me/", current_user_view, name="current-user-v1"),
    path("api/v1/me/photo/", profile_photo_view, name="profile-photo-v1"),
    path("api/v1/me/password/", change_password_view, name="change-password-v1"),
    path("api/v1/scores/", scores_view, name="scores-v1"),
    path("api/v1/scores/<int:score_id>/", score_detail_view, name="score-detail-v1"),
    path(
        "api/v1/scores/<int:score_id>/reactions/",
        score_reaction_view,
        name="score-reactions",
    ),
    path(
        "api/v1/scores/<int:score_id>/comments/",
        score_comments_view,
        name="score-comments",
    ),
    path(
        "api/v1/scores/<int:score_id>/comments/<int:comment_id>/",
        score_comment_detail_view,
        name="score-comment-detail",
    ),
]
