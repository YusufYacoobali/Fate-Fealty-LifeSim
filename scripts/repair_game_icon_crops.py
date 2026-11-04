"""Rebuild reviewed icon crops from immutable artwork, without cumulative recropping.

The imagegen sheets are not exact grids: some subjects cross the old equal-cell
boundaries. Explicit source rectangles retain the entire intended subject and
exclude adjacent art. Eleven icons whose original cutouts lost their edges use
the repaired source atlases. No runtime asset keys or gameplay data change.
"""

from __future__ import annotations

import argparse
import io
from collections import deque
from pathlib import Path

from PIL import Image

from make_world_portrait_variants import VARIANTS, recolour

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets" / "generated"
SHEETS = ASSETS / "imagegen-sheets"
SIZE = 128
INNER = 112

# Source pixels, not coordinates in an already scaled/trimmed output PNG.
CROPS = {
    "activities.png": {
        "activity-tavern.png": (40, 80, 300, 335),
        "activity-feast.png": (520, 110, 805, 335),
        "activity-blacksmith.png": (1245, 95, 1500, 345),
        "activity-market.png": (40, 375, 280, 625),
        "activity-church.png": (290, 350, 520, 625),
        "activity-quest.png": (995, 385, 1240, 630),
        "activity-tournament.png": (1245, 350, 1490, 630),
        "activity-poach.png": (45, 650, 285, 925),
        "activity-pickpocket.png": (285, 650, 530, 925),
        "activity-banditry.png": (530, 650, 770, 925),
        "activity-leech.png": (790, 650, 985, 925),
        "activity-bathhouse.png": (995, 675, 1240, 925),
        "activity-herbalist.png": (1245, 685, 1500, 925),
    },
    "kin-stats-shop.png": {
        "kin-mother.png": (40, 20, 240, 280),
        "kin-father.png": (285, 20, 485, 280),
        "kin-sibling.png": (530, 30, 725, 280),
        "kin-spouse.png": (760, 30, 995, 280),
        "kin-child.png": (1020, 65, 1200, 280),
        "kin-friend.png": (1250, 30, 1440, 280),
        "kin-foe.png": (45, 280, 250, 525),
        "kin-liege.png": (280, 275, 500, 525),
        "kin-goose.png": (535, 285, 730, 525),
        "kin-roderick.png": (775, 280, 965, 525),
        "stat-charm.png": (1260, 290, 1450, 525),
        "stat-wits.png": (40, 540, 275, 735),
        "shop-herbs.png": (780, 525, 980, 735),
        "shop-ale.png": (1025, 525, 1225, 735),
        "shop-quill.png": (305, 740, 485, 965),
        "shop-sword.png": (515, 735, 735, 965),
        "shop-steed.png": (770, 730, 990, 970),
        "shop-relic.png": (1035, 725, 1200, 970),
        "shop-cottage.png": (1225, 735, 1480, 965),
    },
    "traits-ui.png": {
        "trait-sickly.png": (65, 75, 310, 310),
        "trait-hale.png": (345, 80, 580, 310),
        "trait-silver_tongue.png": (625, 60, 860, 315),
        "trait-bookish.png": (1190, 80, 1445, 315),
        "trait-pious.png": (1490, 55, 1690, 315),
        "trait-living_saint.png": (1460, 310, 1730, 580),
        "trait-notorious_outlaw.png": (50, 580, 305, 840),
        "trait-devoted_parent.png": (605, 580, 885, 840),
        "ui-settings.png": (1465, 595, 1710, 835),
    },
}

# Remove only the confirmed disconnected neighbouring-cell scraps. Preserve
# legitimate disconnected features such as hearts, halos, coins and sparkles.
SCRAPS = {
    "activity-seek-patron.png": (8, 15, 125, 110),
    "shop-hunting-hound.png": (15, 10, 128, 110),
    "shop-swine-herd.png": (8, 15, 115, 105),
}

RESTORED = {
    "shop-crop-restorations.png": (2, 2, 8, [
        "shop-leech-jar.png", "shop-plague-mask.png",
        "shop-willow-bark.png", "shop-theriac.png",
    ]),
    "icon-edge-restorations.png": (2, 2, 8, [
        "activity-teach-child.png", "shop-hand-cart.png",
        "shop-map-of-realm.png", "daily-reward-purse.png",
    ]),
    "storage-levy-oxen-restorations.png": (3, 1, 128, [
        "activity-manage-stores.png", "activity-negotiate-levy.png", "shop-oxen-pair.png",
    ]),
}


