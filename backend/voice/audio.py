import av
from django.conf import settings


class AudioTooLarge(ValueError):
    pass


class InvalidAudio(ValueError):
    pass


SUPPORTED_MIME_FORMATS = {
    "audio/webm": {"matroska", "webm"},
    "audio/ogg": {"ogg"},
    "audio/wav": {"wav"},
    "audio/mp4": {"mov", "mp4", "m4a", "3gp", "3g2", "mj2"},
}


def validate_audio_upload(upload) -> None:
    if upload.size > settings.AUDIO_MAX_BYTES:
        raise AudioTooLarge
    mime_type = (upload.content_type or "").split(";", 1)[0].strip().lower()
    allowed_formats = SUPPORTED_MIME_FORMATS.get(mime_type)
    if allowed_formats is None:
        raise InvalidAudio

    upload.seek(0)
    try:
        with av.open(upload, mode="r") as container:
            actual_formats = set(container.format.name.split(","))
            if not actual_formats.intersection(allowed_formats):
                raise InvalidAudio
            if container.streams.video:
                raise InvalidAudio
            audio_streams = list(container.streams.audio)
            if not audio_streams:
                raise InvalidAudio
            audio_stream = audio_streams[0]
            duration_seconds = 0.0
            decoded_frames = 0
            for frame in container.decode(audio_stream):
                if not frame.sample_rate or frame.samples < 1:
                    raise InvalidAudio
                frame_start = frame.time
                if frame_start is None:
                    frame_start = duration_seconds
                duration_seconds = max(
                    duration_seconds,
                    frame_start + frame.samples / frame.sample_rate,
                )
                decoded_frames += 1
                if duration_seconds > settings.AUDIO_MAX_SECONDS:
                    raise InvalidAudio
            if decoded_frames == 0:
                raise InvalidAudio
    except (av.error.FFmpegError, OSError, ValueError) as exc:
        if isinstance(exc, InvalidAudio):
            raise
        raise InvalidAudio from exc
    finally:
        upload.seek(0)
