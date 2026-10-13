import json

from django.db import IntegrityError
from django.test import Client, TestCase

from accounts.models import User
from .models import Comment, Like, Score


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
