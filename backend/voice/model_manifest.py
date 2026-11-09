import argparse
import hashlib
import json
import re
from pathlib import Path

from .model_config import MODEL_FILES, MODEL_REPOSITORY, MODEL_REVISION

REVISION_PATTERN = re.compile(r"^[0-9a-f]{40}$")


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as model_file:
        for chunk in iter(lambda: model_file.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def build_manifest(model_path: Path, revision: str) -> dict:
    if not REVISION_PATTERN.fullmatch(revision):
        raise ValueError("Model revision must be a full 40-character commit hash.")
    if not model_path.is_dir():
        raise ValueError(f"Model directory does not exist: {model_path}")

    files = {}
    for path in sorted(model_path.rglob("*")):
        if path.is_file():
            relative_path = path.relative_to(model_path).as_posix()
            files[relative_path] = {
                "sha256": _sha256(path),
                "size_bytes": path.stat().st_size,
            }
    if not files:
        raise ValueError("Model directory contains no files.")
    return {
        "repository": MODEL_REPOSITORY,
        "revision": revision,
        "files": files,
    }


def verify_manifest(model_path: Path, manifest_path: Path, revision: str) -> None:
    if revision != MODEL_REVISION:
        raise ValueError(f"Only the pinned model revision {MODEL_REVISION} is supported.")
    if not REVISION_PATTERN.fullmatch(revision):
        raise ValueError("STT_MODEL_REVISION must be a full 40-character commit hash.")
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if manifest.get("repository") != MODEL_REPOSITORY:
        raise ValueError(f"Model manifest repository must be {MODEL_REPOSITORY}.")
    if manifest.get("revision") != revision:
        raise ValueError("Model manifest revision does not match STT_MODEL_REVISION.")

    expected = manifest.get("files")
    if not isinstance(expected, dict) or not expected:
        raise ValueError("Model manifest must contain a non-empty files mapping.")
    actual_paths = {
        path.relative_to(model_path).as_posix()
        for path in model_path.rglob("*")
        if path.is_file()
    }
    if set(expected) != set(MODEL_FILES):
        raise ValueError("Model manifest files do not match the pinned model file set.")
    if actual_paths != set(MODEL_FILES):
        raise ValueError("Model files do not match the SHA-256 manifest.")
    for relative_path, expected_file in expected.items():
        file_path = model_path / relative_path
        if not isinstance(expected_file, dict):
            raise ValueError(f"Invalid manifest entry for model file: {relative_path}")
        if file_path.stat().st_size != expected_file.get("size_bytes"):
            raise ValueError(f"File size mismatch for model file: {relative_path}")
        digest = _sha256(file_path)
        if digest != expected_file.get("sha256"):
            raise ValueError(f"SHA-256 mismatch for model file: {relative_path}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Create a SHA-256 manifest for a locally staged Whisper model."
    )
    parser.add_argument("--model-path", required=True, type=Path)
    parser.add_argument("--revision", required=True)
    parser.add_argument("--output", required=True, type=Path)
    arguments = parser.parse_args()

    try:
        arguments.output.resolve().relative_to(arguments.model_path.resolve())
    except ValueError:
        pass
    else:
        raise ValueError("Write the SHA-256 manifest outside the model directory.")
    manifest = build_manifest(arguments.model_path, arguments.revision)
    arguments.output.parent.mkdir(parents=True, exist_ok=True)
    arguments.output.write_text(
        json.dumps(manifest, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(manifest['files'])} SHA-256 entries to {arguments.output}")


if __name__ == "__main__":
    main()
