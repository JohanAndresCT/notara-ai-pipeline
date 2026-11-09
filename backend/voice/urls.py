from django.urls import path

from .views import stt_view

urlpatterns = [
    path("stt/", stt_view, name="audio-stt"),
]
