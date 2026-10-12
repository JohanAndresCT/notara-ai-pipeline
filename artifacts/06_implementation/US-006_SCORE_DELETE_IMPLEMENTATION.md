# P06.7 US-006 Score Delete — Implementation Prompt

## 1. Metadata

- Project: Notara MVP
- Phase: P06.7 - Incremental Implementation
- Story: US-006 / HU06
- Priority: Must Have — MVP Core
- Epic: CONTENT
- Story Points: 2
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
quiero eliminar una partitura que yo publiqué,
para retirar de la comunidad contenido que ya no deseo compartir.

---

## 3. Acceptance Criteria

| ID | Given | When | Then |
|---|---|---|---|
| AC-US006-01 | Soy el autor de una partitura | Selecciono "Eliminar" y confirmo | La partitura desaparece del feed y del detalle; el servidor retorna 204 No Content |
| AC-US006-02 | Intento eliminar una partitura ajena | Llamo al endpoint DELETE con mi sesión | El servidor rechaza la operación con 403 Forbidden |
| AC-US006-03 | Selecciono "Eliminar" y cancelo la confirmación | No se envía la petición DELETE | La partitura permanece sin cambios (responsabilidad del frontend) |

> AC-US006-03 es de responsabilidad exclusiva del frontend (Dev Apoyo).
> El backend no tiene lógica de confirmación; simplemente elimina cuando recibe el DELETE.

---

## 4. Definition of Done

| Item | Criterio de verificación |
|---|---|
| Solo el autor puede eliminar su partitura | El endpoint retorna 403 si `request.user != score.owner` |
| Partitura eliminada desaparece del feed | Después del DELETE, GET `/api/scores/` no contiene la partitura eliminada |
| Confirmación requerida antes de eliminar | Responsabilidad del frontend — el backend no implementa confirmación |
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
    updated_at   = models.DateTimeField(auto_now=True)
```

> No se requieren cambios al modelo ni migraciones nuevas.

### Endpoint existente en `score_detail_view`

```
PATCH /api/scores/<id>/   → editar partitura (US-005, ya implementado)
```

El patrón de URL ya está registrado como:
```python
path("api/scores/<int:score_id>/", score_detail_view, name="score-detail")
```

HU06 **extiende** `score_detail_view` para aceptar también el método `DELETE`.

### Patrón CSRF existente

`score_detail_view` ya usa `@csrf_exempt` + verificación manual con
`_csrf_middleware.process_view()` después del check de autenticación.
El método DELETE debe seguir exactamente el mismo patrón para garantizar
que unauthenticated → 401, authenticated sin CSRF → 403.

### Tests existentes

- 30 tests originales (accounts + scores de US-001..US-004)
- 9 tests de HU05 (`ScoreEditTests`)
- Total actual: **39 tests pasando**

---

## 6. Implementation Tasks

### 6.1 Backend — extender `score_detail_view` con DELETE

**Archivo a modificar:** `backend/scores/views.py`

Cambios necesarios:

1. Cambiar el decorador de método de `["PATCH"]` a `["PATCH", "DELETE"]`.
2. Dentro de la función, después de verificar CSRF y ownership, agregar
   el bloque para manejar `DELETE`:

```python
if request.method == "DELETE":
    score.delete()
    return JsonResponse({}, status=204)
```

El bloque DELETE va **después** de las verificaciones de autenticación,
CSRF y ownership — exactamente en el mismo lugar donde actualmente
comienza el bloque de parseo JSON del PATCH.

**Flujo completo del endpoint extendido:**

```
DELETE /api/scores/<id>/
  ├── No autenticado        → 401
  ├── Sin CSRF              → 403
  ├── Score no existe       → 404
  ├── No es el autor        → 403
  └── Es el autor           → score.delete() → 204 {}
