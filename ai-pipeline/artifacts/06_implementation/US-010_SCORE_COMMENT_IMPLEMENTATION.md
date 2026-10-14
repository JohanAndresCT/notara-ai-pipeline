# P06.9 US-010 Score Comment — Implementation Prompt

## 1. Metadata

- Project: Notara MVP
- Phase: P06.9 - Incremental Implementation
- Story: US-010 / HU10
- Priority: Should Have — MVP Core
- Epic: COMMUNITY
- Story Points: 3
- Sprint: Sprint 1
- Dev Principal: David Urrego
- Dev Apoyo: Alejandro Rodríguez
- Version: 1.0
- Date: 2026-10-12
- Implementation Status: `PENDING`

---

## 2. Story

**Redacción (3P):**
Como usuario autenticado,
quiero escribir un comentario en una partitura publicada por otro usuario,
para compartir retroalimentación o iniciar un intercambio musical con el
autor y la comunidad.

---

## 3. Acceptance Criteria

| ID | Given | When | Then |
|---|---|---|---|
| AC-US010-01 | Estoy en el detalle de una partitura | Escribo un comentario no vacío y lo envío | El comentario aparece con mi nombre y la fecha; servidor retorna 201 |
| AC-US010-02 | Intento enviar un comentario vacío | Envío el formulario | El sistema rechaza la operación con 400 y muestra un error de validación |
| AC-US010-03 | Soy el autor de un comentario | Selecciono eliminar y confirmo | El comentario desaparece; servidor retorna 204 |

> AC-US010-03: la confirmación antes de eliminar es responsabilidad del
> frontend (Dev Apoyo). El backend elimina cuando recibe el DELETE.

---

## 4. Definition of Done

| Item | Criterio de verificación |
|---|---|
| Comentarios publicados muestran nombre de autor y fecha | La respuesta del endpoint incluye `author`, `author_id` y `created_at` |
| Comentarios vacíos son rechazados | Contenido vacío o solo espacios → 400 con error en campo `body` |
| El autor puede eliminar su propio comentario | DELETE retorna 204; otros usuarios reciben 403 |
| Sección de comentarios validada en móvil y escritorio | Viewport 360 px y 1280 px verificados en browser (Dev Apoyo) |
| Aprobación del Product Owner | Pendiente — registrar evidencia tras revisión |

---

## 5. Technical Context

### Stack existente (no modificar)

- **Backend:** Django 5.2.1, Django REST Framework 3.15.2, Python 3.14.2
- **Base de datos:** SQLite en desarrollo (`DJANGO_DB_ENGINE=sqlite`), PostgreSQL en producción
- **Autenticación:** Session authentication + CSRF tokens
- **Convención de rutas:** `/api/v1/` (no `/api/v1/`)
- **App de partituras:** `backend/scores/`

### Rutas actuales registradas

```
GET    /api/v1/scores/                        → feed de partituras
POST   /api/v1/scores/                        → crear partitura
PATCH  /api/v1/scores/<id>/                   → editar partitura (HU05)
DELETE /api/v1/scores/<id>/                   → eliminar partitura (HU06)
POST   /api/v1/scores/<id>/reactions/         → toggle reacción (HU09)
```

### Modelos existentes en `backend/scores/models.py`

- `Score` — partitura con owner, title, instrument, description, format, content
- `Reaction` — reacción única por usuario por partitura (`UniqueConstraint`)

### Migraciones existentes en `backend/scores/migrations/`

- `0001_initial.py`
- `0002_alter_score_description_alter_score_instrument_and_more.py`
- `0003_reaction.py`

La nueva migración para `Comment` será `0004_comment.py`.

### Patrón CSRF existente

Todos los views de detalle usan `@csrf_exempt` + verificación manual con
`_csrf_middleware.process_view()` después del check de autenticación.
Los nuevos views deben seguir exactamente el mismo patrón para garantizar
que unauthenticated → 401 y authenticated sin CSRF → 403.

### Tests existentes

