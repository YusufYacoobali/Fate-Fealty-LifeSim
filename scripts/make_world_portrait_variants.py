"""Create world-character variants without changing the game's pixel style.

Each output keeps an existing 128px sprite's exact silhouette, outlines and
pixel grid. Only saturated clothing/hair colours are shifted; skin and very
dark outline pixels stay untouched.
"""

from __future__ import annotations

import colorsys
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets" / "generated"

VARIANTS = {
    "world-woman-1.png": ("kin-mother.png", 0.00),
    "world-woman-2.png": ("kin-mother.png", 0.18),
    "world-woman-3.png": ("kin-spouse.png", 0.00),
    "world-woman-4.png": ("kin-spouse.png", 0.32),
    "world-woman-5.png": ("portrait-noble.png", 0.12),
    "world-woman-6.png": ("portrait-noble.png", 0.48),
    "world-man-1.png": ("kin-father.png", 0.00),
    "world-man-2.png": ("kin-father.png", 0.22),
    "world-man-3.png": ("kin-friend.png", 0.00),
    "world-man-4.png": ("kin-friend.png", 0.35),
    "world-man-5.png": ("kin-foe.png", 0.00),
    "world-man-6.png": ("kin-foe.png", 0.52),
    "world-child-1.png": ("kin-child.png", 0.00),
    "world-child-2.png": ("kin-child.png", 0.25),
    "world-child-3.png": ("kin-child.png", 0.55),
}


def is_skin(r: int, g: int, b: int) -> bool:
    # Include the sprites' pale highlight and antialias shades. Preserving some
    # brown hair/leather is preferable to ever tinting a character's skin.
    return r > 85 and g > 48 and b > 28 and r >= g and g > b and r - b < 185


def recolour(source: Image.Image, hue_shift: float) -> Image.Image:
    image = source.convert("RGBA")
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            r, g, b, a = pixels[x, y]
            if a == 0 or max(r, g, b) < 48 or is_skin(r, g, b):
                continue
            h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            if s < 0.18:
                continue
            nr, ng, nb = colorsys.hsv_to_rgb((h + hue_shift) % 1, s, v)
            pixels[x, y] = (round(nr * 255), round(ng * 255), round(nb * 255), a)
    return image


def main() -> None:
    for output, (source, shift) in VARIANTS.items():
        with Image.open(ASSETS / source) as image:
            recolour(image, shift).save(ASSETS / output)


if __name__ == "__main__":
    main()
