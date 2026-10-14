# Modelo de datos

Modelos definidos en `backend/accounts/models.py` y `backend/scores/models.py`. Motor: PostgreSQL en producción y CI; SQLite para pruebas locales.

## Diagrama

```text
User (accounts) 1 ──< Score (scores) 1 ──< Comment
   │                      │
   │                      ├──< Reaction  (única por score + usuario)
   │                      └──< Like      (única por score + usuario)
   └──< Comment / Reaction / Like (autor o usuario)
```

## `accounts.User`

Modelo de usuario personalizado con `email` como `USERNAME_FIELD`.

| Campo | Tipo / restricción |
|---|---|
| `email` | Único |
| `username` | Único, máx. 30 |
| `name` | Máx. 150 |
| `description` | Máx. 500 |
| `main_instrument` | Máx. 100 |
| `photo` | `ImageField`, `profile_photos/%Y/%m/` (opcional) |
| `is_active`, `is_staff`, `date_joined` | Estándar |

## `scores.Score`

| Campo | Tipo / restricción |
|---|---|
| `owner` | FK a `User` |
| `title`, `instrument`, `description` | Texto |
| `score_format` | `ABC` o `TEXT` |
| `content` | `TextField`; el límite de 1000 caracteres se aplica en las vistas, no en la base de datos |
| `created_at`, `updated_at` | Fechas automáticas |

## `scores.Comment`

Texto `body` (máx. 500), autor (FK a `User`) y partitura (FK a `Score`), con `created_at`.

## `scores.Reaction` y `scores.Like`

Ambos relacionan `Score` con `User` y tienen una restricción de unicidad por par score + usuario. Conviven como tablas separadas con conteos separados (`reaction_count`, `like_count`). La interfaz usa **reacciones**; el contador `likes_received` del perfil cuenta reacciones. Ver `P09-DISC-002`.

## Migraciones

| App | Archivos |
|---|---|
| `accounts` | `0001_initial`, `0002_user_main_instrument_user_photo`, `0003_user_profile_identity` |
| `scores` | `0001_initial`, `0002_alter_score_description_alter_score_instrument_and_more`, `0003_comment_like_like_unique_score_like_per_user`, `0003_reaction`, `0004_comment`, `0005_merge_community_models` |

`python backend\manage.py makemigrations --check --dry-run` no detectó cambios pendientes (verificado en P09). `migrate` se ejecuta al iniciar el contenedor de producción; no hay rollback automático de esquema.

## Archivos

Las fotos se guardan en `MEDIA_ROOT` (`/data/media` en la imagen Docker). La persistencia del volumen en Railway no está verificada.
