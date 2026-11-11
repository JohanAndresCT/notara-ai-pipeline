"""HU21 / CR-007 — conversational tutor endpoints (Gemini mocked, no network)."""

from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import Client, TestCase, override_settings

from scores.models import Score
from voice.models import TutorUsageQuota
from voice.tutor import TutorUnavailable, instruction

User = get_user_model()
ABC = "X:1\nT:Escala\nM:4/4\nL:1/4\nK:C\nC D E F | G A B c |]"


@override_settings(GEMINI_API_KEY="test-key", TUTOR_DAILY_SESSIONS=2, TUTOR_DAILY_QUESTIONS=2)
class TutorEndpointTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="tutor@example.com", name="Tutor User", password="correct-horse")
        self.score = Score.objects.create(
            owner=self.user, title="Escala", instrument="Piano", description="Práctica",
            score_format=Score.Format.ABC, content=ABC,
        )
        self.client = Client(enforce_csrf_checks=True)
        self.client.force_login(self.user)
        self.csrf = self.client.get("/api/v1/csrf/").json()["csrfToken"]

    def post(self, path, body=None):
        return self.client.post(path, data=body or {}, content_type="application/json", HTTP_X_CSRFTOKEN=self.csrf)

    def session_url(self, score_id=None):
        return f"/api/v1/scores/{score_id or self.score.pk}/tutor/session/"

    def ask_url(self):
        return f"/api/v1/scores/{self.score.pk}/tutor/ask/"

    def test_session_returns_locked_ephemeral_token_without_api_key(self):
        with patch("voice.tutor._post", return_value={"name": "auth_tokens/abc"}) as post:
            response = self.post(self.session_url())
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["token"], "auth_tokens/abc")
        self.assertIn("BidiGenerateContentConstrained", body["ws_url"])
        self.assertNotIn("test-key", response.content.decode())
        sent = post.call_args.args[1]
        self.assertEqual(sent["uses"], 1)
        setup = sent["bidiGenerateContentSetup"]
        self.assertEqual(setup["generationConfig"]["responseModalities"], ["AUDIO"])
        self.assertIn("Escala", setup["systemInstruction"]["parts"][0]["text"])

    def test_session_daily_limit(self):
        with patch("voice.tutor._post", return_value={"name": "auth_tokens/x"}):
            self.post(self.session_url())
            self.post(self.session_url())
            response = self.post(self.session_url())
        self.assertEqual(response.status_code, 429)
        self.assertEqual(response.json()["code"], "TUTOR_DAILY_LIMIT_REACHED")

    def test_provider_failure_returns_503_and_releases_quota(self):
        with patch("voice.tutor._post", side_effect=TutorUnavailable("HTTP 500")), \
                self.assertLogs("voice.tutor_views", level="WARNING"):
            response = self.post(self.session_url())
        self.assertEqual(response.status_code, 503)
        self.assertEqual(TutorUsageQuota.objects.get(user=self.user).sessions, 0)

    def test_requires_authentication_and_existing_score(self):
        anonymous = Client()
        self.assertEqual(anonymous.post(self.session_url()).status_code, 401)
        self.assertEqual(self.post(self.session_url(score_id=999999)).status_code, 404)

    def test_requires_csrf(self):
        client = Client(enforce_csrf_checks=True)
        client.force_login(self.user)
        self.assertEqual(client.post(self.session_url()).status_code, 403)

    def test_typed_question_answer(self):
        reply = {"candidates": [{"content": {"parts": [{"text": "Es una escala de Do mayor."}]}}]}
        with patch("voice.tutor._post", return_value=reply) as post:
            response = self.post(self.ask_url(), {"question": "¿Qué escala es?"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["answer"], "Es una escala de Do mayor.")
        self.assertEqual(post.call_args.args[1]["contents"][0]["parts"][0]["text"], "¿Qué escala es?")

    def test_typed_question_validation(self):
        self.assertEqual(self.post(self.ask_url(), {"question": "  "}).status_code, 400)
        self.assertEqual(self.post(self.ask_url(), {"question": "x" * 501}).status_code, 400)

    def test_plain_text_score_context(self):
        text_score = Score.objects.create(
            owner=self.user, title="Idea", instrument="Flauta", description="Texto",
            score_format=Score.Format.TEXT, content="do re mi fa",
        )
        prompt = instruction(text_score, spoken=True)
        self.assertIn("texto libre", prompt)
        self.assertIn("do re mi fa", prompt)
        self.assertIn("notación ABC", prompt)
