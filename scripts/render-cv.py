"""Regenerate the lightweight CV preview using local Poppler and Pillow."""
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import tempfile

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "docs/EN_Adrian_Gomez_AI_Engineer.pdf"
OUTPUT = ROOT / "public/documents/cv"
MAX_BYTES = 150_000


def main():
    renderer = shutil.which("pdftoppm")
    if not renderer:
        raise SystemExit("pdftoppm is required. Use the bundled Codex Poppler runtime on PATH.")
    OUTPUT.mkdir(parents=True, exist_ok=True)
    pages = []
    temporary_root = ROOT / "tmp/pdfs"
    temporary_root.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="adros-cv-", dir=temporary_root) as temporary:
        if not Path(temporary).resolve().is_relative_to(temporary_root.resolve()):
            raise SystemExit("Temporary directory escaped the intended rendering workspace.")
        prefix = Path(temporary) / "page"
        subprocess.run([renderer, "-scale-to-x", "1200", "-scale-to-y", "-1", "-png", str(SOURCE), str(prefix)], check=True)
        images = sorted(Path(temporary).glob("page-*.png"), key=lambda path: int(path.stem.split("-")[-1]))
        if not images:
            raise SystemExit("Poppler did not render any pages.")
        for number, path in enumerate(images, start=1):
            image = Image.open(path).convert("RGB")
            destination = OUTPUT / f"{number:02}.webp"
            for quality in range(90, 39, -5):
                image.save(destination, "WEBP", quality=quality, method=6)
                if destination.stat().st_size < MAX_BYTES:
                    break
            else:
                raise SystemExit(f"Preview exceeds {MAX_BYTES} bytes: {destination.name}")
            pages.append({"src": f"/documents/cv/{destination.name}", "width": image.width, "height": image.height, "page": number})
            print(f"{destination.name}: {image.width}x{image.height}, {destination.stat().st_size} bytes")
    manifest = {"sourceSha256": hashlib.sha256(SOURCE.read_bytes()).hexdigest(), "pages": pages}
    (ROOT / "src/data/cv-preview.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    shutil.copyfile(SOURCE, ROOT / "public/documents/EN_Adrian_Gomez_AI_Engineer.pdf")


if __name__ == "__main__":
    main()
