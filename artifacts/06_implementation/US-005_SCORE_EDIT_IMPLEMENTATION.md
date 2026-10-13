# P06.6 US-005 Score Edit — Implementation Prompt

## 1. Metadata

- Project: Notara MVP
- Phase: P06.6 - Incremental Implementation
- Story: US-005 / HU05
- Priority: Must Have — MVP Core
- Epic: CONTENT
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
quiero editar el título, la descripción o el instrumento de una partitura que
yo publiqué,
para corregir o actualizar la información de mi contenido.

---

## 3. Acceptance Criteria

| ID | Given | When | Then |
|---|---|---|---|
| AC-US005-01 | Soy el autor de una partitura | Edito título, descripción o instrumento y guardo | Los cambios se reflejan en el feed y en el detalle |
| AC-US005-02 | Intento editar una partitura de otro usuario | Accedo al endpoint de edición con mi sesión | El servidor rechaza la operación con 403 Forbidden |
| AC-US005-03 | Soy el autor y dejo el título vacío al editar | Envío el formulario | El sistema no guarda el cambio y devuelve un error de validación |

---

## 4. Definition of Done

| Item | Criterio de verificación |
|---|---|
| Solo el autor puede editar su partitura | El endpoint retorna 403 si `request.user != score.owner` |
| Cambios guardados se reflejan inmediatamente | El GET de feed y detalle devuelven los datos actualizados |
| Validación de campos obligatorios activa | Título vacío (y otros campos requeridos) retornan 400 con errores |
| Probado en móvil y escritorio | Viewport 360 px y 1280 px verificados en browser |
| Aprobación del Product Owner | Pendiente — registrar evidencia tras revisión |

---

## 5. Technical Context

### Stack existente (no modificar)

- **Backend:** Django 5.2.1, Django REST Framework 3.15.2, Python 3.14.2
- **Base de datos:** SQLite en desarrollo (`DJANGO_DB_ENGINE=sqlite`), PostgreSQL en producción
- **Autenticación:** Session authentication + CSRF tokens
- **Convención de rutas:** `/api/v1/` (no `/api/v1/`)
- **App de partituras:** `backend/scores/`

### Modelo Score existente

```python
# backend/scores/models.py
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
    updated_at   = models.DateTimeField(auto_now=True)   # ya existe — se actualiza automáticamente
```

> El campo `updated_at` ya está en el modelo con `auto_now=True`.
> **No se necesita migración de modelo** para los campos editables básicos.

### Endpoint existente

```
GET  /api/v1/scores/       → lista paginada (feed)
POST /api/v1/scores/       → crear partitura
```

El archivo de rutas es `backend/notara_backend/urls.py`.

### Campos editables en HU05

Solo se permite editar: `title`, `instrument`, `description`.
El campo `content` y `format` **no se editan** en esta historia
(modificar el contenido musical es una historia distinta).

---

## 6. Implementation Tasks

### 6.1 Backend — nuevo endpoint PATCH

**Archivo a modificar:** `backend/scores/views.py`
**Archivo a modificar:** `backend/notara_backend/urls.py`

#### Endpoint a crear

```
PATCH /api/v1/scores/<id>/
```

**Comportamiento esperado:**

| Caso | Respuesta |
|---|---|
| Usuario no autenticado | 401 `{"message": "Authentication is required."}` |
| Score no existe | 404 `{"message": "Score not found."}` |
| Usuario autenticado pero no es el autor | 403 `{"message": "You do not have permission to edit this score."}` |
| Payload con título vacío u otro campo requerido vacío | 400 `{"errors": {"title": ["Title is required."], ...}}` |
| Edición válida | 200 `{"score": { ...score actualizado... }}` |

**Campos validados en PATCH:**

- `title`: requerido, no puede quedar vacío tras strip
- `instrument`: requerido, no puede quedar vacío tras strip
- `description`: opcional (puede ser cadena vacía)

**Reglas de negocio:**

- Solo se actualizan los campos presentes en el payload (PATCH parcial).
  Si el payload no incluye `title`, no se toca.
- El campo `owner`, `format`, `content`, `created_at` nunca se modifican
  desde este endpoint.
- `updated_at` se actualiza automáticamente por `auto_now=True`.

**Función helper reutilizable:** usar `_score_data(score)` ya existente en
`views.py` para serializar la respuesta.

#### Ejemplo de implementación sugerida

```python
@require_http_methods(["PATCH"])
def score_detail_view(request, score_id):
    if not request.user.is_authenticated:
        return JsonResponse({"message": "Authentication is required."}, status=401)

    try:
        score = Score.objects.select_related("owner").get(pk=score_id)
    except Score.DoesNotExist:
        return JsonResponse({"message": "Score not found."}, status=404)

    if score.owner != request.user:
        return JsonResponse(
            {"message": "You do not have permission to edit this score."},
            status=403,
        )

    # parseo y validación del payload ...
    # actualización parcial de campos presentes ...
    # retornar 200 con _score_data(score) ...
```

