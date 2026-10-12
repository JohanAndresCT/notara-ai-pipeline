# P06.8 US-009 Score Reaction — Implementation Prompt

## 1. Metadata

- Project: Notara MVP
- Phase: P06.8 - Incremental Implementation
- Story: US-009 / HU09
- Priority: Should Have — MVP Core
- Epic: COMMUNITY
- Story Points: 3
- Sprint: Sprint 1
- Dev Principal: David Urrego
- Dev Apoyo: Johan Andrés Ceballos
- Version: 1.0
- Date: 2026-10-12
- Implementation Status: `PENDING`

---

## 2. Story

**Redacción (3P):**
Como usuario autenticado,
quiero reaccionar a una partitura publicada por otro usuario (por ejemplo,
con "me gusta"),
para expresar apreciación hacia el contenido de la comunidad.

---

## 3. Acceptance Criteria

| ID | Given | When | Then |
|---|---|---|---|
| AC-US009-01 | Estoy en el detalle de una partitura ajena | Hago clic en el botón de reacción | El contador aumenta y mi reacción queda registrada (201) |
| AC-US009-02 | Ya reaccioné a una partitura | Vuelvo a hacer clic en el botón | Mi reacción se retira y el contador disminuye (200 con `reacted: false`) |
| AC-US009-03 | Soy el autor de la partitura | Intento reaccionar a mi propio contenido | El servidor rechaza la operación con 403 Forbidden |

---

## 4. Definition of Done

| Item | Criterio de verificación |
|---|---|
| Reacción registrada y reflejada en contador | POST al endpoint crea el registro y el GET del score incluye `reaction_count` y `user_reacted` |
| Retiro de reacción funciona correctamente | POST idempotente — si ya existe la reacción, la elimina y retorna `reacted: false` |
| El autor no puede reaccionar a su propio contenido | El endpoint retorna 403 si `request.user == score.owner` |
| Probado en móvil y escritorio | Viewport 360 px y 1280 px verificados en browser (Dev Apoyo) |
| Aprobación del Product Owner | Pendiente — registrar evidencia tras revisión |

---

## 5. Technical Context

### Stack existente (no modificar)

- **Backend:** Django 5.2.1, Django REST Framework 3.15.2, Python 3.14.2
- **Base de datos:** SQLite en desarrollo (`DJANGO_DB_ENGINE=sqlite`), PostgreSQL en producción
- **Autenticación:** Session authentication + CSRF tokens
- **Convención de rutas:** `/api/` (no `/api/v1/`)
- **App de partituras:** `backend/scores/`

### Rutas actuales registradas

```
GET  /api/scores/              → feed de partituras
POST /api/scores/              → crear partitura
PATCH  /api/scores/<id>/       → editar partitura (HU05)
DELETE /api/scores/<id>/       → eliminar partitura (HU06)
```

### Modelo Score existente

```python
class Score(models.Model):
    class Format(models.TextChoices):
        ABC = "ABC", "ABC notation"
        TEXT = "TEXT", "Plain text"

    owner        = models.ForeignKey(AUTH_USER_MODEL, on_delete=CASCADE, related_name="scores")
    title        = models.TextField()
    instrument   = models.TextField()
    description  = models.TextField()
    score_format = models.CharField(max_length=4, choices=Format.choices)
    content      = models.TextField(max_length=1000)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)
```

### Migraciones existentes en `backend/scores/migrations/`

- `0001_initial.py`
- `0002_alter_score_description_alter_score_instrument_and_more.py`

La nueva migración para el modelo `Reaction` será `0003_reaction.py`.

### Patrón CSRF existente

Los views de detalle usan `@csrf_exempt` + verificación manual con
`_csrf_middleware.process_view()` después del check de autenticación,
para garantizar que unauthenticated → 401 y authenticated sin CSRF → 403.
El nuevo `score_reaction_view` debe seguir exactamente el mismo patrón.

### Tests existentes

- 30 tests originales (accounts + scores US-001..US-004)
- 9 tests HU05 (`ScoreEditTests`)
- 6 tests HU06 (`ScoreDeleteTests`)
- Total actual: **45 tests pasando**

---

## 6. Implementation Tasks

### 6.1 Backend — nuevo modelo `Reaction`

**Archivo a modificar:** `backend/scores/models.py`

Agregar al final del archivo:

