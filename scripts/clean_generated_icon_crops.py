"""Remove neighboring-cell fragments from generated pixel-art icons.

The original sprite-sheet cuts left a handful of icons with pieces of the
adjacent cell.  These crop boxes isolate the intended subject, then centre it
on the standard transparent 128px canvas without smoothing the pixel art.
"""

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "assets" / "generated"
INNER_SIZE = 112
CANVAS_SIZE = 128

# left, top, right, bottom in the existing 128px asset.
CROPS: dict[str, tuple[int, int, int, int]] = {
    "activity-bathhouse.png": (0, 0, 114, 128),
    "activity-courting.png": (0, 0, 112, 112),
    "activity-dice.png": (24, 0, 128, 128),
    "activity-fair.png": (20, 0, 128, 128),
    "activity-fields.png": (0, 0, 108, 128),
    "activity-quest.png": (0, 0, 114, 128),
    "shop-herbal-book.png": (0, 0, 118, 128),
    "shop-relic.png": (0, 0, 102, 128),
}


def centre_subject(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    bbox = rgba.getchannel("A").getbbox()
    if not bbox:
        return Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))

    subject = rgba.crop(bbox)
    scale = min(1.0, INNER_SIZE / max(subject.size))
    if scale < 1:
        subject = subject.resize(
            (max(1, round(subject.width * scale)), max(1, round(subject.height * scale))),
            Image.Resampling.NEAREST,
        )
    output = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
    output.alpha_composite(
        subject,
        ((CANVAS_SIZE - subject.width) // 2, (CANVAS_SIZE - subject.height) // 2),
    )
    return output


def main() -> None:
    for filename, box in CROPS.items():
        path = ASSET_DIR / filename
        with Image.open(path) as image:
            centre_subject(image.crop(box)).save(path)


if __name__ == "__main__":
    main()
