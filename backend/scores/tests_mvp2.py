"""MVP 2 listening and voice-comment tests (HU12-HU18). Fake engines only (DEC-230)."""

import tempfile
from fractions import Fraction
from unittest.mock import patch

from django.core.files.storage import default_storage
from django.test import Client, TestCase, override_settings

from accounts.models import User
from voice.models import STTInferenceQuota, SynthesizedAudio, VoiceSynthesisQuota
from voice.tests import FakeSttAdapter, uploaded_wav
from voice.tts import EdgeTtsAdapter, ElevenLabsTtsAdapter, TtsProviderError

from .abc_reader import (
    UnsupportedAbc,
    estimated_difficulty,
    playback_data,
    read_abc,
    solfege_text,
    tutor_text,
)
from .models import Comment, Score

ABC_SCALE = "X:1\nT:Escala\nM:4/4\nL:1/4\nK:G\nQ:1/4=90\nG A B c | d e f g |]"
ABC_CHORD = "X:1\nT:Acorde\nM:4/4\nL:1/4\nK:C\n[CEG] c"
MEDIA = tempfile.mkdtemp(prefix="notara-test-media-")


class AbcReaderTests(TestCase):
    def test_reads_events_key_signature_and_tempo(self):
        reading = read_abc(ABC_SCALE)
        self.assertEqual(reading.meter, (4, 4))
        self.assertEqual(reading.tempo_bpm, 90)
        self.assertEqual(reading.key_name, "Sol mayor")
        self.assertEqual(reading.clef, "Sol")
        self.assertEqual(len(reading.notes), 8)
        self.assertEqual(reading.notes[0].midi, 67)
        self.assertEqual(reading.notes[6].midi, 78)  # f is F sharp in G major
        self.assertEqual(reading.notes[1].start, Fraction(1))

    def test_bar_accidentals_reset_and_rests(self):
        reading = read_abc("X:1\nT:t\nM:4/4\nL:1/8\nK:C\n^F F z2 | F")
        midis = [event.midi for event in reading.events]
        self.assertEqual(midis, [66, 66, None, 65])
        self.assertEqual(reading.events[2].duration, Fraction(1))

    def test_unsupported_constructs(self):
        for content in (ABC_CHORD, "X:1\nT:t\nM:4/4\nL:1/4\nK:C\n(3CDE", "X:1\nT:t\nM:4/4\nL:1/4\nK:C\nC-C", "X:1\nT:t\nM:4/4\nL:1/4\nK:C\n{g}C"):
            with self.subTest(content=content), self.assertRaises(UnsupportedAbc):
                read_abc(content)

    def test_playback_reasons(self):
        self.assertEqual(playback_data("hola", "TEXT")["reason"], "NOT_ABC")
        self.assertEqual(playback_data(ABC_CHORD, "ABC")["reason"], "UNSUPPORTED_ELEMENTS")
        data = playback_data(ABC_SCALE, "ABC")
        self.assertTrue(data["playable"])
        self.assertEqual(data["tempo_bpm"], 90)
        self.assertEqual(data["events"][0], {"midi": 67, "start": 0.0, "duration": 1.0})

    def test_solfege_text_names_and_pauses(self):
        reading = read_abc(ABC_SCALE)
        plain = solfege_text(reading, with_pauses=False)
        self.assertTrue(plain.startswith("Sol, La, Si, Do"))
        self.assertIn("Fa sostenido", plain)
        self.assertIn('<break time="', solfege_text(reading, with_pauses=True))

    def test_difficulty_and_tutor_text(self):
        self.assertEqual(estimated_difficulty(read_abc(ABC_SCALE)), "baja")
        hard = "X:1\nT:t\nM:4/4\nL:1/16\nK:C\n" + " ".join(["^c _B c' C,"] * 13)
        self.assertEqual(estimated_difficulty(read_abc(hard)), "alta")
        text = tutor_text(read_abc(ABC_SCALE))
        self.assertIn("clave de Sol", text)
        self.assertIn("tonalidad de Sol mayor", text)
        self.assertIn("compás de cuatro por cuatro", text)
        self.assertIn("tempo de 90", text)
        self.assertIn("dificultad estimada: baja", text)


