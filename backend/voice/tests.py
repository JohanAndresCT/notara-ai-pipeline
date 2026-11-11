import io
import json
import tempfile
import unittest
import wave
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

from django.db import close_old_connections, connection
from django.test import Client, TestCase, TransactionTestCase, override_settings
from django.core.files.uploadedfile import SimpleUploadedFile

from accounts.models import User

from .dictation import Uninterpretable, compose_document, parse
from .inference import inference_slot
from .model_manifest import build_manifest, verify_manifest
from .model_config import MODEL_FILES, MODEL_REVISION
from .models import STTInferenceQuota
from .adapters import FasterWhisperSttAdapter

STT_URL = "/api/v1/audio/stt/"


def wav_bytes(duration_seconds=0.1):
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as audio:
        audio.setnchannels(1)
        audio.setsampwidth(2)
        audio.setframerate(8000)
        audio.writeframes(b"\0\0" * int(8000 * duration_seconds))
    return buffer.getvalue()


def uploaded_wav(contents=None, content_type="audio/wav"):
    return SimpleUploadedFile(
        "dictation.wav",
        wav_bytes() if contents is None else contents,
        content_type=content_type,
    )


class FakeSttAdapter:
    def __init__(self, transcript="Compás cuatro cuartos, Do negra, Re corchea, Mi corchea"):
        self.transcript = transcript
        self.calls = 0

    def transcribe(self, audio_file, prompt=None, fallback=True):
        self.calls += 1
        self.prompt = prompt
        self.fallback = fallback
        return self.transcript


class FailingSttAdapter:
    def transcribe(self, audio_file, prompt=None, fallback=True):
        raise RuntimeError("model error")


class FakeWhisperModel:
    def __init__(self):
        self.language = None

    def transcribe(self, audio_file, language, **options):
        self.language = language
        self.options = options
        return [
            SimpleNamespace(text="Compás cuatro"),
            SimpleNamespace(text="cuartos"),
        ], None


class DictationParserTests(TestCase):
    def test_parses_approved_notes_meter_and_bar(self):
        result = parse(
            "Compás cuatro cuartos, Do negra, Re corchea, "
            "Mi corchea, barra, Fa sostenido semicorchea, silencio de blanca"
        )

        self.assertEqual(result.meter, "4/4")
        self.assertEqual(result.abc_line, "C D/2 E/2 | ^F/4 z2")

    def test_defaults_meter_and_composes_empty_field_document(self):
        result = parse("Do negra, Re corchea")

        self.assertEqual(result.meter, "4/4")
        self.assertEqual(
            compose_document(result, "Tema de prueba"),
            "X:1\nT:Tema de prueba\nM:4/4\nL:1/4\nK:C\nC D/2",
        )


    def test_preserves_explicit_figures(self):
        result = parse("Do blanca, Re negra, Mi corchea")
        self.assertEqual(result.abc_line, "C2 D E/2")

    def test_defaults_notes_without_figure_to_quarter_notes(self):
        result = parse("Do, re, mi, fa, sol, la, si")
        self.assertEqual(result.abc_line, "C D E F G A B")

    def test_rejects_words_outside_the_closed_vocabulary(self):
        with self.assertRaises(Uninterpretable):
            parse("Do negra, guitarra")

    def test_rejects_dotted_note_vocabulary(self):
        with self.assertRaises(Uninterpretable):
            parse("Do negra con puntillo")