- 30 tests originales (accounts + scores US-001..US-004)
- 9 tests HU05 (`ScoreEditTests`)
- 6 tests HU06 (`ScoreDeleteTests`)
- 10 tests HU09 (`ScoreReactionTests`)
- Total actual: **55 tests pasando**

---

## 6. Implementation Tasks

### 6.1 Backend — nuevo modelo `Comment`

**Archivo a modificar:** `backend/scores/models.py`

Agregar al final del archivo (después de `Reaction`):

```python
class Comment(models.Model):
    score = models.ForeignKey(
        Score,
        on_delete=models.CASCADE,
        related_name="comments",
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="comments",
    )
    body = models.TextField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("created_at",)

    def __str__(self) -> str:
        return f"{self.author} on {self.score}: {self.body[:40]}"
```

**Reglas de negocio del modelo:**
- `body` tiene un máximo de 500 caracteres.
- Un usuario puede tener múltiples comentarios en la misma partitura
  (no hay `UniqueConstraint`).
- Los comentarios se ordenan del más antiguo al más nuevo (`created_at` ASC).
- Al eliminar una partitura o un usuario, sus comentarios se eliminan
  en cascada (`on_delete=CASCADE`).

### 6.2 Backend — migración

Después de agregar el modelo, generar la migración:

```powershell
python manage.py makemigrations scores
python manage.py migrate
python manage.py makemigrations --check --dry-run
```

Esto debe crear `backend/scores/migrations/0004_comment.py` sin errores.

### 6.3 Backend — helper `_comment_data`

**Archivo a modificar:** `backend/scores/views.py`

Agregar función helper para serializar comentarios, junto a `_score_data`:

```python
def _comment_data(comment):
    return {
        "id": comment.pk,
        "body": comment.body,
        "author": comment.author.name,
        "author_id": comment.author.pk,
        "created_at": comment.created_at.isoformat(),
    }
```

### 6.4 Backend — endpoint de lista y creación de comentarios

**Archivo a modificar:** `backend/scores/views.py`

Agregar importación:
```python
from .models import Score, Reaction, Comment
```

Agregar función `score_comments_view(request, score_id)`:

```python
@csrf_exempt
@require_http_methods(["GET", "POST"])
def score_comments_view(request, score_id):
    if not request.user.is_authenticated:
        return JsonResponse({"message": "Authentication is required."}, status=401)

    # CSRF solo requerido en escritura
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
        return JsonResponse(
            {"comments": [_comment_data(c) for c in comments]},
            status=200,
        )

    # POST — crear comentario
    if request.content_type != "application/json":
        return JsonResponse({"message": "Request body must be JSON."}, status=400)
    try:
        payload = json.loads(request.body or "{}")
    except (JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"message": "Request body must be valid JSON."}, status=400)
    if not isinstance(payload, dict):
        return JsonResponse({"message": "Request body must be a JSON object."}, status=400)

    body = payload.get("body", "")
    if not isinstance(body, str) or not body.strip():
        return JsonResponse({"errors": {"body": ["Comment body is required."]}}, status=400)
    if len(body) > 500:
        return JsonResponse(
            {"errors": {"body": ["Comment must be 500 characters or fewer."]}},
            status=400,
        )

    comment = Comment.objects.create(
        score=score,
        author=request.user,
        body=body.strip(),
    )
    return JsonResponse({"comment": _comment_data(comment)}, status=201)
```

**Flujo del endpoint GET:**
```
GET /api/v1/scores/<id>/comments/
  ├── No autenticado   → 401
  ├── Score no existe  → 404
  └── OK               → 200 {"comments": [...]}
```

**Flujo del endpoint POST:**
```
POST /api/v1/scores/<id>/comments/
  ├── No autenticado          → 401
  ├── Sin CSRF                → 403
  ├── Score no existe         → 404
  ├── body vacío              → 400 {"errors": {"body": [...]}}
  ├── body > 500 chars        → 400 {"errors": {"body": [...]}}
  └── OK                      → 201 {"comment": {...}}
```

> No hay restricción de que el autor no pueda comentar su propia
> partitura — la HU no lo indica y los comentarios son retroalimentación,
> no solo de terceros.

