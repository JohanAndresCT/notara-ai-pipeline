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
    scores_view,
    score_detail_view,
    score_reaction_view,
    score_comments_view,
    score_comment_detail_view,
)


def health_check(request):
    return JsonResponse({"status": "ok", "service": "notara-backend"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/health/", health_check, name="health-check"),
    path("api/v1/csrf/", csrf_token_view, name="csrf-token"),
    path("api/v1/auth/register/", register_view, name="register"),
    path("api/v1/auth/login/", login_view, name="login"),
    path("api/v1/auth/logout/", logout_view, name="logout"),
    path("api/v1/me/", current_user_view, name="current-user"),
    path("api/v1/me/photo/", profile_photo_view, name="profile-photo"),
    path("api/v1/me/password/", change_password_view, name="change-password"),
    path("api/v1/scores/", scores_view, name="scores"),
    path("api/v1/scores/<int:score_id>/", score_detail_view, name="score-detail"),
    path("api/v1/scores/<int:score_id>/reactions/", score_reaction_view, name="score-reactions"),
    path("api/v1/scores/<int:score_id>/comments/", score_comments_view, name="score-comments"),
    path("api/v1/scores/<int:score_id>/comments/<int:comment_id>/", score_comment_detail_view, name="score-comment-detail"),
]
