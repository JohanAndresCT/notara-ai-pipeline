import json

from django.contrib.sessions.models import Session
from django.test import Client, TestCase

from .models import User


class RegistrationTests(TestCase):
    def setUp(self):
        self.client = Client(enforce_csrf_checks=True)
        csrf_response = self.client.get("/api/csrf/")
        self.csrf_token = csrf_response.json()["csrfToken"]

    def register(self, payload):
        return self.client.post(
            "/api/auth/register/",
            data=json.dumps(payload),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=self.csrf_token,
        )

    def valid_payload(self, **overrides):
        payload = {
            "name": "Ada Lovelace",
            "email": "ada@example.com",
            "password": "correct-horse",
        }
        payload.update(overrides)
        return payload

    def test_success_creates_hashed_user_and_authenticated_session(self):
        response = self.register(self.valid_payload())

        self.assertEqual(response.status_code, 201)
        user = User.objects.get(email="ada@example.com")
        self.assertEqual(user.name, "Ada Lovelace")
        self.assertTrue(user.check_password("correct-horse"))
        self.assertNotEqual(user.password, "correct-horse")
        self.assertNotIn("password", response.json())

        current_user = self.client.get("/api/me/")
        self.assertEqual(current_user.status_code, 200)
        self.assertEqual(current_user.json()["user"]["email"], user.email)

    def test_duplicate_email_is_rejected_case_insensitively(self):
        User.objects.create_user(
            email="ada@example.com",
            name="Existing User",
            password="correct-horse",
        )

        response = self.register(self.valid_payload(email=" ADA@EXAMPLE.COM "))

        self.assertEqual(response.status_code, 400)
        self.assertIn("already exists", response.json()["errors"]["email"][0])
        self.assertEqual(User.objects.count(), 1)

    def test_required_fields_are_rejected_without_creating_user(self):
        cases = [
            ("name", ""),
            ("email", ""),
            ("password", ""),
        ]
        for field, value in cases:
            with self.subTest(field=field):
                response = self.register(self.valid_payload(**{field: value}))
                self.assertEqual(response.status_code, 400)
                self.assertIn(field, response.json()["errors"])
                self.assertEqual(User.objects.count(), 0)

    def test_invalid_email_is_rejected(self):
        response = self.register(self.valid_payload(email="not-an-email"))

        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.json()["errors"])
        self.assertEqual(User.objects.count(), 0)

    def test_password_shorter_than_eight_characters_is_rejected(self):
        response = self.register(self.valid_payload(password="1234567"))

        self.assertEqual(response.status_code, 400)
        self.assertIn("password", response.json()["errors"])
        self.assertEqual(User.objects.count(), 0)

    def test_eight_character_password_is_accepted(self):
        response = self.register(self.valid_payload(password="12345678"))

        self.assertEqual(response.status_code, 201)
        self.assertTrue(User.objects.get().check_password("12345678"))

    def test_registration_requires_csrf_token(self):
        client_without_csrf = Client(enforce_csrf_checks=True)
        response = client_without_csrf.post(
            "/api/auth/register/",
            data=json.dumps(self.valid_payload()),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(User.objects.count(), 0)

    def test_authenticated_home_api_rejects_anonymous_visitor(self):
        client = Client()
        response = client.get("/api/me/")

        self.assertEqual(response.status_code, 401)


class AuthenticationTests(TestCase):
    def setUp(self):
        self.client = Client(enforce_csrf_checks=True)
        self.user = User.objects.create_user(
            email="login@example.com",
            name="Login User",
            password="correct-horse",
        )
        csrf_response = self.client.get("/api/csrf/")
        self.csrf_token = csrf_response.json()["csrfToken"]

    def post_json(self, path, payload=None, client=None):
        return (client or self.client).post(
            path,
            data=json.dumps(payload or {}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=self.csrf_token,
        )

    def test_valid_login_establishes_session_for_existing_user(self):
        response = self.post_json(
            "/api/auth/login/",
            {"email": "LOGIN@example.com", "password": "correct-horse"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["user"]["email"], self.user.email)
        self.assertEqual(self.client.get("/api/me/").status_code, 200)

    def test_wrong_password_and_unknown_email_have_same_generic_error(self):
        wrong_password = self.post_json(
            "/api/auth/login/",
            {"email": self.user.email, "password": "incorrect-password"},
        )
        unknown_email = self.post_json(
            "/api/auth/login/",
            {"email": "unknown@example.com", "password": "incorrect-password"},
        )

        self.assertEqual(wrong_password.status_code, 400)
        self.assertEqual(unknown_email.status_code, 400)
        self.assertEqual(wrong_password.json(), unknown_email.json())
        self.assertEqual(self.client.get("/api/me/").status_code, 401)

    def test_logout_invalidates_session_and_protected_access(self):
        self.client.force_login(self.user)
        session_key = self.client.session.session_key
        self.assertIsNotNone(session_key)

        response = self.post_json("/api/auth/logout/")

        self.assertEqual(response.status_code, 200)
        self.assertFalse(Session.objects.filter(session_key=session_key).exists())
        self.assertEqual(self.client.get("/api/me/").status_code, 401)

    def test_login_and_logout_require_csrf(self):
        client_without_csrf = Client(enforce_csrf_checks=True)
        login_response = client_without_csrf.post(
            "/api/auth/login/",
            data=json.dumps({"email": self.user.email, "password": "correct-horse"}),
            content_type="application/json",
        )
        self.assertEqual(login_response.status_code, 403)
        self.assertEqual(client_without_csrf.get("/api/me/").status_code, 401)

        client_without_csrf.force_login(self.user)
        logout_response = client_without_csrf.post("/api/auth/logout/")
        self.assertEqual(logout_response.status_code, 403)
        self.assertEqual(client_without_csrf.get("/api/me/").status_code, 200)
