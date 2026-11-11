#!/usr/bin/env python3
"""Run an isolated CPU/int8 faster-whisper tiny transcription experiment."""

from __future__ import annotations

import argparse
import importlib.metadata
import json
import os
import platform
import sys
import threading
import time
from pathlib import Path
from typing import Any


MODEL_SIZE = "tiny"
DEVICE = "cpu"
COMPUTE_TYPE = "int8"
LANGUAGE = "es"
RSS_SAMPLE_INTERVAL_SECONDS = 0.02


class PeakRssSampler:
    """Sample this process's RSS; short-lived peaks may fall between samples."""

    def __init__(self, interval_seconds: float) -> None:
        import psutil

        self._process = psutil.Process(os.getpid())
        self._interval_seconds = interval_seconds
        self._stop = threading.Event()
        self._first_sampled = threading.Event()
        self._lock = threading.Lock()
        self._peak_rss_bytes = self._process.memory_info().rss
        self._thread = threading.Thread(target=self._run, daemon=True)

    @property
    def initial_rss_bytes(self) -> int:
        return self._initial_rss_bytes

    @property
    def peak_rss_bytes(self) -> int:
        with self._lock:
            return self._peak_rss_bytes

    def start(self) -> None:
        self._initial_rss_bytes = self._process.memory_info().rss
        self._observe()
        self._thread.start()
        self._first_sampled.wait()

    def stop(self) -> int:
        self._observe()
        self._stop.set()
        self._thread.join()
        return self._process.memory_info().rss

    def _observe(self) -> None:
        rss_bytes = self._process.memory_info().rss
        with self._lock:
            self._peak_rss_bytes = max(self._peak_rss_bytes, rss_bytes)

    def _run(self) -> None:
        self._observe()
        self._first_sampled.set()
        while not self._stop.wait(self._interval_seconds):
            self._observe()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Transcribe one local audio file using multilingual faster-whisper "
            "tiny on CPU with int8."
        )
    )
    parser.add_argument(
        "--audio",
        required=True,
        type=Path,
        help="Path to a local audio file supported by PyAV.",
    )
    parser.add_argument(
        "--threads",
        type=int,
        default=2,
        help="CTranslate2 CPU threads (default: 2; set explicitly for repeatable runs).",
    )
    parser.add_argument(
        "--cache-dir",
        type=Path,
        help="Optional directory for the downloaded model cache.",
    )
    parser.add_argument(
        "--hide-transcript",
        action="store_true",
        help="Omit recognized text from stdout.",
    )
    args = parser.parse_args()
    if args.threads < 1:
        parser.error("--threads must be at least 1")
    if not args.audio.is_file():
        parser.error(f"audio file does not exist or is not a file: {args.audio}")
    return args


def package_versions() -> dict[str, str]:
    packages = (
        "faster-whisper",
        "ctranslate2",
        "huggingface-hub",
        "tokenizers",
        "onnxruntime",
        "av",
        "tqdm",
        "psutil",
    )
    return {package: importlib.metadata.version(package) for package in packages}


def main() -> None:
    args = parse_args()
    versions = package_versions()
    sampler = PeakRssSampler(RSS_SAMPLE_INTERVAL_SECONDS)
    sampler.start()

    model_load_started = time.perf_counter()
    try:
        from faster_whisper import WhisperModel

        model_options: dict[str, Any] = {
            "device": DEVICE,
            "compute_type": COMPUTE_TYPE,
            "cpu_threads": args.threads,
            "num_workers": 1,
        }
        if args.cache_dir is not None:
            args.cache_dir.mkdir(parents=True, exist_ok=True)
            model_options["download_root"] = str(args.cache_dir.resolve())
        model = WhisperModel(MODEL_SIZE, **model_options)
        model_load_seconds = time.perf_counter() - model_load_started

        transcription_started = time.perf_counter()
        segments, transcription_info = model.transcribe(
            str(args.audio.resolve()),
            language=LANGUAGE,
        )
        transcript = "".join(segment.text for segment in segments).strip()
        transcription_seconds = time.perf_counter() - transcription_started
    finally:
        final_rss_bytes = sampler.stop()

    result: dict[str, Any] = {
        "environment": {
            "python": sys.version.split()[0],
            "python_implementation": platform.python_implementation(),
            "operating_system": platform.platform(),
            "logical_cpu_count": os.cpu_count(),
            "configured_cpu_threads": args.threads,
            "configured_model_workers": 1,
            "dependencies": versions,
        },
        "model": {
            "size": MODEL_SIZE,
            "device": DEVICE,
            "compute_type": COMPUTE_TYPE,
            "language_requested": LANGUAGE,
            "cache_directory": (
                str(args.cache_dir.resolve()) if args.cache_dir is not None else None
            ),
        },
        "audio": {
            "path": str(args.audio.resolve()),
            "duration_seconds": transcription_info.duration,
            "detected_language": transcription_info.language,
            "detected_language_probability": transcription_info.language_probability,
        },
        "measurements": {
            "model_load_seconds_including_import_and_download": model_load_seconds,
            "transcription_seconds_including_segment_iteration": transcription_seconds,
            "initial_rss_bytes": sampler.initial_rss_bytes,
            "maximum_sampled_rss_bytes": sampler.peak_rss_bytes,
            "final_rss_bytes": final_rss_bytes,
            "rss_sample_interval_milliseconds": int(
                RSS_SAMPLE_INTERVAL_SECONDS * 1000
            ),
        },
    }
    if not args.hide_transcript:
        result["transcript"] = transcript
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
