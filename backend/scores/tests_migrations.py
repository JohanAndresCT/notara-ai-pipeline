from importlib import import_module
from unittest.mock import Mock

from django.db import connection, models
from django.db.migrations.executor import MigrationExecutor
from django.test import TransactionTestCase

from accounts.models import User
from .models import Comment, Score

BASE_MIGRATION = ("scores", "0002_alter_score_description_alter_score_instrument_and_more")
COMMENT_MIGRATION = ("scores", "0004_comment")
LATEST_MIGRATION = ("scores", "0006_comment_audio_comment_audio_mime_comment_kind_and_more")


class CommentMigrationTests(TransactionTestCase):
    reset_sequences = True

    def setUp(self):
        super().setUp()
        self._migrate_to_scores(BASE_MIGRATION[1])
        self._drop_comment_table()

    def tearDown(self):
        self._migrate_to_scores(BASE_MIGRATION[1])
        self._drop_comment_table()
        executor = MigrationExecutor(connection)
        executor.migrate(executor.loader.graph.leaf_nodes())
        super().tearDown()

    def test_migrates_comment_table_from_an_empty_schema(self):
        self._migrate_to_scores(LATEST_MIGRATION[1])

        with connection.cursor() as cursor:
            description = connection.introspection.get_table_description(
                cursor, Comment._meta.db_table
            )

        columns = {column.name for column in description}
        self.assertTrue({"audio", "audio_mime", "kind"}.issubset(columns))

    def test_postgresql_comment_fields_are_varchar_with_expected_length_and_nullability(self):
        if connection.vendor != "postgresql":
            self.skipTest("PostgreSQL column introspection is exercised in the PostgreSQL 16 CI job.")

        self._migrate_to_scores(LATEST_MIGRATION[1])
        with connection.cursor() as cursor:
            description = connection.introspection.get_table_description(
                cursor, Comment._meta.db_table
            )
            cursor.execute(
                """
                SELECT column_name, data_type, character_maximum_length, is_nullable
                FROM information_schema.columns
                WHERE table_schema = current_schema()
                  AND table_name = %s
                  AND column_name IN ('audio', 'audio_mime', 'kind')
                """,
                [Comment._meta.db_table],
            )
            postgres_columns = {row[0]: row[1:] for row in cursor.fetchall()}

        columns = {column.name: column for column in description}
        expected = {"audio": 100, "audio_mime": 32, "kind": 5}
        for name, length in expected.items():
            with self.subTest(column=name):
                column = columns[name]
                self.assertEqual(
                    postgres_columns[name],
                    ("character varying", length, "NO"),
                )
                self.assertEqual(
                    connection.introspection.get_field_type(column.type_code, column),
                    "CharField",
                )
                self.assertEqual(column.internal_size, length)
                self.assertFalse(column.null_ok)

    def test_historical_model_state_renders_foreign_keys_for_both_migrations(self):
        migrations = (
            (
                "scores.migrations.0003_comment_like_like_unique_score_like_per_user",
                "0002_alter_score_description_alter_score_instrument_and_more",
            ),
            ("scores.migrations.0004_comment", "0003_reaction"),
        )
        for module_name, parent_migration in migrations:
            with self.subTest(migration=module_name):
                historical_apps = MigrationExecutor(connection).loader.project_state(
                    [("scores", parent_migration)]
                ).apps
                schema_editor = Mock()
                schema_editor.connection.introspection.table_names.return_value = []
                migration = import_module(module_name)

                migration.create_comment_table_if_missing(historical_apps, schema_editor)

                comment_model = schema_editor.create_model.call_args.args[0]
                self.assertEqual(
                    comment_model._meta.get_field("author").remote_field.model._meta.label_lower,
                    "accounts.user",
                )
                self.assertEqual(
                    comment_model._meta.get_field("score").remote_field.model._meta.label_lower,
                    "scores.score",
                )

    def test_preserves_compatible_preexisting_audio_column_and_comment_data(self):
        user = User.objects.create_user(
            email="migration@example.com",
            name="Migration test",
            password="test-password",
        )
        score = Score.objects.create(
            owner=user,
            title="Migration score",
            instrument="Piano",
            description="Migration test",
            score_format=Score.Format.TEXT,
            content="C D E",
        )
        comment_model = self._create_legacy_comment_table()
        comment = comment_model.objects.create(
            body="Existing comment",
            author_id=user.pk,
            score_id=score.pk,
        )
        self._add_column(
            comment_model,
            "audio",
            models.FileField(blank=True, upload_to="voice_comments/%Y/%m/"),
        )
        with connection.cursor() as cursor:
            cursor.execute(
                f"UPDATE {connection.ops.quote_name(comment_model._meta.db_table)} "
                f"SET {connection.ops.quote_name('audio')} = %s "
                f"WHERE {connection.ops.quote_name('id')} = %s",
                ["voice_comments/legacy.wav", comment.pk],
            )
            cursor.execute(
                f"SELECT {connection.ops.quote_name('audio')} "
                f"FROM {connection.ops.quote_name(comment_model._meta.db_table)} "
                f"WHERE {connection.ops.quote_name('id')} = %s",
                [comment.pk],
            )
            self.assertEqual(cursor.fetchone()[0], "voice_comments/legacy.wav")

        self._migrate_to_scores(LATEST_MIGRATION[1])

        comment = Comment.objects.get(pk=comment.pk)
        self.assertEqual(comment.body, "Existing comment")
        self.assertEqual(
            comment.audio.name,
            "voice_comments/legacy.wav",
            Comment.objects.filter(pk=comment.pk).values_list("audio", flat=True).get(),
        )
        self.assertEqual(comment.audio_mime, "")
        self.assertEqual(comment.kind, Comment.Kind.TEXT)

    def test_preserves_all_compatible_preexisting_columns(self):
        user = User.objects.create_user(
            email="migration-columns@example.com",
            name="Migration columns",
            password="test-password",
        )
        score = Score.objects.create(
            owner=user,
            title="Migration score",
            instrument="Piano",
            description="Migration test",
            score_format=Score.Format.TEXT,
            content="C D E",
        )
        comment_model = self._create_legacy_comment_table()
        self._add_column(
            comment_model,
            "audio",
            models.FileField(blank=True, upload_to="voice_comments/%Y/%m/"),
        )
        self._add_column(comment_model, "audio_mime", models.CharField(blank=True, max_length=32))
        self._add_column(
            comment_model,
            "kind",
            models.CharField(
                choices=[("TEXT", "Text"), ("VOICE", "Voice")],
                default="TEXT",
                max_length=5,
            ),
        )
        comment = comment_model.objects.create(
            body="Existing voice comment",
            author_id=user.pk,
            score_id=score.pk,
            audio="voice_comments/legacy.wav",
            audio_mime="audio/wav",
            kind="VOICE",
        )

        self._migrate_to_scores(LATEST_MIGRATION[1])

        comment = Comment.objects.get(pk=comment.pk)
        self.assertEqual(comment.body, "Existing voice comment")
        self.assertEqual(comment.audio.name, "voice_comments/legacy.wav")
        self.assertEqual(comment.audio_mime, "audio/wav")
        self.assertEqual(comment.kind, Comment.Kind.VOICE)

    def test_reversing_0006_preserves_columns_and_comment_data(self):
        user = User.objects.create_user(
            email="migration-reverse@example.com",
            name="Migration reverse",
            password="test-password",
        )
        score = Score.objects.create(
            owner=user,
            title="Migration score",
            instrument="Piano",
            description="Migration test",
            score_format=Score.Format.TEXT,
            content="C D E",
        )
        comment_model = self._create_legacy_comment_table()
        self._add_column(
            comment_model,
            "audio",
            models.FileField(blank=True, upload_to="voice_comments/%Y/%m/"),
        )
        self._add_column(comment_model, "audio_mime", models.CharField(blank=True, max_length=32))
        comment = comment_model.objects.create(
            body="Existing voice comment",
            author_id=user.pk,
            score_id=score.pk,
            audio="voice_comments/reverse.wav",
            audio_mime="audio/wav",
        )
        self._migrate_to_scores(LATEST_MIGRATION[1])
        Comment.objects.filter(pk=comment.pk).update(kind=Comment.Kind.VOICE)

        self._migrate_to_scores("0005_merge_community_models")

        with connection.cursor() as cursor:
            columns = {
                column.name
                for column in connection.introspection.get_table_description(
                    cursor, Comment._meta.db_table
                )
            }
            cursor.execute(
                f"SELECT audio, audio_mime, kind FROM "
                f"{connection.ops.quote_name(Comment._meta.db_table)} "
                "WHERE id = %s",
                [comment.pk],
            )
            values = cursor.fetchone()
        self.assertTrue({"audio", "audio_mime", "kind"}.issubset(columns))
        self.assertEqual(values, ("voice_comments/reverse.wav", "audio/wav", "VOICE"))

    def test_rejects_incompatible_preexisting_column(self):
        comment_model = self._create_legacy_comment_table()
        self._add_column(comment_model, "audio", models.CharField(blank=True, max_length=16))

        with self.assertRaisesRegex(RuntimeError, r"scores_comment\.audio is incompatible"):
            self._migrate_to_scores(LATEST_MIGRATION[1])

    def _migrate_to_scores(self, migration_name):
        executor = MigrationExecutor(connection)
        other_app_targets = [
            node
            for node in executor.loader.graph.leaf_nodes()
            if node[0] != "scores"
        ]
        executor.migrate(other_app_targets + [("scores", migration_name)])

    def _create_legacy_comment_table(self):
        executor = MigrationExecutor(connection)
        comment_model = executor.loader.project_state([COMMENT_MIGRATION]).apps.get_model(
            "scores", "Comment"
        )
        with connection.schema_editor() as schema_editor:
            schema_editor.create_model(comment_model)
        return comment_model

    def _add_column(self, model, name, field):
        field.contribute_to_class(model, name)
        with connection.schema_editor() as schema_editor:
            schema_editor.add_field(model, field)

    def _drop_comment_table(self):
        if Comment._meta.db_table not in connection.introspection.table_names():
            return
        executor = MigrationExecutor(connection)
        comment_model = executor.loader.project_state([COMMENT_MIGRATION]).apps.get_model(
            "scores", "Comment"
        )
        with connection.schema_editor() as schema_editor:
            schema_editor.delete_model(comment_model)
