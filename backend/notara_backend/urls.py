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
from scores.views import scores_view


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
]
