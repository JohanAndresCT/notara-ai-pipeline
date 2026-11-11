import json

from django.db import IntegrityError, connection
from django.test import Client, RequestFactory, TestCase
from django.test.utils import CaptureQueriesContext

from accounts.models import User
from .views import score_comment_detail_view, score_detail_view
from .models import Comment, Like, Reaction, Score


class ScorePublicationTests(TestCase):
    def setUp(self):
        self.client = Client(enforce_csrf_checks=True)
        self.user = User.objects.create_user(
            email="composer@example.com",
            name="Composer",
            password="correct-horse",
        )
        self.client.force_login(self.user)
        self.csrf_token = self.client.get("/api/v1/csrf/").json()["csrfToken"]

    def post_score(self, payload):
        return self.client.post(
            "/api/v1/scores/",
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
        feed_response = self.client.get("/api/v1/scores/")
        self.assertEqual(feed_response.status_code, 200)
        self.assertEqual(feed_response.json()["scores"][0]["title"], "Morning Theme")
        self.assertEqual(feed_response.json()["scores"][0]["format"], "TEXT")
        self.assertEqual(feed_response.json()["page"], 1)
        self.assertEqual(feed_response.json()["page_size"], 10)

    def test_feed_filters_by_instrument_and_paginates_ten_results(self):
        for index in range(11):
            Score.objects.create(
                owner=self.user,
                title=f"Piano {index}",
                instrument="Piano",
                description="Practice score.",
                score_format=Score.Format.TEXT,
                content="C D E F",
            )
        Score.objects.create(
            owner=self.user,
            title="Guitar score",
            instrument="Guitar",
            description="Practice score.",
            score_format=Score.Format.TEXT,
            content="C D E F",
        )

        first_page = self.client.get("/api/v1/scores/?instrument=piano&page=1")
        second_page = self.client.get("/api/v1/scores/?instrument=Piano&page=2")

        self.assertEqual(first_page.status_code, 200)
        self.assertEqual(first_page.json()["total_count"], 11)
        self.assertEqual(len(first_page.json()["scores"]), 10)
        self.assertTrue(first_page.json()["has_next"])
        self.assertEqual(second_page.json()["page"], 2)
        self.assertEqual(len(second_page.json()["scores"]), 1)
        self.assertFalse(second_page.json()["has_next"])
        self.assertTrue(second_page.json()["has_previous"])
        self.assertTrue(
            all(score["instrument"] == "Piano" for score in first_page.json()["scores"])
        )

    def test_feed_can_filter_to_current_users_own_scores(self):
        own_score = Score.objects.create(
            owner=self.user,
            title="My score",
            instrument="Piano",
            description="My recent score.",
            score_format=Score.Format.TEXT,
            content="C D E F",
        )
        other_user = User.objects.create_user(
            email="other-composer@example.com",
            name="Other Composer",
            password="test-password",
        )
        Score.objects.create(
            owner=other_user,
            title="Other score",
            instrument="Piano",
            description="Another score.",
            score_format=Score.Format.TEXT,
            content="G A B C",
        )

        response = self.client.get("/api/v1/scores/?mine=1")
        body = response.json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(body["total_count"], 1)
        self.assertEqual([score["id"] for score in body["scores"]], [own_score.pk])
        self.assertTrue(body["scores"][0]["is_owner"])

    def test_feed_rejects_invalid_page(self):
        response = self.client.get("/api/v1/scores/?page=invalid")

        self.assertEqual(response.status_code, 400)

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
            "/api/v1/scores/",
            data=json.dumps(self.text_payload()),
            content_type="application/json",
        )
        feed_response = anonymous_client.get("/api/v1/scores/")

        self.assertEqual(publish_response.status_code, 401)
        self.assertEqual(feed_response.status_code, 401)
        self.assertEqual(Score.objects.count(), 0)

    def test_publication_requires_csrf(self):
        client_without_csrf = Client(enforce_csrf_checks=True)
        client_without_csrf.force_login(self.user)
        response = client_without_csrf.post(
            "/api/v1/scores/",
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

    def test_authenticated_user_can_read_score_detail(self):
        response = self.client.get(f"/api/v1/scores/{self.score.pk}/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["score"]["id"], self.score.pk)
        self.assertEqual(response.json()["score"]["title"], "Original Title")

    def test_score_detail_is_available_to_other_authenticated_users(self):
        other_client = Client()
        other_client.force_login(self.other_user)

        response = other_client.get(f"/api/v1/scores/{self.score.pk}/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["score"]["author_id"], self.author.pk)

    def test_score_detail_requires_authentication(self):
        response = Client().get(f"/api/v1/scores/{self.score.pk}/")

        self.assertEqual(response.status_code, 401)

    def test_score_detail_nonexistent_returns_404(self):
        response = self.client.get("/api/v1/scores/99999/")

        self.assertEqual(response.status_code, 404)

    def test_edit_reflects_in_feed(self):
        self.patch_score(self.score.pk, {"title": "Feed Title"})
        feed = self.client.get("/api/v1/scores/").json()["scores"]
        self.assertEqual(feed[0]["title"], "Feed Title")

    def test_non_author_cannot_edit(self):
        other_client = Client(enforce_csrf_checks=True)
        other_client.force_login(self.other_user)
        other_csrf = other_client.get("/api/v1/csrf/").json()["csrfToken"]
        response = other_client.patch(
            f"/api/v1/scores/{self.score.pk}/",
            data=json.dumps({"title": "Hijacked"}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=other_csrf,
        )
        self.assertEqual(response.status_code, 403)
        self.score.refresh_from_db()
        self.assertEqual(self.score.title, "Original Title")

    def test_edit_requires_authentication(self):
        anon = Client(enforce_csrf_checks=True)
        anon_csrf = anon.get("/api/v1/csrf/").json()["csrfToken"]
        response = anon.patch(
            f"/api/v1/scores/{self.score.pk}/",
            data=json.dumps({"title": "Anon"}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=anon_csrf,
        )
        self.assertEqual(response.status_code, 401)

    def test_edit_requires_csrf(self):
        client_no_csrf = Client(enforce_csrf_checks=True)
        client_no_csrf.force_login(self.author)
        response = client_no_csrf.patch(
            f"/api/v1/scores/{self.score.pk}/",
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

    def test_patch_validates_format_and_content(self):
        response = self.patch_score(
            self.score.pk,
            {"format": "ABC", "content": "not an ABC score"},
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("content", response.json()["errors"])
        self.score.refresh_from_db()
        self.assertEqual(self.score.score_format, Score.Format.TEXT)

    def test_patch_can_update_format_and_content(self):
        response = self.patch_score(
            self.score.pk,
            {"format": "TEXT", "content": "D E F G"},
        )

        self.assertEqual(response.status_code, 200)
        self.score.refresh_from_db()
        self.assertEqual(self.score.content, "D E F G")


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
        self.csrf_token = self.client.get("/api/v1/csrf/").json()["csrfToken"]
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
            f"/api/v1/scores/{score_id}/",
            content_type="application/json",
            HTTP_X_CSRFTOKEN=self.csrf_token,
        )

    def test_author_can_delete_own_score(self):
        response = self.delete_score(self.score.pk)
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Score.objects.count(), 0)

    def test_delete_204_response_has_no_body(self):
        request = RequestFactory().delete(f"/api/v1/scores/{self.score.pk}/")
        request.user = self.author
        response = score_detail_view(request, self.score.pk)

        self.assertEqual(response.status_code, 204)
        self.assertEqual(response.content, b"")

    def test_deleted_score_absent_from_feed(self):
        self.delete_score(self.score.pk)
        feed = self.client.get("/api/v1/scores/").json()["scores"]
        self.assertEqual(feed, [])

    def test_non_author_cannot_delete(self):
        other_client = Client(enforce_csrf_checks=True)
        other_client.force_login(self.other_user)
        other_csrf = other_client.get("/api/v1/csrf/").json()["csrfToken"]
        response = other_client.delete(
            f"/api/v1/scores/{self.score.pk}/",
            content_type="application/json",
            HTTP_X_CSRFTOKEN=other_csrf,
        )
        self.assertEqual(response.status_code, 403)
        self.assertEqual(Score.objects.count(), 1)

    def test_delete_requires_authentication(self):
        anon = Client(enforce_csrf_checks=True)
        anon_csrf = anon.get("/api/v1/csrf/").json()["csrfToken"]
        response = anon.delete(
            f"/api/v1/scores/{self.score.pk}/",
            content_type="application/json",
            HTTP_X_CSRFTOKEN=anon_csrf,
        )
        self.assertEqual(response.status_code, 401)
        self.assertEqual(Score.objects.count(), 1)

    def test_delete_requires_csrf(self):
        client_no_csrf = Client(enforce_csrf_checks=True)
        client_no_csrf.force_login(self.author)
        response = client_no_csrf.delete(
            f"/api/v1/scores/{self.score.pk}/",
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
        self.csrf_token = self.client.get("/api/v1/csrf/").json()["csrfToken"]
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
            f"/api/v1/scores/{sid}/reactions/",
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
        feed = self.client.get("/api/v1/scores/").json()["scores"]
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

    def test_author_can_react_to_own_score(self):
        author_client = Client(enforce_csrf_checks=True)
        author_client.force_login(self.author)
        author_csrf = author_client.get("/api/v1/csrf/").json()["csrfToken"]
        response = author_client.post(
            f"/api/v1/scores/{self.score.pk}/reactions/",
            content_type="application/json",
            HTTP_X_CSRFTOKEN=author_csrf,
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Reaction.objects.count(), 1)

    def test_reaction_requires_authentication(self):
        anon = Client()
        response = anon.post(
            f"/api/v1/scores/{self.score.pk}/reactions/",
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 401)

    def test_reaction_requires_csrf(self):
        client_no_csrf = Client(enforce_csrf_checks=True)
        client_no_csrf.force_login(self.reactor)
        response = client_no_csrf.post(
            f"/api/v1/scores/{self.score.pk}/reactions/",
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
        other_csrf = other_client.get("/api/v1/csrf/").json()["csrfToken"]
        other_client.post(
            f"/api/v1/scores/{self.score.pk}/reactions/",
            content_type="application/json",
            HTTP_X_CSRFTOKEN=other_csrf,
        )
        feed = self.client.get("/api/v1/scores/").json()["scores"]
        self.assertEqual(feed[0]["reaction_count"], 2)

    def test_reaction_count_zero_by_default(self):
        feed = self.client.get("/api/v1/scores/").json()["scores"]
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
        response = self.client.get(f"/api/v1/scores/{self.score.pk}/comments/")
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
            f"/api/v1/scores/{self.score.pk}/comments/",
            data=json.dumps({"body": "Hello"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 401)

    def test_comment_requires_csrf(self):
        client_no_csrf = Client(enforce_csrf_checks=True)
        client_no_csrf.force_login(self.commenter)
        response = client_no_csrf.post(
            f"/api/v1/scores/{self.score.pk}/comments/",
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

    def test_delete_204_response_has_no_body(self):
        comment = Comment.objects.create(
            score=self.score,
            author=self.commenter,
            body="Great score!",
        )
        request = RequestFactory().delete(
            f"/api/v1/scores/{self.score.pk}/comments/{comment.pk}/"
        )
        request.user = self.commenter
        response = score_comment_detail_view(request, self.score.pk, comment.pk)

        self.assertEqual(response.status_code, 204)
        self.assertEqual(response.content, b"")

    def test_non_author_cannot_delete_comment(self):
        self.post_comment()
        comment = Comment.objects.first()
        other_client = Client(enforce_csrf_checks=True)
        other_client.force_login(self.other_commenter)
        other_csrf = other_client.get("/api/v1/csrf/").json()["csrfToken"]
        response = other_client.delete(
            f"/api/v1/scores/{self.score.pk}/comments/{comment.pk}/",
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
            f"/api/v1/scores/{self.score.pk}/comments/{comment.pk}/",
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 403)
        self.assertEqual(Comment.objects.count(), 1)

    def test_comment_cascade_delete_with_score(self):
        self.post_comment()
        self.score.delete()
        self.assertEqual(Comment.objects.count(), 0)
class ScoreRelationshipIntegrityTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            email="owner@example.com",
            name="Score Owner",
            password="correct-horse",
        )
        self.author = User.objects.create_user(
            email="author@example.com",
            name="Comment Author",
            password="correct-horse",
        )
        self.score = Score.objects.create(
            owner=self.owner,
            title="Morning Theme",
            instrument="Piano",
            description="A short theme.",
            score_format=Score.Format.TEXT,
            content="C D E F",
        )

    def test_like_is_unique_per_user_and_score(self):
        Like.objects.create(score=self.score, user=self.author)

        with self.assertRaises(IntegrityError):
            Like.objects.create(score=self.score, user=self.author)

    def test_deleting_score_cascades_comments_and_likes(self):
        Comment.objects.create(score=self.score, author=self.author, body="Nice theme.")
        Like.objects.create(score=self.score, user=self.author)

        self.score.delete()

        self.assertEqual(Comment.objects.count(), 0)
        self.assertEqual(Like.objects.count(), 0)


class ScoreCommunityApiTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            email="api-owner@example.com",
            name="API Owner",
            password="correct-horse",
        )
        self.visitor = User.objects.create_user(
            email="api-visitor@example.com",
            name="API Visitor",
            password="correct-horse",
        )
        self.owner_client = Client(enforce_csrf_checks=True)
        self.owner_client.force_login(self.owner)
        self.owner_csrf = self.owner_client.get("/api/csrf/").json()["csrfToken"]
        self.visitor_client = Client(enforce_csrf_checks=True)
        self.visitor_client.force_login(self.visitor)
        self.visitor_csrf = self.visitor_client.get("/api/csrf/").json()["csrfToken"]
        self.score = Score.objects.create(
            owner=self.owner,
            title="Community Theme",
            instrument="Piano",
            description="A community score.",
            score_format=Score.Format.TEXT,
            content="C D E F",
        )

    @staticmethod
    def score_payload(**changes):
        payload = {
            "title": "Updated Theme",
            "instrument": "Violin",
            "description": "Updated description.",
            "format": "TEXT",
            "content": "G A B c",
        }
        payload.update(changes)
        return payload

    def request_json(self, client, method, path, payload, csrf_token):
        return client.generic(
            method,
            path,
            data=json.dumps(payload),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

    def test_detail_returns_comments_and_like_state(self):
        Comment.objects.create(score=self.score, author=self.visitor, body="Great theme.")

        response = self.visitor_client.get(f"/api/scores/{self.score.pk}/")

        self.assertEqual(response.status_code, 200)
        body = response.json()["score"]
        self.assertEqual(body["comment_count"], 1)
        self.assertEqual(body["comments"][0]["body"], "Great theme.")
        self.assertFalse(body["is_liked"])

    def test_visitor_and_owner_can_toggle_like(self):
        like_response = self.visitor_client.put(
            f"/api/scores/{self.score.pk}/like/",
            HTTP_X_CSRFTOKEN=self.visitor_csrf,
        )
        repeat_response = self.visitor_client.put(
            f"/api/scores/{self.score.pk}/like/",
            HTTP_X_CSRFTOKEN=self.visitor_csrf,
        )
        remove_response = self.visitor_client.delete(
            f"/api/scores/{self.score.pk}/like/",
            HTTP_X_CSRFTOKEN=self.visitor_csrf,
        )
        owner_response = self.owner_client.put(
            f"/api/scores/{self.score.pk}/like/",
            HTTP_X_CSRFTOKEN=self.owner_csrf,
        )

        self.assertEqual(like_response.status_code, 200)
        self.assertEqual(repeat_response.json()["like_count"], 1)
        self.assertEqual(remove_response.json()["like_count"], 0)
        self.assertEqual(owner_response.status_code, 200)

    def test_visitor_can_comment_and_delete_own_comment_but_not_owner_comment(self):
        create_response = self.request_json(
            self.visitor_client,
            "POST",
            f"/api/scores/{self.score.pk}/comments/",
            {"body": "Useful feedback."},
            self.visitor_csrf,
        )
        comment_id = create_response.json()["comment"]["id"]
        delete_response = self.visitor_client.delete(
            f"/api/comments/{comment_id}/",
            HTTP_X_CSRFTOKEN=self.visitor_csrf,
        )
        owner_comment = Comment.objects.create(
            score=self.score,
            author=self.owner,
            body="Owner comment.",
        )
        denied_response = self.visitor_client.delete(
            f"/api/comments/{owner_comment.pk}/",
            HTTP_X_CSRFTOKEN=self.visitor_csrf,
        )

        self.assertEqual(create_response.status_code, 201)
        self.assertEqual(delete_response.status_code, 200)
        self.assertEqual(denied_response.status_code, 403)

    def test_only_owner_can_update_or_delete_score(self):
        denied_update = self.request_json(
            self.visitor_client,
            "PATCH",
            f"/api/scores/{self.score.pk}/",
            self.score_payload(),
            self.visitor_csrf,
        )
        owner_update = self.request_json(
            self.owner_client,
            "PATCH",
            f"/api/scores/{self.score.pk}/",
            self.score_payload(),
            self.owner_csrf,
        )
        denied_delete = self.visitor_client.delete(
            f"/api/scores/{self.score.pk}/",
            HTTP_X_CSRFTOKEN=self.visitor_csrf,
        )

        self.assertEqual(denied_update.status_code, 403)
        self.assertEqual(owner_update.status_code, 200)
        self.assertEqual(owner_update.json()["score"]["instrument"], "Violin")
        self.assertEqual(denied_delete.status_code, 403)

    def test_feed_filters_by_instrument_and_paginates(self):
        Score.objects.bulk_create([
            Score(
                owner=self.owner,
                title=f"Piano {index}",
                instrument="Piano",
                description="A score.",
                score_format=Score.Format.TEXT,
                content="C D E F",
            )
            for index in range(10)
        ])

        response = self.visitor_client.get("/api/scores/?instrument=Piano&page=2")

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["page"], 2)
        self.assertEqual(body["page_size"], 10)
        self.assertEqual(body["total_pages"], 2)
        self.assertTrue(all(score["instrument"] == "Piano" for score in body["scores"]))


class ScoreFeedQueryCountTests(TestCase):
    """El feed no debe hacer más consultas a medida que crece el número de partituras."""

    def setUp(self):
        self.client = Client()
        self.viewer = User.objects.create_user(
            email="viewer@example.com", name="Viewer", password="correct-horse"
        )
        self.author = User.objects.create_user(
            email="author@example.com", name="Author", password="correct-horse"
        )
        self.client.force_login(self.viewer)

    def add_scores(self, count):
        for index in range(count):
            score = Score.objects.create(
                owner=self.author,
                title=f"Score {Score.objects.count()}-{index}",
                instrument="Piano",
                description="Practice theme",
                score_format=Score.Format.TEXT,
                content="C D E F",
            )
            Reaction.objects.create(score=score, user=self.viewer)
            Like.objects.create(score=score, user=self.viewer)
            Comment.objects.create(score=score, author=self.author, body="Nice")

    def feed_query_count(self):
        with CaptureQueriesContext(connection) as queries:
            response = self.client.get("/api/v1/scores/")
        self.assertEqual(response.status_code, 200)
        return len(queries)

    def test_feed_query_count_does_not_grow_with_scores(self):
        self.add_scores(2)
        queries_with_few = self.feed_query_count()
        self.add_scores(8)
        queries_with_many = self.feed_query_count()

        self.assertEqual(queries_with_few, queries_with_many)

    def test_feed_reports_counts_and_current_user_state(self):
        self.add_scores(1)
        other = User.objects.create_user(
            email="other@example.com", name="Other", password="correct-horse"
        )
        score = Score.objects.get()
        Reaction.objects.create(score=score, user=other)
        Comment.objects.create(score=score, author=other, body="Second")

        data = self.client.get("/api/v1/scores/").json()["scores"][0]

        self.assertEqual(data["reaction_count"], 2)
        self.assertTrue(data["user_reacted"])
        self.assertEqual(data["like_count"], 1)
        self.assertTrue(data["is_liked"])
        self.assertEqual(data["comment_count"], 2)

    def test_detail_reports_counts_and_current_user_state(self):
        self.add_scores(1)
        score = Score.objects.get()

        data = self.client.get(f"/api/v1/scores/{score.pk}/").json()["score"]

        self.assertEqual(data["reaction_count"], 1)
        self.assertTrue(data["user_reacted"])
        self.assertEqual(data["comment_count"], 1)
        self.assertEqual(len(data["comments"]), 1)