```python
class Reaction(models.Model):
    score = models.ForeignKey(
        Score,
        on_delete=models.CASCADE,
        related_name="reactions",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reactions",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["score", "user"],
                name="unique_reaction_per_user_per_score",
            )
        ]

    def __str__(self) -> str:
        return f"{self.user} → {self.score}"
```

**Reglas de negocio del modelo:**
- Un usuario solo puede tener una reacción por partitura
  (`UniqueConstraint` en `score` + `user`).
- Al eliminar una partitura o un usuario, sus reacciones se eliminan
  en cascada (`on_delete=CASCADE`).

### 6.2 Backend — migración

Después de agregar el modelo, generar la migración:

```powershell
python manage.py makemigrations scores
```

Esto debe crear `backend/scores/migrations/0003_reaction.py`.
Verificar que no haya errores con:

```powershell
python manage.py migrate
python manage.py makemigrations --check --dry-run
```

### 6.3 Backend — actualizar `_score_data`

**Archivo a modificar:** `backend/scores/views.py`

La función `_score_data(score)` debe extenderse para incluir el conteo
de reacciones. Como el contexto del usuario que consulta es necesario
para saber si ya reaccionó, la firma cambia a `_score_data(score, user=None)`:

```python
def _score_data(score, user=None):
    return {
        "id": score.pk,
        "title": score.title,
        "instrument": score.instrument,
        "description": score.description,
        "format": score.score_format,
        "content": score.content,
        "author": score.owner.name,
        "author_id": score.owner.pk,
        "created_at": score.created_at.isoformat(),
        "reaction_count": score.reactions.count(),
        "user_reacted": (
            score.reactions.filter(user=user).exists() if user else False
        ),
    }
```

Actualizar todas las llamadas existentes a `_score_data(score)` para
pasar el usuario cuando esté disponible:
- En `scores_view` (GET): `_score_data(score, request.user)`
- En `scores_view` (POST): `_score_data(score, request.user)`
- En `score_detail_view` (PATCH): `_score_data(score, request.user)`

> Agregar `author_id` al payload facilita al frontend saber si el
> usuario actual es el autor sin comparar nombres.

### 6.4 Backend — nuevo endpoint `score_reaction_view`

**Archivo a modificar:** `backend/scores/views.py`

Agregar importaciones necesarias:

```python
from django.db import IntegrityError
from .models import Score, Reaction
```

Agregar la función:

```python
@csrf_exempt
@require_http_methods(["POST"])
def score_reaction_view(request, score_id):
    if not request.user.is_authenticated:
        return JsonResponse({"message": "Authentication is required."}, status=401)

    csrf_failure = _csrf_middleware.process_view(request, None, (), {})
    if csrf_failure is not None:
        return csrf_failure

    try:
        score = Score.objects.select_related("owner").get(pk=score_id)
    except Score.DoesNotExist:
        return JsonResponse({"message": "Score not found."}, status=404)

    if score.owner == request.user:
        return JsonResponse(
            {"message": "You cannot react to your own score."}, status=403
        )

    # Toggle: si ya existe la reacción, la elimina; si no, la crea
    deleted, _ = Reaction.objects.filter(
        score=score, user=request.user
    ).delete()

    if deleted:
        return JsonResponse(
            {
                "reacted": False,
                "reaction_count": score.reactions.count(),
            },
            status=200,
        )

    Reaction.objects.create(score=score, user=request.user)
    return JsonResponse(
        {
            "reacted": True,
            "reaction_count": score.reactions.count(),
        },
        status=201,
    )
```

**Flujo del endpoint:**

```
POST /api/scores/<id>/reactions/
  ├── No autenticado               → 401
  ├── Sin CSRF                     → 403
  ├── Score no existe              → 404
  ├── Usuario es el autor          → 403
  ├── Ya tenía reacción            → elimina, retorna 200 {reacted: false, reaction_count: N}
  └── No tenía reacción            → crea, retorna 201 {reacted: true, reaction_count: N}
```

### 6.5 Backend — registrar URL

**Archivo a modificar:** `backend/notara_backend/urls.py`

Agregar import:
```python
from scores.views import scores_view, score_detail_view, score_reaction_view
```

Agregar ruta:
```python
path("api/scores/<int:score_id>/reactions/", score_reaction_view, name="score-reactions"),
```

---

## 7. Tests

**Archivo a modificar:** `backend/scores/tests.py`

Agregar importación de `Reaction` al inicio:
```python
from .models import Score, Reaction
```