class ModelManifestTests(TestCase):
    def test_committed_manifest_is_for_the_pinned_multilingual_base_model(self):
        manifest_path = Path(__file__).with_name("model_sha256.json")
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))

        self.assertEqual(manifest["repository"], "Systran/faster-whisper-base")
        self.assertEqual(manifest["revision"], MODEL_REVISION)
        self.assertEqual(set(manifest["files"]), set(MODEL_FILES))
        for expected in manifest["files"].values():
            self.assertRegex(expected["sha256"], r"^[0-9a-f]{64}$")
            self.assertGreater(expected["size_bytes"], 0)

    def test_manifest_binds_full_revision_and_all_model_file_hashes(self):
        with tempfile.TemporaryDirectory() as temporary_directory:
            model_path = Path(temporary_directory) / "model"
            model_path.mkdir()
            for filename in MODEL_FILES:
                (model_path / filename).write_bytes(filename.encode())
            model_file = model_path / MODEL_FILES[0]
            manifest = build_manifest(model_path, MODEL_REVISION)
            manifest_path = Path(temporary_directory) / "model.manifest.json"
            manifest_path.write_text(json.dumps(manifest), encoding="utf-8")

            self.assertEqual(
                manifest["repository"],
                "Systran/faster-whisper-base",
            )
            verify_manifest(model_path, manifest_path, MODEL_REVISION)
            model_file.write_bytes(b"x" * model_file.stat().st_size)
            with self.assertRaisesRegex(ValueError, "SHA-256 mismatch"):
                verify_manifest(model_path, manifest_path, MODEL_REVISION)


@unittest.skipUnless(
    connection.vendor == "postgresql",
    "Concurrent reservation requires the PostgreSQL CI database.",
)
class QuotaConcurrencyTests(TransactionTestCase):
    def test_simultaneous_requests_cannot_exceed_the_daily_limit(self):
        from concurrent.futures import ThreadPoolExecutor

        user = User.objects.create_user(
            email="quota@example.com",
            name="Quota User",
            password="correct-horse",
        )

        def reserve():
            close_old_connections()
            try:
                from .quota import reserve_daily_inference

                return reserve_daily_inference(user.pk, limit=3)
            finally:
                close_old_connections()

        with ThreadPoolExecutor(max_workers=8) as executor:
            admissions = list(executor.map(lambda _: reserve(), range(16)))

        self.assertEqual(sum(admissions), 3)
        self.assertEqual(
            STTInferenceQuota.objects.get(user=user).admitted_inferences,
            3,
        )


class FasterWhisperAdapterTests(TestCase):
    @override_settings(
        STT_MODEL_REVISION="a" * 40,
        STT_MODEL_MANIFEST="model.manifest.json",
    )
    def test_load_uses_verified_local_path_cpu_int8_and_configured_threads(self):
        adapter = FasterWhisperSttAdapter(Path("local-model"), cpu_threads=2)
        with (
            patch("voice.adapters.verify_manifest") as verify,
            patch("faster_whisper.WhisperModel") as whisper_model,
        ):
            adapter.load()

        verify.assert_called_once()
        whisper_model.assert_called_once_with(
            "local-model",
            device="cpu",
            compute_type="int8",
            cpu_threads=2,
        )

    def test_transcribe_requests_spanish_and_joins_segments(self):
        adapter = FasterWhisperSttAdapter(Path("local-model"), cpu_threads=2)
        fake_model = FakeWhisperModel()
        adapter.model = fake_model
        audio_file = io.BytesIO(b"audio")

        transcript = adapter.transcribe(audio_file)

        self.assertEqual(transcript, "Compás cuatro cuartos")
        self.assertEqual(fake_model.language, "es")
        self.assertEqual(audio_file.tell(), 0)
        self.assertEqual(fake_model.options, {})

    def test_dictation_options_disable_temperature_fallback(self):
        adapter = FasterWhisperSttAdapter(Path("local-model"), cpu_threads=2)
        fake_model = FakeWhisperModel()
        adapter.model = fake_model

        adapter.transcribe(io.BytesIO(b"audio"), prompt="Do negra", fallback=False)

        self.assertEqual(fake_model.options, {"initial_prompt": "Do negra", "temperature": 0.0})


class SttEndpointTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="stt@example.com",
            name="STT User",
            password="correct-horse",
        )
        self.client = Client(enforce_csrf_checks=True)
        self.client.force_login(self.user)
        self.csrf_token = self.client.get("/api/v1/csrf/").json()["csrfToken"]
        self.adapter = FakeSttAdapter()
        self.adapter_patch = patch("voice.views.get_stt_adapter", return_value=self.adapter)
        self.adapter_patch.start()
        self.addCleanup(self.adapter_patch.stop)
        # CR-006: no real AI calls in tests; individual tests install a fake normalizer.
        self.normalizer_patch = patch("voice.views.get_normalizer", return_value=None)
        self.normalizer_patch.start()
        self.addCleanup(self.normalizer_patch.stop)

    def post_audio(self, audio=None, **extra):
        data = {"audio": uploaded_wav() if audio is None else audio, **extra}
        return self.client.post(
            STT_URL,
            data=data,
            HTTP_X_CSRFTOKEN=self.csrf_token,
        )

    def test_success_matches_the_documented_response_contract(self):
        response = self.post_audio(title="Tema de prueba")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            set(response.json()),
            {"transcript", "meter", "abc_line", "abc_document", "ai_interpreted"},
        )
        self.assertEqual(response.json()["meter"], "4/4")
        self.assertEqual(response.json()["abc_line"], "C D/2 E/2")
        self.assertEqual(
            response.json()["abc_document"],
            "X:1\nT:Tema de prueba\nM:4/4\nL:1/4\nK:C\nC D/2 E/2",
        )
        self.assertEqual(self.adapter.calls, 1)
        self.assertIn("Do negra", self.adapter.prompt)  # vocabulary prompt for dictation
        self.assertFalse(self.adapter.fallback)  # DEC-240: no temperature fallback

    def test_requires_authentication_and_does_not_infer(self):
        anonymous = Client(enforce_csrf_checks=True)
        token = anonymous.get("/api/v1/csrf/").json()["csrfToken"]
        response = anonymous.post(
            STT_URL,
            data={"audio": uploaded_wav()},
            HTTP_X_CSRFTOKEN=token,
        )

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json()["code"], "AUTHENTICATION_REQUIRED")
        self.assertEqual(self.adapter.calls, 0)
        self.assertEqual(STTInferenceQuota.objects.count(), 0)

    def test_csrf_failure_is_typed_and_does_not_infer(self):
        response = self.client.post(STT_URL, data={"audio": uploaded_wav()})

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json()["code"], "CSRF_FAILED")
        self.assertEqual(self.adapter.calls, 0)
        self.assertEqual(STTInferenceQuota.objects.count(), 0)

    def test_rejects_audio_above_two_megabytes_without_inference(self):
        response = self.post_audio(
            uploaded_wav(contents=b"x" * (2 * 1024 * 1024 + 1))
        )

        self.assertEqual(response.status_code, 413)
        self.assertEqual(response.json()["code"], "AUDIO_TOO_LARGE")
        self.assertEqual(self.adapter.calls, 0)
        self.assertEqual(STTInferenceQuota.objects.count(), 0)

    def test_rejects_disallowed_mime_and_invalid_signature(self):
        bad_mime = self.post_audio(uploaded_wav(content_type="audio/mpeg"))
        bad_signature = self.post_audio(uploaded_wav(contents=b"not a wav"))

        self.assertEqual(bad_mime.status_code, 400)
        self.assertEqual(bad_mime.json()["code"], "AUDIO_INVALID")
        self.assertEqual(bad_signature.status_code, 400)
        self.assertEqual(bad_signature.json()["code"], "AUDIO_INVALID")
        self.assertEqual(self.adapter.calls, 0)
        self.assertEqual(STTInferenceQuota.objects.count(), 0)

    def test_rejects_audio_longer_than_thirty_seconds(self):
        response = self.post_audio(uploaded_wav(contents=wav_bytes(30.1)))

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["code"], "AUDIO_INVALID")
        self.assertEqual(self.adapter.calls, 0)
        self.assertEqual(STTInferenceQuota.objects.count(), 0)

    @override_settings(STT_DAILY_LIMIT=1)
    def test_daily_quota_blocks_second_request_before_inference(self):
        first = self.post_audio()
        second = self.post_audio()

        self.assertEqual(first.status_code, 200)
        self.assertEqual(second.status_code, 429)
        self.assertEqual(second.json()["code"], "STT_DAILY_LIMIT_REACHED")
        self.assertEqual(self.adapter.calls, 1)
        self.assertEqual(
            STTInferenceQuota.objects.get(user=self.user).admitted_inferences,
            1,
        )

    def test_uninterpretable_admitted_request_consumes_quota(self):
        self.adapter.transcript = "Do negra, palabra desconocida"

        response = self.post_audio()

        self.assertEqual(response.status_code, 422)
        self.assertEqual(response.json()["code"], "DICTATION_UNINTERPRETABLE")
        self.assertEqual(
            STTInferenceQuota.objects.get(user=self.user).admitted_inferences,
            1,
        )

    def test_saturated_process_returns_unavailable_without_quota_charge(self):
        self.assertTrue(inference_slot.acquire(blocking=False))
        try:
            response = self.post_audio()
        finally:
            inference_slot.release()

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json()["code"], "STT_UNAVAILABLE")
        self.assertEqual(STTInferenceQuota.objects.count(), 0)
        self.assertEqual(self.adapter.calls, 0)

    def test_model_failure_returns_unavailable_after_admission(self):
        with patch("voice.views.get_stt_adapter", return_value=FailingSttAdapter()):
            response = self.post_audio()

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json()["code"], "STT_UNAVAILABLE")
        self.assertEqual(
            STTInferenceQuota.objects.get(user=self.user).admitted_inferences,
            1,
        )

    def test_unconfigured_model_returns_unavailable_without_quota_charge(self):
        with patch("voice.views.get_stt_adapter", return_value=None):
            response = self.post_audio()

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json()["code"], "STT_UNAVAILABLE")
        self.assertEqual(STTInferenceQuota.objects.count(), 0)


