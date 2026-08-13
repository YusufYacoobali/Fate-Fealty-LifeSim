"""Repair shop icons that were split across generated sprite-sheet cells.

The committed PNGs are the lossless source cells.  Preview mode lays them out
with filenames so cross-cell fragments can be identified before composing the
six corrected 128px assets.
"""

from __future__ import annotations

import argparse
import io
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "assets" / "generated"
CANVAS_SIZE = 128
INNER_SIZE = 108


def committed_asset(filename: str) -> Image.Image:
    data = subprocess.check_output(
        ["git", "show", f"HEAD:assets/generated/{filename}"],
        cwd=ROOT,
    )
    return Image.open(io.BytesIO(data)).convert("RGBA")


def make_preview(output: Path) -> None:
    names = sorted(path.name for path in ASSET_DIR.glob("shop-*.png"))
    cell_width = 176
    cell_height = 158
    columns = 6
    rows = (len(names) + columns - 1) // columns
    sheet = Image.new("RGBA", (columns * cell_width, rows * cell_height), (32, 36, 40, 255))
    draw = ImageDraw.Draw(sheet)
    for index, name in enumerate(names):
        x = (index % columns) * cell_width
        y = (index // columns) * cell_height
        sheet.alpha_composite(committed_asset(name), (x + 24, y))
        draw.text((x + 4, y + 132), name, fill=(235, 235, 235, 255))
    output.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(output)


def remove_flat_background(image: Image.Image) -> Image.Image:
    if image.mode == "RGBA" and image.getchannel("A").getextrema()[0] == 0:
        return image.copy()

    rgb = image.convert("RGB")
    key = rgb.getpixel((0, 0))
    rgba = rgb.convert("RGBA")
    pixels = []
    source_pixels = rgb.load()
    for y in range(rgb.height):
        for x in range(rgb.width):
            red, green, blue = source_pixels[x, y]
            distance = ((red - key[0]) ** 2 + (green - key[1]) ** 2 + (blue - key[2]) ** 2) ** 0.5
            pixels.append((red, green, blue, 0 if distance < 72 else 255))
    rgba.putdata(pixels)
    return rgba


def finish_icon(source: Path, filename: str) -> None:
    with Image.open(source) as raw:
        image = remove_flat_background(raw)
    bounds = image.getchannel("A").getbbox()
    if not bounds:
        raise ValueError(f"No visible subject found in {source}")
    subject = image.crop(bounds)
    scale = min(INNER_SIZE / subject.width, INNER_SIZE / subject.height)
    subject = subject.resize(
        (max(1, round(subject.width * scale)), max(1, round(subject.height * scale))),
        Image.Resampling.NEAREST,
    )
    output = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
    output.alpha_composite(
        subject,
        ((CANVAS_SIZE - subject.width) // 2, (CANVAS_SIZE - subject.height) // 2),
    )
    output.save(ASSET_DIR / filename, optimize=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--preview", type=Path)
    parser.add_argument(
        "--repair",
        action="append",
        nargs=2,
        metavar=("SOURCE", "FILENAME"),
        default=[],
    )
    args = parser.parse_args()
    if args.preview:
        make_preview(args.preview)
    for source, filename in args.repair:
        finish_icon(Path(source), filename)


if __name__ == "__main__":
    main()