### 6.5 Backend — endpoint de eliminación de comentario

**Archivo a modificar:** `backend/scores/views.py`

Agregar función `score_comment_detail_view(request, score_id, comment_id)`:

```python
@csrf_exempt
@require_http_methods(["DELETE"])
def score_comment_detail_view(request, score_id, comment_id):
    if not request.user.is_authenticated:
        return JsonResponse({"message": "Authentication is required."}, status=401)

    csrf_failure = _csrf_middleware.process_view(request, None, (), {})
    if csrf_failure is not None:
        return csrf_failure

    try:
        comment = Comment.objects.select_related("author", "score").get(
            pk=comment_id, score_id=score_id
        )
    except Comment.DoesNotExist:
        return JsonResponse({"message": "Comment not found."}, status=404)

    if comment.author != request.user:
        return JsonResponse(
            {"message": "You do not have permission to delete this comment."},
            status=403,
        )

    comment.delete()
    return JsonResponse({}, status=204)
```

**Flujo:**
```
DELETE /api/v1/scores/<score_id>/comments/<comment_id>/
  ├── No autenticado        → 401
  ├── Sin CSRF              → 403
  ├── Comentario no existe  → 404
  ├── No es el autor        → 403
  └── Es el autor           → comment.delete() → 204
```

### 6.6 Backend — registrar URLs

**Archivo a modificar:** `backend/notara_backend/urls.py`

Actualizar import:
```python
from scores.views import (
    scores_view,
    score_detail_view,
    score_reaction_view,
    score_comments_view,
    score_comment_detail_view,
)
```

Agregar rutas:
```python
path("api/scores/<int:score_id>/comments/", score_comments_view, name="score-comments"),
path("api/scores/<int:score_id>/comments/<int:comment_id>/", score_comment_detail_view, name="score-comment-detail"),
```

---

## 7. Tests

**Archivo a modificar:** `backend/scores/tests.py`

Actualizar la importación de modelos para incluir `Comment`:
```python
from .models import Score, Reaction, Comment
```

Agregar nueva clase `ScoreCommentTests(TestCase)` con los siguientes
**12 tests**. Usar emails que no conflictúen con los existentes:
- Existentes: `composer@`, `author@`, `other@`, `deleter@`, `other2@`,
  `reactor_author@`, `reactor_user@`, `reactor_other@`
- Usar: `comment_author@example.com`, `comment_user@example.com`,
  `comment_other@example.com`

**Estructura setUp:**

```python
class ScoreCommentTests(TestCase):
    def setUp(self):
        self.client = Client(enforce_csrf_checks=True)
        self.score_author = User.objects.create_user(
            email="comment_author@example.com", name="ScoreAuthor", password="pass1234"
        )
        self.commenter = User.objects.create_user(
            email="comment_user@example.com", name="Commenter", password="pass1234"
        )
        self.other_commenter = User.objects.create_user(
            email="comment_other@example.com", name="OtherCommenter", password="pass1234"
        )
        self.client.force_login(self.commenter)
        self.csrf_token = self.client.get("/api/v1/csrf/").json()["csrfToken"]
        self.score = Score.objects.create(
            owner=self.score_author,
            title="Commented Score",
            instrument="Trumpet",
            description="Leave a comment.",
            score_format=Score.Format.TEXT,
            content="E F G A",
        )

    def post_comment(self, body="Great score!", score_id=None, client=None):
        c = client or self.client
        sid = score_id if score_id is not None else self.score.pk
        return c.post(
            f"/api/v1/scores/{sid}/comments/",
            data=json.dumps({"body": body}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=self.csrf_token,
        )

    def delete_comment(self, comment_id, score_id=None, client=None):
        c = client or self.client
        sid = score_id if score_id is not None else self.score.pk
        return c.delete(
            f"/api/v1/scores/{sid}/comments/{comment_id}/",
            content_type="application/json",
            HTTP_X_CSRFTOKEN=self.csrf_token,
        )
```

**Los 12 tests:**