class ListeningBase(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(email="owner@example.com", name="Owner", password="correct-horse")
        self.user = User.objects.create_user(email="user@example.com", name="Listener", password="correct-horse")
        self.abc = Score.objects.create(owner=self.owner, title="Escala", instrument="Piano", description="d", score_format="ABC", content=ABC_SCALE)
        self.text = Score.objects.create(owner=self.owner, title="Texto", instrument="Piano", description="d", score_format="TEXT", content="do re mi")
        self.chord = Score.objects.create(owner=self.owner, title="Acorde", instrument="Piano", description="d", score_format="ABC", content=ABC_CHORD)
        self.client = Client(enforce_csrf_checks=True)
        self.client.force_login(self.user)
        self.csrf = self.client.get("/api/v1/csrf/").json()["csrfToken"]

    def post(self, url, **kwargs):
        return self.client.post(url, HTTP_X_CSRFTOKEN=self.csrf, **kwargs)


class DetailPlaybackTests(ListeningBase):
    def test_detail_includes_playback(self):
        abc = self.client.get(f"/api/v1/scores/{self.abc.pk}/").json()["score"]["playback"]
        text = self.client.get(f"/api/v1/scores/{self.text.pk}/").json()["score"]["playback"]
        self.assertTrue(abc["playable"])
        self.assertEqual(len(abc["events"]), 8)
        self.assertEqual(text, {"playable": False, "reason": "NOT_ABC", "events": []})


@override_settings(VOICE_PRIMARY_ENGINE="fake", VOICE_DAILY_LIMIT=20, MEDIA_ROOT=MEDIA)
class SynthesisEndpointTests(ListeningBase):
    def solfege(self, score):
        return self.post(f"/api/v1/scores/{score.pk}/audio/solfege/")

    def test_solfege_returns_mp3_and_is_cached(self):
        first = self.solfege(self.abc)
        self.assertEqual(first.status_code, 200)
        self.assertEqual(first["Content-Type"], "audio/mpeg")
        self.assertEqual(VoiceSynthesisQuota.objects.get(user=self.user).syntheses, 1)
        second = self.solfege(self.abc)
        self.assertEqual(second.content, first.content)
        self.assertEqual(VoiceSynthesisQuota.objects.get(user=self.user).syntheses, 1)  # cache hit (AC-056)
        self.assertEqual(SynthesizedAudio.objects.count(), 1)

    def test_edited_content_generates_new_audio(self):
        self.solfege(self.abc)
        self.abc.content = ABC_SCALE.replace("g |]", "a |]")
        self.abc.save()
        self.solfege(self.abc)
        self.assertEqual(SynthesizedAudio.objects.count(), 2)  # AC-057

    def test_text_unsupported_and_auth_errors(self):
        self.assertEqual(self.solfege(self.text).json()["code"], "NOT_ABC")
        self.assertEqual(self.solfege(self.chord).status_code, 422)
        anonymous = Client(enforce_csrf_checks=False)
        self.assertEqual(anonymous.post(f"/api/v1/scores/{self.abc.pk}/audio/solfege/").status_code, 401)
        self.assertEqual(self.post("/api/v1/scores/9999/audio/solfege/").status_code, 404)

    @override_settings(VOICE_DAILY_LIMIT=1)
    def test_daily_limit_applies_only_to_new_audio(self):
        self.assertEqual(self.solfege(self.abc).status_code, 200)
        response = self.post(f"/api/v1/scores/{self.abc.pk}/audio/tutor/")
        self.assertEqual(response.status_code, 429)
        self.assertEqual(response.json()["code"], "DAILY_LIMIT_REACHED")
        self.assertEqual(self.solfege(self.abc).status_code, 200)  # stored audio still available

    def test_tutor_returns_text_header(self):
        response = self.post(f"/api/v1/scores/{self.abc.pk}/audio/tutor/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("clave%20de%20Sol", response["X-Notara-Tutor-Text"])

    @override_settings(VOICE_PRIMARY_ENGINE="elevenlabs")
    def test_fallback_voice_when_primary_fails(self):
        with patch.object(ElevenLabsTtsAdapter, "synthesize", side_effect=TtsProviderError("HTTP 402")), \
                patch.object(EdgeTtsAdapter, "synthesize", return_value=b"ID3edge") as edge, \
                self.assertLogs("voice.synthesis", level="WARNING") as logs:
            response = self.solfege(self.abc)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b"ID3edge")
        edge.assert_called_once()
        self.assertTrue(any("voice_fallback" in line for line in logs.output))
        self.assertNotIn("edge", response.headers.get("X-Notara-Voice", ""))  # engine never revealed

    @override_settings(VOICE_PRIMARY_ENGINE="elevenlabs")
    def test_both_voices_fail_returns_503_and_releases_quota(self):
        with patch.object(ElevenLabsTtsAdapter, "synthesize", side_effect=TtsProviderError("HTTP 429")), \
                patch.object(EdgeTtsAdapter, "synthesize", side_effect=TtsProviderError("timeout")), \
                self.assertLogs("voice.synthesis", level="WARNING"):
            response = self.solfege(self.abc)
        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json()["code"], "AUDIO_UNAVAILABLE")
        self.assertEqual(VoiceSynthesisQuota.objects.get(user=self.user).syntheses, 0)

    def test_storage_failure_still_returns_audio(self):
        with patch.object(default_storage, "save", side_effect=OSError("disk")), \
                self.assertLogs("voice.synthesis", level="WARNING"):
            response = self.solfege(self.abc)
        self.assertEqual(response.status_code, 200)  # AC-058
        self.assertEqual(SynthesizedAudio.objects.count(), 0)


