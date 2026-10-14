import json
from io import BytesIO
from pathlib import Path
from tempfile import TemporaryDirectory

from PIL import Image
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.sessions.models import Session
from django.test import Client, TestCase, TransactionTestCase, override_settings
from django.test.client import BOUNDARY, MULTIPART_CONTENT, encode_multipart

from scores.models import Reaction, Score

from .models import User


class RegistrationTests(TestCase):
    def setUp(self):
        self.client = Client(enforce_csrf_checks=True)
        csrf_response = self.client.get("/api/v1/csrf/")
        self.csrf_token = csrf_response.json()["csrfToken"]

    def register(self, payload):
        return self.client.post(
            "/api/v1/auth/register/",
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
        self.assertEqual(user.username, "ada")
        self.assertTrue(user.check_password("correct-horse"))
        self.assertNotEqual(user.password, "correct-horse")
        self.assertNotIn("password", response.json())
        self.assertEqual(response.json()["user"]["username"], "ada")
        self.assertEqual(response.json()["user"]["description"], "")

        current_user = self.client.get("/api/v1/me/")
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
            "/api/v1/auth/register/",
            data=json.dumps(self.valid_payload()),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(User.objects.count(), 0)

    def test_authenticated_home_api_rejects_anonymous_visitor(self):
        client = Client()
        response = client.get("/api/v1/me/")

        self.assertEqual(response.status_code, 401)


class AuthenticationTests(TestCase):
    def setUp(self):
        self.client = Client(enforce_csrf_checks=True)
        self.user = User.objects.create_user(
            email="login@example.com",
            name="Login User",
            password="correct-horse",
        )
        csrf_response = self.client.get("/api/v1/csrf/")
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
            "/api/v1/auth/login/",
            {"email": "LOGIN@example.com", "password": "correct-horse"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["user"]["email"], self.user.email)
        self.assertEqual(self.client.get("/api/v1/me/").status_code, 200)

    def test_wrong_password_and_unknown_email_have_same_generic_error(self):
        wrong_password = self.post_json(
            "/api/v1/auth/login/",
            {"email": self.user.email, "password": "incorrect-password"},
        )
        unknown_email = self.post_json(
            "/api/v1/auth/login/",
            {"email": "unknown@example.com", "password": "incorrect-password"},
        )

        self.assertEqual(wrong_password.status_code, 400)
        self.assertEqual(unknown_email.status_code, 400)
        self.assertEqual(wrong_password.json(), unknown_email.json())
        self.assertEqual(self.client.get("/api/v1/me/").status_code, 401)

    def test_logout_invalidates_session_and_protected_access(self):
        self.client.force_login(self.user)
        session_key = self.client.session.session_key
        self.assertIsNotNone(session_key)

        response = self.post_json("/api/v1/auth/logout/")

        self.assertEqual(response.status_code, 200)
        self.assertFalse(Session.objects.filter(session_key=session_key).exists())
        self.assertEqual(self.client.get("/api/v1/me/").status_code, 401)

    def test_login_and_logout_require_csrf(self):
        client_without_csrf = Client(enforce_csrf_checks=True)
        login_response = client_without_csrf.post(
            "/api/v1/auth/login/",
            data=json.dumps({"email": self.user.email, "password": "correct-horse"}),
            content_type="application/json",
        )
        self.assertEqual(login_response.status_code, 403)
        self.assertEqual(client_without_csrf.get("/api/v1/me/").status_code, 401)

        client_without_csrf.force_login(self.user)
        logout_response = client_without_csrf.post("/api/v1/auth/logout/")
        self.assertEqual(logout_response.status_code, 403)
        self.assertEqual(client_without_csrf.get("/api/v1/me/").status_code, 200)


class ProfileManagementTests(TransactionTestCase):
    def setUp(self):
        self.media_dir = TemporaryDirectory()
        self.addCleanup(self.media_dir.cleanup)
        media_settings = override_settings(MEDIA_ROOT=self.media_dir.name)
        media_settings.enable()
        self.addCleanup(media_settings.disable)

        self.client = Client(enforce_csrf_checks=True)
        self.user = User.objects.create_user(
            email="profile@example.com",
            name="Profile User",
            password="correct-horse",
        )
        self.client.force_login(self.user)
        csrf_response = self.client.get("/api/v1/csrf/")
        self.csrf_token = csrf_response.json()["csrfToken"]

    @staticmethod
    def image_file(image_format="JPEG", name=None):
        stream = BytesIO()
        Image.new("RGB", (2, 2), color="green").save(stream, format=image_format)
        suffix = ".png" if image_format == "PNG" else ".jpg"
        content_type = "image/png" if image_format == "PNG" else "image/jpeg"
        return SimpleUploadedFile(
            name or f"profile{suffix}", stream.getvalue(), content_type=content_type
        )

    def patch_profile(self, data):
        return self.client.generic(
            "PATCH",
            "/api/v1/me/",
            data=encode_multipart(BOUNDARY, data),
            content_type=MULTIPART_CONTENT,
            HTTP_X_CSRFTOKEN=self.csrf_token,
        )

    def test_profile_returns_identity_fields_stats_and_legacy_photo_field(self):
        response = self.client.get("/api/v1/me/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["user"]["name"], "Profile User")
        self.assertEqual(response.json()["user"]["main_instrument"], "")
        self.assertEqual(response.json()["user"]["username"], "profile")
        self.assertEqual(response.json()["user"]["description"], "")
        self.assertEqual(response.json()["user"]["score_count"], 0)
        self.assertEqual(response.json()["user"]["likes_received"], 0)
        self.assertIsNone(response.json()["user"]["photo_url"])

    def test_profile_update_persists_username_description_and_allowed_instrument(self):
        response = self.client.patch(
            "/api/v1/me/",
            data=json.dumps({
                "username": "  Ada.Musica ",
                "name": "Ada Lovelace",
                "description": "Compositora y pianista.",
                "main_instrument": "Piano",
            }),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=self.csrf_token,
        )

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.username, "ada.musica")
        self.assertEqual(self.user.name, "Ada Lovelace")
        self.assertEqual(self.user.description, "Compositora y pianista.")
        self.assertEqual(self.user.main_instrument, "Piano")
        self.assertEqual(response.json()["user"]["username"], "ada.musica")

    def test_profile_stats_report_owned_scores_and_received_likes(self):
        another_user = User.objects.create_user(
            email="listener@example.com",
            name="Listener",
            password="correct-horse",
        )
        score = Score.objects.create(
            owner=self.user,
            title="A short melody",
            instrument="Piano",
            description="An idea",
            score_format=Score.Format.TEXT,
            content="C D E",
        )
        Reaction.objects.create(score=score, user=another_user)
        Reaction.objects.create(score=score, user=self.user)

        response = self.client.get("/api/v1/me/")

        self.assertEqual(response.json()["user"]["score_count"], 1)
        self.assertEqual(response.json()["user"]["likes_received"], 2)

    def test_duplicate_username_and_unlisted_instrument_are_rejected(self):
        User.objects.create_user(
            email="another@example.com",
            name="Another User",
            password="correct-horse",
            username="another",
        )
        response = self.client.patch(
            "/api/v1/me/",
            data=json.dumps({"username": "another", "main_instrument": "Cello"}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=self.csrf_token,
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("username", response.json()["errors"])
        self.assertIn("main_instrument", response.json()["errors"])
        self.user.refresh_from_db()
        self.assertEqual(self.user.username, "profile")
        self.assertEqual(self.user.main_instrument, "")

    def test_profile_update_persists_name_instrument_and_jpeg(self):
        response = self.patch_profile(
            {
                "name": "Updated Profile",
                "main_instrument": "Violín",
                "photo": self.image_file(),
            }
        )

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.name, "Updated Profile")
        self.assertEqual(self.user.main_instrument, "Violín")
        self.assertTrue(self.user.photo.name.endswith(".jpg"))
        self.assertIn("/api/v1/me/photo/", response.json()["user"]["photo_url"])
        self.assertEqual(self.client.get("/api/v1/me/").json()["user"]["name"], "Updated Profile")

    def test_png_photo_is_retrievable_only_through_authenticated_endpoint(self):
        response = self.patch_profile({"photo": self.image_file("PNG")})

        self.assertEqual(response.status_code, 200)
        photo_response = self.client.get("/api/v1/me/photo/")
        self.assertEqual(photo_response.status_code, 200)
        self.assertEqual(photo_response["Content-Type"], "image/png")
        self.assertEqual(photo_response["X-Content-Type-Options"], "nosniff")
        photo_bytes = b"".join(photo_response.streaming_content)
        photo_response.close()
        self.assertTrue(photo_bytes)
        self.assertEqual(Client().get("/api/v1/me/photo/").status_code, 401)

    def test_replacing_photo_removes_previous_file(self):
        first_response = self.patch_profile({"photo": self.image_file()})
        self.assertEqual(first_response.status_code, 200)
        self.user.refresh_from_db()
        previous_photo_path = self.user.photo.path
        self.assertTrue(Path(previous_photo_path).exists())

        replacement_response = self.patch_profile({"photo": self.image_file("PNG")})

        self.assertEqual(replacement_response.status_code, 200)
        self.assertFalse(Path(previous_photo_path).exists())
        self.user.refresh_from_db()
        self.assertTrue(self.user.photo.name.endswith(".png"))

    def test_invalid_photo_does_not_change_profile(self):
        response = self.patch_profile(
            {
                "name": "Must Not Save",
                "main_instrument": "Flauta",
                "photo": SimpleUploadedFile("bad.gif", b"not an image", content_type="image/gif"),
            }
        )

        self.assertEqual(response.status_code, 400)
        self.user.refresh_from_db()
        self.assertEqual(self.user.name, "Profile User")
        self.assertEqual(self.user.main_instrument, "")

    def test_malformed_image_bytes_are_rejected(self):
        response = self.patch_profile({
            "name": "Must Not Save",
            "photo": SimpleUploadedFile("bad.png", b"not an image", content_type="image/png"),
        })

        self.assertEqual(response.status_code, 400)
        self.user.refresh_from_db()
        self.assertEqual(self.user.name, "Profile User")

    @override_settings(PROFILE_PHOTO_MAX_BYTES=10)
    def test_over_limit_photo_is_rejected_without_profile_changes(self):
        response = self.patch_profile({
            "name": "Must Not Save",
            "photo": self.image_file(),
        })

        self.assertEqual(response.status_code, 400)
        self.user.refresh_from_db()
        self.assertEqual(self.user.name, "Profile User")

    def test_profile_and_photo_require_authentication(self):
        anonymous_client = Client()

        self.assertEqual(anonymous_client.get("/api/v1/me/").status_code, 401)
        self.assertEqual(anonymous_client.get("/api/v1/me/photo/").status_code, 401)
        self.assertEqual(
            anonymous_client.patch("/api/v1/me/", {"name": "Unauthorized"}).status_code,
            401,
        )

    def test_profile_and_password_mutations_require_csrf(self):
        client_without_csrf = Client(enforce_csrf_checks=True)
        client_without_csrf.force_login(self.user)
        profile_response = client_without_csrf.generic(
            "PATCH",
            "/api/v1/me/",
            data=encode_multipart(BOUNDARY, {"name": "No CSRF"}),
            content_type=MULTIPART_CONTENT,
        )
        password_response = client_without_csrf.post(
            "/api/v1/me/password/",
            data=json.dumps({"current_password": "correct-horse", "new_password": "new-secret-8"}),
            content_type="application/json",
        )

        self.assertEqual(profile_response.status_code, 403)
        self.assertEqual(password_response.status_code, 403)
        self.user.refresh_from_db()
        self.assertEqual(self.user.name, "Profile User")
        self.assertTrue(self.user.check_password("correct-horse"))

    def test_password_change_preserves_session_and_rejects_invalid_current_password(self):
        invalid_response = self.client.post(
            "/api/v1/me/password/",
            data=json.dumps({"current_password": "wrong", "new_password": "new-secret-8"}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=self.csrf_token,
        )
        self.assertEqual(invalid_response.status_code, 400)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("correct-horse"))

        short_password_response = self.client.post(
            "/api/v1/me/password/",
            data=json.dumps({"current_password": "correct-horse", "new_password": "short"}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=self.csrf_token,
        )
        self.assertEqual(short_password_response.status_code, 400)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("correct-horse"))

        valid_response = self.client.post(
            "/api/v1/me/password/",
            data=json.dumps(
                {"current_password": "correct-horse", "new_password": "new-secret-8"}
            ),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=self.csrf_token,
        )
        self.assertEqual(valid_response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("new-secret-8"))
        self.assertEqual(self.client.get("/api/v1/me/").status_code, 200)
