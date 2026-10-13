from django.db import migrations


def add_comment_index_if_missing(apps, schema_editor):
    comment_model = apps.get_model("scores", "Comment")
    index = comment_model._meta.indexes[0]
    constraints = schema_editor.connection.introspection.get_constraints(
        schema_editor.connection.cursor(),
        comment_model._meta.db_table,
    )
    if index.name not in constraints:
        schema_editor.add_index(comment_model, index)


class Migration(migrations.Migration):
    dependencies = [
        ("scores", "0003_comment_like_like_unique_score_like_per_user"),
        ("scores", "0004_comment"),
    ]

    operations = [
        migrations.RunPython(
            add_comment_index_if_missing,
            migrations.RunPython.noop,
        ),
    ]