class FakeNormalizer:
    def __init__(self, answer=None, error=None):
        self.answer = answer
        self.error = error
        self.calls = []

    def normalize(self, transcript):
        self.calls.append(transcript)
        if self.error:
            raise self.error
        return self.answer


class DictationAiTests(SttEndpointTests):
    """CR-006 / BR-032: Gemini interpretation of uninterpretable transcripts."""

    def use_normalizer(self, normalizer):
        self.normalizer_patch.stop()
        patcher = patch("voice.views.get_normalizer", return_value=normalizer)
        patcher.start()
        self.addCleanup(patcher.stop)
        return normalizer

    def test_misspelled_dictation_is_interpreted_with_ai(self):
        self.adapter.transcript = "Donegra, recorcea, mi corcea"
        normalizer = self.use_normalizer(FakeNormalizer("Do negra, Re corchea, Mi corchea"))
        response = self.post_audio()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["abc_line"], "C D/2 E/2")
        self.assertTrue(response.json()["ai_interpreted"])
        self.assertEqual(normalizer.calls, ["Donegra, recorcea, mi corcea"])

    def test_ai_not_called_when_parser_succeeds(self):
        normalizer = self.use_normalizer(FakeNormalizer("Sol negra"))
        response = self.post_audio()
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.json()["ai_interpreted"])
        self.assertEqual(normalizer.calls, [])

    def test_unintelligible_answer_keeps_m01(self):
        self.adapter.transcript = "hola qué tal"
        self.use_normalizer(FakeNormalizer(None))
        response = self.post_audio()
        self.assertEqual(response.status_code, 422)
        self.assertEqual(response.json()["code"], "DICTATION_UNINTERPRETABLE")

    def test_provider_failure_keeps_m01_without_server_error(self):
        from voice.normalizer import NormalizerError

        self.adapter.transcript = "Donegra"
        self.use_normalizer(FakeNormalizer(error=NormalizerError("HTTP 503")))
        with self.assertLogs("voice.views", level="WARNING"):
            response = self.post_audio()
        self.assertEqual(response.status_code, 422)

    def test_ai_cannot_add_notes(self):
        self.adapter.transcript = "Donegra"
        self.use_normalizer(FakeNormalizer("Do negra, Re negra, Mi negra"))
        with self.assertLogs("voice.views", level="WARNING"):
            response = self.post_audio()
        self.assertEqual(response.status_code, 422)

    def test_ai_output_still_validated_by_parser(self):
        self.adapter.transcript = "Donegra"
        self.use_normalizer(FakeNormalizer("Do negrísima"))
        response = self.post_audio()
        self.assertEqual(response.status_code, 422)
