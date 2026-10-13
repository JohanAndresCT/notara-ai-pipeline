from django.contrib import admin
from django.http import JsonResponse
from django.urls import path

from accounts.views import (
    current_user_view,
    csrf_token_view,
    login_view,
    logout_view,
    profile_photo_view,
    change_password_view,
    register_view,
)
from scores.views import (
    comment_create_view,
    comment_delete_view,
    score_detail_view,
    score_like_view,
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
    path("api/scores/<int:score_id>/comments/", comment_create_view, name="comment-create"),
    path("api/comments/<int:comment_id>/", comment_delete_view, name="comment-delete"),
    path("api/scores/<int:score_id>/like/", score_like_view, name="score-like"),
]