@override_settings(MEDIA_ROOT=MEDIA)
class VoiceCommentTests(ListeningBase):
    def setUp(self):
        super().setUp()
        self.adapter = FakeSttAdapter("Muy buen ejercicio para practicar la lectura.")
        patcher = patch("voice.transcription.get_stt_adapter", return_value=self.adapter)
        patcher.start()
        self.addCleanup(patcher.stop)

    def send(self, score, client=None, upload=None):
        client = client or self.client
        return client.post(
            f"/api/v1/scores/{score.pk}/comments/",
            {"audio": upload or uploaded_wav()},
            HTTP_X_CSRFTOKEN=self.csrf,
        )

    def test_voice_comment_created_with_audio(self):
        response = self.send(self.abc)
        self.assertEqual(response.status_code, 201)
        comment = response.json()["comment"]
        self.assertEqual(comment["kind"], "VOICE")
        self.assertEqual(comment["body"], "Muy buen ejercicio para practicar la lectura.")
        audio = self.client.get(comment["audio_url"])
        self.assertEqual(audio.status_code, 200)
        self.assertEqual(audio["Content-Type"], "audio/wav")
        self.assertEqual(STTInferenceQuota.objects.get(user=self.user).admitted_inferences, 1)

    def test_long_transcript_is_kept_up_to_1000(self):
        self.adapter.transcript = "a" * 900
        self.assertEqual(self.send(self.abc).status_code, 201)
        self.adapter.transcript = "a" * 1001
        self.assertEqual(self.send(self.abc).json()["code"], "TRANSCRIPTION_TOO_LONG")

    def test_rejections(self):
        owner_client = Client(enforce_csrf_checks=True)
        owner_client.force_login(self.owner)
        owner_csrf = owner_client.get("/api/v1/csrf/").json()["csrfToken"]
        own = owner_client.post(f"/api/v1/scores/{self.abc.pk}/comments/", {"audio": uploaded_wav()}, HTTP_X_CSRFTOKEN=owner_csrf)
        self.assertEqual(own.json()["code"], "OWN_SCORE")
        self.adapter.transcript = "   "
        self.assertEqual(self.send(self.abc).json()["code"], "TRANSCRIPTION_FAILED")
        self.assertEqual(self.send(self.abc, upload=uploaded_wav(b"not audio")).json()["code"], "AUDIO_INVALID")
        self.assertEqual(Comment.objects.count(), 0)

    def test_audio_requires_authentication_and_is_deleted_with_comment(self):
        comment_id = self.send(self.abc).json()["comment"]["id"]
        comment = Comment.objects.get(pk=comment_id)
        name = comment.audio.name
        self.assertTrue(default_storage.exists(name))
        self.assertEqual(Client().get(f"/api/v1/comments/{comment_id}/audio/").status_code, 401)
        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.delete(f"/api/v1/scores/{self.abc.pk}/comments/{comment_id}/", HTTP_X_CSRFTOKEN=self.csrf)
        self.assertEqual(response.status_code, 204)
        self.assertFalse(default_storage.exists(name))

    def test_audio_deleted_on_cascade(self):
        comment_id = self.send(self.abc).json()["comment"]["id"]
        name = Comment.objects.get(pk=comment_id).audio.name
        with self.captureOnCommitCallbacks(execute=True):
            self.user.delete()  # administrative deletion (DEC-237)
        self.assertFalse(default_storage.exists(name))

    def test_text_comments_keep_500_limit(self):
        response = self.client.post(
            f"/api/v1/scores/{self.abc.pk}/comments/",
            data='{"body": "' + "a" * 501 + '"}',
            content_type="application/json",
            HTTP_X_CSRFTOKEN=self.csrf,
        )
        self.assertEqual(response.status_code, 400)