def remove_key(image: Image.Image, *, interior: bool = True) -> Image.Image:
    """Remove sheet magenta, including enclosed holes, keeping purple artwork.

    The settings cog intentionally retains its familiar purple centre. Other
    source sheets use this near-pure magenta only as their transparency key.
    """
    image = image.convert("RGBA")
    pixels = image.load()

    def key(x: int, y: int) -> bool:
        r, g, b, _ = pixels[x, y]
        return r >= 225 and b >= 225 and g <= 40

    if interior:
        seeds = [(x, y) for y in range(image.height) for x in range(image.width) if key(x, y)]
    else:
        seeds = [(x, y) for x in range(image.width) for y in (0, image.height - 1)] \
              + [(x, y) for y in range(image.height) for x in (0, image.width - 1)]
    # Remove the background's blended fringe too. Only flood from actual sheet
    # magenta: purple berries/clothing enclosed by their outlines are retained.
    queue, seen = deque(seeds), set()
    while queue:
        x, y = queue.popleft()
        if not (0 <= x < image.width and 0 <= y < image.height) or (x, y) in seen:
            continue
        seen.add((x, y))
        r, g, b, _ = pixels[x, y]
        if not (r > 100 and b > 90 and g < 120 and r - g > 70 and b - g > 70):
            continue
        pixels[x, y] = (0, 0, 0, 0)
        queue.extend(((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)))
    return image


def frame(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    bounds = image.getchannel("A").getbbox()
    if not bounds:
        raise ValueError("Icon has no visible subject")
    subject = image.crop(bounds)
    scale = min(1, INNER / max(subject.size))
    if scale < 1:
        subject = subject.resize((max(1, round(subject.width * scale)),
                                  max(1, round(subject.height * scale))), Image.Resampling.NEAREST)
    out = Image.new("RGBA", (SIZE, SIZE))
    out.alpha_composite(subject, ((SIZE - subject.width) // 2, (SIZE - subject.height) // 2))
    return out


def icon_outputs() -> dict[str, Image.Image]:
    outputs = {}
    for sheet_name, crops in CROPS.items():
        with Image.open(SHEETS / sheet_name) as sheet:
            for name, box in crops.items():
                subject = remove_key(sheet.crop(box), interior=name != "ui-settings.png")
                # A source selection touching an edge would repeat the original
                # clipping mistake. Fail before publishing a damaged output.
                bbox = subject.getchannel("A").getbbox()
                if not bbox or min(bbox[:2]) <= 0 or bbox[2] >= subject.width or bbox[3] >= subject.height:
                    raise ValueError(f"Source crop cuts its subject: {name}")
                outputs[name] = frame(subject)
    for name, box in SCRAPS.items():
        with Image.open(SHEETS / "icon-crop-originals" / name) as original:
            outputs[name] = frame(original.crop(box))
    for sheet_name, (columns, rows, alpha_cutoff, names) in RESTORED.items():
        with Image.open(SHEETS / sheet_name) as sheet:
            for i, name in enumerate(names):
                x, y = i % columns, i // columns
                box = (x * sheet.width // columns, y * sheet.height // rows,
                       (x + 1) * sheet.width // columns, (y + 1) * sheet.height // rows)
                subject = sheet.crop(box).convert("RGBA")
                # Generated sources are transparent. Do not colour-key their
                # deliberate pink/gold highlights or introduce smoothing.
                # Exclude encoder dust from subject measurement. The third
                # atlas has stronger low-alpha border noise; its deliberately
                # opaque pixel subjects remain intact at a half-alpha cutoff.
                subject.putalpha(subject.getchannel("A").point(lambda a: a if a >= alpha_cutoff else 0))
                bbox = subject.getchannel("A").getbbox()
                if not bbox or min(bbox[:2]) <= 0 or bbox[2] >= subject.width or bbox[3] >= subject.height:
                    raise ValueError(f"Restoration exceeds its quadrant: {name}")
                outputs[name] = frame(subject)
    for name, (source, shift) in VARIANTS.items():
        if source in outputs:
            outputs[name] = recolour(outputs[source], shift)
    return outputs


def repair_icons(check: bool = False) -> int:
    outputs = icon_outputs()
    mismatches = []
    for name, image in outputs.items():
        buffer = io.BytesIO()
        image.save(buffer, format="PNG", optimize=True)
        path = ASSETS / name
        if check:
            # PNG compression can differ across Pillow/zlib versions; compare
            # actual pixels so an equivalent lossless encoding is accepted.
            if not path.exists():
                mismatches.append(name)
            else:
                with Image.open(path) as saved:
                    if saved.size != image.size or saved.convert("RGBA").tobytes() != image.tobytes():
                        mismatches.append(name)
        else:
            path.write_bytes(buffer.getvalue())
    if mismatches:
        raise SystemExit("Icon outputs need rebuilding: " + ", ".join(mismatches))
    print(f"{'Verified' if check else 'Rebuilt'} {len(outputs)} icon crops from immutable sources")
    return len(outputs)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Verify the committed outputs without writing")
    repair_icons(parser.parse_args().check)


if __name__ == "__main__":
    main()