```

**Nota:** `JsonResponse({}, status=204)` retorna cuerpo vacío con status
204 No Content. No retornar el score eliminado.

### 6.2 Backend — URL (sin cambios)

La ruta `api/scores/<int:score_id>/` ya está registrada en
`backend/notara_backend/urls.py`. No se requieren cambios.

### 6.3 Backend — tests

**Archivo a modificar:** `backend/scores/tests.py`

Agregar una nueva clase `ScoreDeleteTests(TestCase)` con los siguientes
casos:

| Nombre del test | Qué verifica |
|---|---|
| `test_author_can_delete_own_score` | DELETE válido → 204 y `Score.objects.count() == 0` |
| `test_deleted_score_absent_from_feed` | Después del DELETE, GET `/api/scores/` devuelve lista vacía |
| `test_non_author_cannot_delete` | Usuario B intenta DELETE del score de Usuario A → 403, score sigue en DB |
| `test_delete_requires_authentication` | Cliente anónimo DELETE → 401, score sigue en DB |
| `test_delete_requires_csrf` | Autenticado sin CSRF token → 403, score sigue en DB |
| `test_delete_nonexistent_score_returns_404` | DELETE `/api/scores/99999/` → 404 |

**Estructura sugerida para setUp** (mismo patrón que `ScoreEditTests`):

```python
class ScoreDeleteTests(TestCase):
    def setUp(self):
        self.client = Client(enforce_csrf_checks=True)
        self.author = User.objects.create_user(
            email="deleter@example.com", name="Deleter", password="pass1234"
        )
        self.other_user = User.objects.create_user(
            email="other2@example.com", name="Other2", password="pass1234"
        )
        self.client.force_login(self.author)
        self.csrf_token = self.client.get("/api/csrf/").json()["csrfToken"]
        self.score = Score.objects.create(
            owner=self.author,
            title="Score to Delete",
            instrument="Violin",
            description="Will be deleted.",
            score_format=Score.Format.TEXT,
            content="A B C D",
        )

    def delete_score(self, score_id, client=None):
        c = client or self.client
        return c.delete(
            f"/api/scores/{score_id}/",
            content_type="application/json",
            HTTP_X_CSRFTOKEN=self.csrf_token,
        )
```

---

## 7. Verification Procedure

Ejecutar en orden después de implementar, desde `backend/` con venv activo:

```powershell
# 1. Sin errores de sistema
python manage.py check

# 2. Sin migraciones pendientes
python manage.py makemigrations --check --dry-run

# 3. Solo los tests de scores
python manage.py test scores -v 2

# 4. Suite completa — deben pasar los 39 anteriores + los 6 nuevos
python manage.py test accounts scores -v 1
```

**Resultado esperado:** todos los tests pasan, **45 tests en total**
(39 existentes + 6 nuevos). Zero errores, zero warnings.

---

## 8. Scope Boundaries

| Dentro de HU06 | Fuera de HU06 |
|---|---|
| `DELETE /api/scores/<id>/` → 204 | Confirmación de eliminación (frontend) |
| Control de autoría (403) | Soft delete / papelera de reciclaje |
| Score desaparece del feed tras DELETE | Eliminación en cascada de likes/comentarios (se resuelve automáticamente por `on_delete=CASCADE` en FK) |
| Tests backend (6 casos) | Integración frontend (Dev Apoyo) |
| Extender `score_detail_view` existente | Crear un nuevo view o nueva URL |

---

## 9. Files to Create or Modify

| Archivo | Acción | Descripción |
|---|---|---|
| `backend/scores/views.py` | Modificar | Extender `score_detail_view`: cambiar decorador a `["PATCH", "DELETE"]` y agregar bloque DELETE |
| `backend/scores/tests.py` | Modificar | Agregar clase `ScoreDeleteTests` con 6 casos |

> **`backend/notara_backend/urls.py`** — sin cambios.
> **No se requieren migraciones.**

---

## 10. Traceability

- Story: US-006 / HU06
- Epic: CONTENT
- Sprint: Sprint 1
- Depends on: US-005 (Score Edit) — `READY_WITH_REVIEW_GATES`
- Blocks: ninguna historia conocida en Sprint 1
- Business rules: solo el autor puede eliminar su propia partitura

---

## 11. Implementation Status

`PENDING` — este documento es el prompt de implementación.
La validación se registrará en `US-006_SCORE_DELETE_VALIDATION.md`
una vez completada la implementación y verificación.
