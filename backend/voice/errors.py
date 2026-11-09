from django.http import JsonResponse


def error_response(code: str, message: str, status: int) -> JsonResponse:
    return JsonResponse(
        {"code": code, "message": message, "errors": {}},
        status=status,
    )