Agregar nueva clase `ScoreReactionTests(TestCase)` con los siguientes
**10 tests**:

| Nombre del test | Qué verifica |
|---|---|
| `test_authenticated_user_can_react_to_others_score` | POST → 201, `reacted: true`, `reaction_count: 1`, Reaction en DB |
| `test_reaction_reflected_in_feed` | Después del POST, GET `/api/scores/` incluye `reaction_count: 1` y `user_reacted: true` |
| `test_toggle_removes_existing_reaction` | POST cuando ya existe → 200, `reacted: false`, `reaction_count: 0`, Reaction eliminada de DB |
| `test_author_cannot_react_to_own_score` | POST del autor → 403, `Reaction.objects.count() == 0` |
| `test_reaction_requires_authentication` | Cliente anónimo POST → 401 |
| `test_reaction_requires_csrf` | Autenticado sin CSRF → 403 |
| `test_reaction_on_nonexistent_score_returns_404` | POST `/api/scores/99999/reactions/` → 404 |
| `test_multiple_users_can_react_independently` | Usuario A y B reaccionan → `reaction_count: 2` en feed |
| `test_reaction_count_zero_by_default` | Score nuevo sin reacciones → `reaction_count: 0`, `user_reacted: false` en feed |
| `test_reaction_cascade_delete_with_score` | Eliminar score → `Reaction.objects.count() == 0` |

**Estructura sugerida para setUp:**

```python
class ScoreReactionTests(TestCase):
    def setUp(self):
        self.client = Client(enforce_csrf_checks=True)
        self.author = User.objects.create_user(
            email="reactor_author@example.com", name="Author", password="pass1234"
        )
        self.reactor = User.objects.create_user(
            email="reactor_user@example.com", name="Reactor", password="pass1234"
        )
        self.other_reactor = User.objects.create_user(
            email="reactor_other@example.com", name="OtherReactor", password="pass1234"
        )
        self.client.force_login(self.reactor)
        self.csrf_token = self.client.get("/api/csrf/").json()["csrfToken"]
        self.score = Score.objects.create(
            owner=self.author,
            title="Reaction Target",
            instrument="Cello",
            description="React to this.",
            score_format=Score.Format.TEXT,
            content="G A B C",
        )

    def post_reaction(self, score_id=None, client=None):
        c = client or self.client
        sid = score_id if score_id is not None else self.score.pk
        return c.post(
            f"/api/scores/{sid}/reactions/",
            content_type="application/json",
            HTTP_X_CSRFTOKEN=self.csrf_token,
        )
```

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

**Resultado esperado:** todos los tests pasan, **55 tests en total**
(45 existentes + 10 nuevos). Zero errores, zero warnings.

---

## 9. Scope Boundaries

| Dentro de HU09 | Fuera de HU09 |
|---|---|
| Reacción tipo "me gusta" (toggle) | Múltiples tipos de reacción (emoji, etc.) |
| `reaction_count` y `user_reacted` en feed | Listado de quién reaccionó |
| Control de autoría (autor no puede reaccionar) | Notificaciones al autor |
| Tests backend (10 casos) | Integración frontend (Dev Apoyo) |
| Migración `0003_reaction` | Cambios en otros modelos |

---

## 10. Files to Create or Modify

| Archivo | Acción | Descripción |
|---|---|---|
| `backend/scores/models.py` | Modificar | Agregar modelo `Reaction` |
| `backend/scores/migrations/0003_reaction.py` | Crear (auto) | Generado por `makemigrations` |
| `backend/scores/views.py` | Modificar | Actualizar `_score_data`, agregar `score_reaction_view` e imports |
| `backend/notara_backend/urls.py` | Modificar | Registrar ruta `api/scores/<id>/reactions/` |
| `backend/scores/tests.py` | Modificar | Agregar `from .models import Score, Reaction` y clase `ScoreReactionTests` |

---

## 11. Traceability

- Story: US-009 / HU09
- Epic: COMMUNITY
- Sprint: Sprint 1
- Depends on: US-004 (Score Publication) — `READY_WITH_REVIEW_GATES`
- Blocks: ninguna historia conocida en Sprint 1
- Business rules: un usuario, una reacción por partitura; el autor no reacciona a lo propio

---

## 12. Implementation Status

`PENDING` — este documento es el prompt de implementación.
La validación se registrará en `US-009_SCORE_REACTION_VALIDATION.md`
una vez completada la implementación y verificación.