#### URL a registrar en `urls.py`

```python
path("api/scores/<int:score_id>/", score_detail_view, name="score-detail"),
```

---

### 6.2 Backend — tests

**Archivo a modificar:** `backend/scores/tests.py`

Agregar una nueva clase `ScoreEditTests(TestCase)` con los siguientes casos:

| Nombre del test | Qué verifica |
|---|---|
| `test_author_can_edit_title_instrument_description` | PATCH válido → 200 y cambios persistidos |
| `test_edit_reflects_in_feed` | Después del PATCH, GET `/api/v1/scores/` devuelve los valores actualizados |
| `test_non_author_cannot_edit` | Usuario B intenta editar score de Usuario A → 403 |
| `test_edit_requires_authentication` | Cliente anónimo → 401 |
| `test_edit_requires_csrf` | PATCH sin CSRF token → 403 |
| `test_empty_title_is_rejected` | `title: ""` → 400 con error en campo `title` y sin cambios en DB |
| `test_empty_instrument_is_rejected` | `instrument: ""` → 400 con error en campo `instrument` |
| `test_nonexistent_score_returns_404` | PATCH a `/api/v1/scores/99999/` → 404 |
| `test_partial_patch_only_updates_sent_fields` | Payload solo con `title` → solo `title` cambia, resto intacto |

**Estructura sugerida para setUp:**

```python
class ScoreEditTests(TestCase):
    def setUp(self):
        self.client = Client(enforce_csrf_checks=True)
        self.author = User.objects.create_user(
            email="author@example.com", name="Author", password="pass1234"
        )
        self.other_user = User.objects.create_user(
            email="other@example.com", name="Other", password="pass1234"
        )
        self.client.force_login(self.author)
        self.csrf_token = self.client.get("/api/v1/csrf/").json()["csrfToken"]
        self.score = Score.objects.create(
            owner=self.author,
            title="Original Title",
            instrument="Guitar",
            description="Original desc",
            score_format=Score.Format.TEXT,
            content="C D E F",
        )

    def patch_score(self, score_id, payload, client=None):
        c = client or self.client
        return c.patch(
            f"/api/v1/scores/{score_id}/",
            data=json.dumps(payload),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=self.csrf_token,
        )
```

---

## 7. Verification Procedure

Ejecutar en orden después de implementar:

```powershell
# 1. Sin errores de sistema
python manage.py check

# 2. Sin migraciones pendientes (no debe haber cambios de modelo)
python manage.py makemigrations --check --dry-run

# 3. Solo los tests de scores
python manage.py test scores -v 2

# 4. Suite completa — deben pasar los 30 anteriores + los nuevos
python manage.py test accounts scores -v 1
```

**Resultado esperado:** todos los tests pasan, 0 errores, 0 warnings.

---

## 8. Scope Boundaries

| Dentro de HU05 | Fuera de HU05 |
|---|---|
| Editar `title`, `instrument`, `description` | Editar `content` o `format` |
| Endpoint `PATCH /api/v1/scores/<id>/` | Endpoint `DELETE /api/v1/scores/<id>/` |
| Validación de campos requeridos | Paginación o filtros del feed |
| Control de autoría (403) | Vista de detalle completa (otra HU) |
| Tests backend | Integración frontend (Dev Apoyo) |

---

## 9. Files to Create or Modify

| Archivo | Acción | Descripción |
|---|---|---|
| `backend/scores/views.py` | Modificar | Agregar función `score_detail_view` con lógica PATCH |
| `backend/notara_backend/urls.py` | Modificar | Registrar ruta `api/scores/<int:score_id>/` |
| `backend/scores/tests.py` | Modificar | Agregar clase `ScoreEditTests` con 9 casos |

> **No se requieren migraciones** — el modelo `Score` ya tiene todos los
> campos necesarios incluido `updated_at`.

---

## 10. Traceability

- Story: US-005 / HU05
- Epic: CONTENT
- Sprint: Sprint 1
- Depends on: US-004 (Score Publication) — `READY_WITH_REVIEW_GATES`
- Blocks: ninguna historia conocida en Sprint 1
- Requirements: edición de metadatos de partitura propia
- Business rules: solo el autor puede modificar su partitura

---

## 11. Implementation Status

`PENDING` — este documento es el prompt de implementación.
La validación se registrará en `US-005_SCORE_EDIT_VALIDATION.md`
una vez completada la implementación y verificación.
