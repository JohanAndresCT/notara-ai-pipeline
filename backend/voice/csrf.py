from django.views.csrf import csrf_failure as django_csrf_failure

from .errors import error_response


def csrf_failure(request, reason=""):
    if request.path == "/api/v1/audio/stt/":
        return error_response(
            "CSRF_FAILED",
            "La solicitud no superó la validación de seguridad.",
            403,
        )
    return django_csrf_failure(request, reason=reason)