| Nombre del test | Qué verifica |
|---|---|
| `test_authenticated_user_can_post_comment` | POST → 201, `Comment.objects.count() == 1`, respuesta incluye `author`, `body`, `created_at` |
| `test_comment_appears_in_list` | POST luego GET `/api/v1/scores/<id>/comments/` → lista contiene el comentario con datos correctos |
| `test_empty_comment_is_rejected` | POST con `body: ""` → 400 con `errors["body"]`, `Comment.objects.count() == 0` |
| `test_whitespace_only_comment_is_rejected` | POST con `body: "   "` → 400 con `errors["body"]` |
| `test_comment_over_500_chars_is_rejected` | POST con body de 501 chars → 400 con `errors["body"]` |
| `test_comment_requires_authentication` | Cliente anónimo POST → 401 |
| `test_comment_requires_csrf` | Autenticado sin CSRF → 403 |
| `test_comment_on_nonexistent_score_returns_404` | POST `/api/v1/scores/99999/comments/` → 404 |
| `test_author_can_delete_own_comment` | POST luego DELETE → 204, `Comment.objects.count() == 0` |
| `test_non_author_cannot_delete_comment` | Commenter crea, other_commenter intenta DELETE → 403, comentario sigue en DB |
| `test_delete_requires_csrf` | Autenticado sin CSRF en DELETE → 403, comentario sigue en DB |
| `test_comment_cascade_delete_with_score` | POST comentario, luego `score.delete()` → `Comment.objects.count() == 0` |

---

## 8. Verification Procedure

Ejecutar en orden desde `backend/` con venv activo:

```powershell
# 1. Sin errores de sistema
python manage.py check

# 2. Generar y aplicar migración
python manage.py makemigrations scores
python manage.py migrate

# 3. Sin migraciones pendientes
python manage.py makemigrations --check --dry-run

# 4. Solo tests de scores
python manage.py test scores -v 2

# 5. Suite completa
python manage.py test accounts scores -v 1
```

**Resultado esperado:** todos los tests pasan, **67 tests en total**
(55 existentes + 12 nuevos). Zero errores, zero warnings.

---

## 9. Scope Boundaries

| Dentro de HU10 | Fuera de HU10 |
|---|---|
| Crear comentario (POST) con validación | Editar comentario propio |
| Listar comentarios de una partitura (GET) | Paginación de comentarios |
| Eliminar comentario propio (DELETE) | Notificaciones al autor de la partitura |
| Control de autoría en delete (403) | Moderación de comentarios |
| Tests backend (12 casos) | Integración frontend (Dev Apoyo) |
| Migración `0004_comment` | Cambios en otros modelos |

---

## 10. Files to Create or Modify

| Archivo | Acción | Descripción |
|---|---|---|
| `backend/scores/models.py` | Modificar | Agregar modelo `Comment` al final |
| `backend/scores/migrations/0004_comment.py` | Crear (auto) | Generado por `makemigrations` |
| `backend/scores/views.py` | Modificar | Agregar `_comment_data`, `score_comments_view`, `score_comment_detail_view`; actualizar import de modelos |
| `backend/notara_backend/urls.py` | Modificar | Registrar las dos rutas de comentarios; actualizar import |
| `backend/scores/tests.py` | Modificar | Actualizar import de modelos; agregar clase `ScoreCommentTests` con 12 tests |

> **No se modifican** `_score_data` ni los endpoints existentes de
> scores, reacciones, edición o eliminación.

---

## 11. Traceability

- Story: US-010 / HU10
- Epic: COMMUNITY
- Sprint: Sprint 1
- Depends on: US-004 (Score Publication) — `READY_WITH_REVIEW_GATES`
- Blocks: ninguna historia conocida en Sprint 1
- Business rules: solo el autor del comentario puede eliminarlo; cualquier
  usuario autenticado puede comentar en cualquier partitura

---

## 12. Implementation Status

`PENDING` — este documento es el prompt de implementación.
La validación se registrará en `US-010_SCORE_COMMENT_VALIDATION.md`
una vez completada la implementación y verificación.
