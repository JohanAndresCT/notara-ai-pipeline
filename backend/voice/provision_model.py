import argparse
import os
import shutil
import tempfile
from pathlib import Path

from huggingface_hub import model_info, snapshot_download

from .model_config import MODEL_FILES, MODEL_REPOSITORY, MODEL_REVISION
from .model_manifest import verify_manifest

DEFAULT_MANIFEST = Path(__file__).with_name("model_sha256.json")


def provision_model(model_dir: Path, manifest_path: Path = DEFAULT_MANIFEST) -> None:
    model_dir = model_dir.expanduser().resolve()
    manifest_path = manifest_path.expanduser().resolve()
    if model_dir == manifest_path or model_dir in manifest_path.parents:
        raise ValueError("The manifest must be outside the model directory.")
    if model_dir.exists() and any(model_dir.iterdir()):
        try:
            verify_manifest(model_dir, manifest_path, MODEL_REVISION)
        except (OSError, ValueError):
            raise ValueError(
                f"Model directory is not empty and does not match {MODEL_REVISION}: "
                f"{model_dir}. Move it aside before provisioning."
            ) from None
        print(f"Verified existing model at {model_dir}")
        return

    info = model_info(MODEL_REPOSITORY, revision=MODEL_REVISION)
    if info.sha != MODEL_REVISION:
        raise RuntimeError(
            f"Model host resolved {MODEL_REVISION} to unexpected revision {info.sha}."
        )

    model_dir.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(
        prefix="notara-whisper-base-",
        dir=model_dir.parent,
    ) as temporary_directory:
        temporary_path = Path(temporary_directory)
        snapshot_dir = Path(
            snapshot_download(
                repo_id=MODEL_REPOSITORY,
                revision=MODEL_REVISION,
                allow_patterns=list(MODEL_FILES),
                local_dir=temporary_path / "snapshot",
            )
        )
        staged_model = temporary_path / "verified-model"
        staged_model.mkdir()
        for filename in MODEL_FILES:
            source = snapshot_dir / filename
            if not source.is_file():
                raise RuntimeError(f"Pinned model file is missing: {filename}")
            shutil.copyfile(source, staged_model / filename)
        verify_manifest(staged_model, manifest_path, MODEL_REVISION)
        if model_dir.exists():
            model_dir.rmdir()
        os.replace(staged_model, model_dir)
    print(f"Provisioned and SHA-256 verified {MODEL_REPOSITORY}@{MODEL_REVISION}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Download and verify the pinned Notara Whisper Base model."
    )
    parser.add_argument("--model-dir", required=True, type=Path)
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    arguments = parser.parse_args()
    provision_model(arguments.model_dir, arguments.manifest)


if __name__ == "__main__":
    main()
