import json

from django.test import Client, TestCase

from accounts.models import User
from .models import Score, Reaction, Comment


class ScorePublicationTests(TestCase):
    def setUp(self):
        self.client = Client(enforce_csrf_checks=True)
        self.user = User.objects.create_user(
            email="composer@example.com",
            name="Composer",
            password="correct-horse",
        )
        self.client.force_login(self.user)
        self.csrf_token = self.client.get("/api/csrf/").json()["csrfToken"]

    def post_score(self, payload):
        return self.client.post(
            "/api/scores/",
            data=json.dumps(payload),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=self.csrf_token,
        )

    @staticmethod
    def text_payload(**changes):
        payload = {
            "title": "Morning Theme",
            "instrument": "Piano",
            "description": "A short theme for practice.",
            "format": "TEXT",
            "content": "C D E F",
        }
        payload.update(changes)
        return payload

    @staticmethod
    def abc_payload(**changes):
        payload = {
            "title": "ABC Theme",
            "instrument": "Fiddle",
            "description": "A short traditional melody.",
            "format": "ABC",
            "content": "X:1\nT:ABC Theme\nM:4/4\nL:1/4\nK:C\nC D E F|",
        }
        payload.update(changes)
        return payload

    def test_authenticated_plain_text_publication_appears_in_feed(self):
        response = self.post_score(self.text_payload())

        self.assertEqual(response.status_code, 201)
        self.assertEqual(Score.objects.count(), 1)
        self.assertEqual(Score.objects.get().owner, self.user)
        feed_response = self.client.get("/api/scores/")
        self.assertEqual(feed_response.status_code, 200)
        self.assertEqual(feed_response.json()["scores"][0]["title"], "Morning Theme")
        self.assertEqual(feed_response.json()["scores"][0]["format"], "TEXT")

    def test_authenticated_abc_publication_passes_minimal_checks(self):
        response = self.post_score(self.abc_payload())

        self.assertEqual(response.status_code, 201)
        self.assertEqual(Score.objects.get().score_format, Score.Format.ABC)

    def test_title_instrument_description_and_content_are_required(self):
        cases = [
            ("title", ""),
            ("instrument", ""),
            ("description", ""),
            ("content", ""),
        ]
        for field, value in cases:
            with self.subTest(field=field):
                response = self.post_score(self.text_payload(**{field: value}))
                self.assertEqual(response.status_code, 400)
                self.assertIn(field, response.json()["errors"])
                self.assertEqual(Score.objects.count(), 0)

    def test_unsupported_format_is_rejected(self):
        response = self.post_score(self.text_payload(format="PDF"))

        self.assertEqual(response.status_code, 400)
        self.assertIn("format", response.json()["errors"])
        self.assertEqual(Score.objects.count(), 0)

    def test_content_over_1000_characters_is_rejected(self):
        response = self.post_score(self.text_payload(content="x" * 1001))

        self.assertEqual(response.status_code, 400)
        self.assertIn("content", response.json()["errors"])
        self.assertEqual(Score.objects.count(), 0)

    def test_abc_requires_headers_and_a_musical_line(self):
        missing_header = self.post_score(self.abc_payload(content="X:1\nK:C\nC D"))
        no_musical_line = self.post_score(
            self.abc_payload(content="X:1\nT:Title\nM:4/4\nL:1/4\nK:C\ncomment")
        )

        self.assertEqual(missing_header.status_code, 400)
        self.assertEqual(no_musical_line.status_code, 400)
        self.assertEqual(Score.objects.count(), 0)

    def test_anonymous_user_cannot_publish_or_read_feed(self):
        anonymous_client = Client()

        publish_response = anonymous_client.post(
            "/api/scores/",
            data=json.dumps(self.text_payload()),
            content_type="application/json",
        )
        feed_response = anonymous_client.get("/api/scores/")

        self.assertEqual(publish_response.status_code, 401)
        self.assertEqual(feed_response.status_code, 401)
        self.assertEqual(Score.objects.count(), 0)

    def test_publication_requires_csrf(self):
        client_without_csrf = Client(enforce_csrf_checks=True)
        client_without_csrf.force_login(self.user)
        response = client_without_csrf.post(
            "/api/scores/",
            data=json.dumps(self.text_payload()),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(Score.objects.count(), 0)


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
        self.csrf_token = self.client.get("/api/csrf/").json()["csrfToken"]
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
            f"/api/scores/{score_id}/",
            data=json.dumps(payload),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=self.csrf_token,
        )

    def test_author_can_edit_title_instrument_description(self):
        response = self.patch_score(
            self.score.pk,
            {"title": "New Title", "instrument": "Piano", "description": "New desc"},
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()["score"]
        self.assertEqual(data["title"], "New Title")
        self.assertEqual(data["instrument"], "Piano")
        self.assertEqual(data["description"], "New desc")
        self.score.refresh_from_db()
        self.assertEqual(self.score.title, "New Title")
        self.assertEqual(self.score.instrument, "Piano")
        self.assertEqual(self.score.description, "New desc")

    def test_edit_reflects_in_feed(self):
        self.patch_score(self.score.pk, {"title": "Feed Title"})
        feed = self.client.get("/api/scores/").json()["scores"]
        self.assertEqual(feed[0]["title"], "Feed Title")

    def test_non_author_cannot_edit(self):
        other_client = Client(enforce_csrf_checks=True)
        other_client.force_login(self.other_user)
        other_csrf = other_client.get("/api/csrf/").json()["csrfToken"]
        response = other_client.patch(
            f"/api/scores/{self.score.pk}/",
            data=json.dumps({"title": "Hijacked"}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=other_csrf,
        )
        self.assertEqual(response.status_code, 403)
        self.score.refresh_from_db()
        self.assertEqual(self.score.title, "Original Title")

    def test_edit_requires_authentication(self):
        anon = Client(enforce_csrf_checks=True)
        response = anon.patch(
            f"/api/scores/{self.score.pk}/",
            data=json.dumps({"title": "Anon"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 401)

    def test_edit_requires_csrf(self):
        client_no_csrf = Client(enforce_csrf_checks=True)
        client_no_csrf.force_login(self.author)
        response = client_no_csrf.patch(
            f"/api/scores/{self.score.pk}/",
            data=json.dumps({"title": "No CSRF"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 403)

    def test_empty_title_is_rejected(self):
        response = self.patch_score(self.score.pk, {"title": ""})
        self.assertEqual(response.status_code, 400)
        self.assertIn("title", response.json()["errors"])
        self.score.refresh_from_db()
        self.assertEqual(self.score.title, "Original Title")

    def test_empty_instrument_is_rejected(self):
        response = self.patch_score(self.score.pk, {"instrument": ""})
        self.assertEqual(response.status_code, 400)
        self.assertIn("instrument", response.json()["errors"])
        self.score.refresh_from_db()
        self.assertEqual(self.score.instrument, "Guitar")

    def test_nonexistent_score_returns_404(self):
        response = self.patch_score(99999, {"title": "Ghost"})
        self.assertEqual(response.status_code, 404)

    def test_partial_patch_only_updates_sent_fields(self):
        response = self.patch_score(self.score.pk, {"title": "Only Title Changed"})
        self.assertEqual(response.status_code, 200)
        self.score.refresh_from_db()
        self.assertEqual(self.score.title, "Only Title Changed")
        self.assertEqual(self.score.instrument, "Guitar")
        self.assertEqual(self.score.description, "Original desc")


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

    def test_author_can_delete_own_score(self):
        response = self.delete_score(self.score.pk)
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Score.objects.count(), 0)

    def test_deleted_score_absent_from_feed(self):
        self.delete_score(self.score.pk)
        feed = self.client.get("/api/scores/").json()["scores"]
        self.assertEqual(feed, [])

    def test_non_author_cannot_delete(self):
        other_client = Client(enforce_csrf_checks=True)
        other_client.force_login(self.other_user)
        other_csrf = other_client.get("/api/csrf/").json()["csrfToken"]
        response = other_client.delete(
            f"/api/scores/{self.score.pk}/",
            content_type="application/json",
            HTTP_X_CSRFTOKEN=other_csrf,
        )
        self.assertEqual(response.status_code, 403)
        self.assertEqual(Score.objects.count(), 1)

    def test_delete_requires_authentication(self):
        anon = Client(enforce_csrf_checks=True)
        response = anon.delete(
            f"/api/scores/{self.score.pk}/",
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 401)
        self.assertEqual(Score.objects.count(), 1)

    def test_delete_requires_csrf(self):
        client_no_csrf = Client(enforce_csrf_checks=True)
        client_no_csrf.force_login(self.author)
        response = client_no_csrf.delete(
            f"/api/scores/{self.score.pk}/",
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 403)
        self.assertEqual(Score.objects.count(), 1)

    def test_delete_nonexistent_score_returns_404(self):
        response = self.delete_score(99999)
        self.assertEqual(response.status_code, 404)


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

    def test_authenticated_user_can_react_to_others_score(self):
        response = self.post_reaction()
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertTrue(data["reacted"])
        self.assertEqual(data["reaction_count"], 1)
        self.assertEqual(Reaction.objects.count(), 1)

    def test_reaction_reflected_in_feed(self):
        self.post_reaction()
        feed = self.client.get("/api/scores/").json()["scores"]
        self.assertEqual(feed[0]["reaction_count"], 1)
        self.assertTrue(feed[0]["user_reacted"])

    def test_toggle_removes_existing_reaction(self):
        self.post_reaction()
        response = self.post_reaction()
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertFalse(data["reacted"])
        self.assertEqual(data["reaction_count"], 0)
        self.assertEqual(Reaction.objects.count(), 0)

    def test_author_cannot_react_to_own_score(self):
        author_client = Client(enforce_csrf_checks=True)
        author_client.force_login(self.author)
        author_csrf = author_client.get("/api/csrf/").json()["csrfToken"]
        response = author_client.post(
            f"/api/scores/{self.score.pk}/reactions/",
            content_type="application/json",
            HTTP_X_CSRFTOKEN=author_csrf,
        )
        self.assertEqual(response.status_code, 403)
        self.assertEqual(Reaction.objects.count(), 0)

    def test_reaction_requires_authentication(self):
        anon = Client()
        response = anon.post(
            f"/api/scores/{self.score.pk}/reactions/",
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 401)

    def test_reaction_requires_csrf(self):
        client_no_csrf = Client(enforce_csrf_checks=True)
        client_no_csrf.force_login(self.reactor)
        response = client_no_csrf.post(
            f"/api/scores/{self.score.pk}/reactions/",
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 403)

    def test_reaction_on_nonexistent_score_returns_404(self):
        response = self.post_reaction(score_id=99999)
        self.assertEqual(response.status_code, 404)

    def test_multiple_users_can_react_independently(self):
        self.post_reaction()
        other_client = Client(enforce_csrf_checks=True)
        other_client.force_login(self.other_reactor)
        other_csrf = other_client.get("/api/csrf/").json()["csrfToken"]
        other_client.post(
            f"/api/scores/{self.score.pk}/reactions/",
            content_type="application/json",
            HTTP_X_CSRFTOKEN=other_csrf,
        )
        feed = self.client.get("/api/scores/").json()["scores"]
        self.assertEqual(feed[0]["reaction_count"], 2)

    def test_reaction_count_zero_by_default(self):
        feed = self.client.get("/api/scores/").json()["scores"]
        self.assertEqual(feed[0]["reaction_count"], 0)
        self.assertFalse(feed[0]["user_reacted"])

    def test_reaction_cascade_delete_with_score(self):
        self.post_reaction()
        self.score.delete()
        self.assertEqual(Reaction.objects.count(), 0)


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
        self.csrf_token = self.client.get("/api/csrf/").json()["csrfToken"]
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
            f"/api/scores/{sid}/comments/",
            data=json.dumps({"body": body}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=self.csrf_token,
        )

    def delete_comment(self, comment_id, score_id=None, client=None):
        c = client or self.client
        sid = score_id if score_id is not None else self.score.pk
        return c.delete(
            f"/api/scores/{sid}/comments/{comment_id}/",
            content_type="application/json",
            HTTP_X_CSRFTOKEN=self.csrf_token,
        )

    def test_authenticated_user_can_post_comment(self):
        response = self.post_comment()
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Comment.objects.count(), 1)
        data = response.json()["comment"]
        self.assertEqual(data["body"], "Great score!")
        self.assertEqual(data["author"], "Commenter")
        self.assertIn("created_at", data)

    def test_comment_appears_in_list(self):
        self.post_comment()
        response = self.client.get(f"/api/scores/{self.score.pk}/comments/")
        self.assertEqual(response.status_code, 200)
        comments = response.json()["comments"]
        self.assertEqual(len(comments), 1)
        self.assertEqual(comments[0]["body"], "Great score!")
        self.assertEqual(comments[0]["author"], "Commenter")

    def test_empty_comment_is_rejected(self):
        response = self.post_comment(body="")
        self.assertEqual(response.status_code, 400)
        self.assertIn("body", response.json()["errors"])
        self.assertEqual(Comment.objects.count(), 0)

    def test_whitespace_only_comment_is_rejected(self):
        response = self.post_comment(body="   ")
        self.assertEqual(response.status_code, 400)
        self.assertIn("body", response.json()["errors"])

    def test_comment_over_500_chars_is_rejected(self):
        response = self.post_comment(body="x" * 501)
        self.assertEqual(response.status_code, 400)
        self.assertIn("body", response.json()["errors"])

    def test_comment_requires_authentication(self):
        anon = Client()
        response = anon.post(
            f"/api/scores/{self.score.pk}/comments/",
            data=json.dumps({"body": "Hello"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 401)

    def test_comment_requires_csrf(self):
        client_no_csrf = Client(enforce_csrf_checks=True)
        client_no_csrf.force_login(self.commenter)
        response = client_no_csrf.post(
            f"/api/scores/{self.score.pk}/comments/",
            data=json.dumps({"body": "No token"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 403)

    def test_comment_on_nonexistent_score_returns_404(self):
        response = self.post_comment(score_id=99999)
        self.assertEqual(response.status_code, 404)

    def test_author_can_delete_own_comment(self):
        self.post_comment()
        comment = Comment.objects.first()
        response = self.delete_comment(comment.pk)
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Comment.objects.count(), 0)

    def test_non_author_cannot_delete_comment(self):
        self.post_comment()
        comment = Comment.objects.first()
        other_client = Client(enforce_csrf_checks=True)
        other_client.force_login(self.other_commenter)
        other_csrf = other_client.get("/api/csrf/").json()["csrfToken"]
        response = other_client.delete(
            f"/api/scores/{self.score.pk}/comments/{comment.pk}/",
            content_type="application/json",
            HTTP_X_CSRFTOKEN=other_csrf,
        )
        self.assertEqual(response.status_code, 403)
        self.assertEqual(Comment.objects.count(), 1)

    def test_delete_requires_csrf(self):
        self.post_comment()
        comment = Comment.objects.first()
        client_no_csrf = Client(enforce_csrf_checks=True)
        client_no_csrf.force_login(self.commenter)
        response = client_no_csrf.delete(
            f"/api/scores/{self.score.pk}/comments/{comment.pk}/",
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 403)
        self.assertEqual(Comment.objects.count(), 1)

    def test_comment_cascade_delete_with_score(self):
        self.post_comment()
        self.score.delete()
        self.assertEqual(Comment.objects.count(), 0)
