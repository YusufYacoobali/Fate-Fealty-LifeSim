from __future__ import annotations

import argparse
import shutil
from collections import deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "assets" / "generated"
SHEET_DIR = ASSET_DIR / "imagegen-sheets"
OLD_DIR = ASSET_DIR / "old"

RANKS = [
    "portrait-peasant.png",
    "portrait-squire.png",
    "portrait-knight.png",
    "portrait-noble.png",
    "portrait-baron.png",
    "portrait-monarch.png",
]

ACTIVITIES = [
    "activity-tavern.png",
    "activity-dice.png",
    "activity-feast.png",
    "activity-fair.png",
    "activity-fields.png",
    "activity-blacksmith.png",
    "activity-market.png",
    "activity-church.png",
    "activity-pilgrimage.png",
    "activity-train.png",
    "activity-quest.png",
    "activity-tournament.png",
    "activity-poach.png",
    "activity-pickpocket.png",
    "activity-banditry.png",
    "activity-leech.png",
    "activity-bathhouse.png",
    "activity-herbalist.png",
]

KIN_STATS_SHOP = [
    "kin-mother.png",
    "kin-father.png",
    "kin-sibling.png",
    "kin-spouse.png",
    "kin-child.png",
    "kin-friend.png",
    "kin-foe.png",
    "kin-liege.png",
    "kin-goose.png",
    "kin-roderick.png",
    "stat-health.png",
    "stat-charm.png",
    "stat-wits.png",
    "stat-faith.png",
    "shop-bread.png",
    "shop-herbs.png",
    "shop-ale.png",
    "shop-candle.png",
    "shop-tunic.png",
    "shop-quill.png",
    "shop-sword.png",
    "shop-steed.png",
    "shop-relic.png",
    "shop-cottage.png",
]

TRAITS_UI = [
    "trait-sickly.png",
    "trait-hale.png",
    "trait-silver_tongue.png",
    "trait-dullard.png",
    "trait-bookish.png",
    "trait-pious.png",
    "trait-heathen.png",
    "trait-lucky.png",
    "trait-ill_starred.png",
    "trait-comely.png",
    "trait-war_hero.png",
    "trait-living_saint.png",
    "trait-notorious_outlaw.png",
    "trait-kingmaker.png",
    "trait-devoted_parent.png",
    "trait-plague_touched.png",
    "ui-shop.png",
    "ui-settings.png",
]


def archive_live_pngs() -> None:
    OLD_DIR.mkdir(parents=True, exist_ok=True)
    for png in sorted(ASSET_DIR.glob("*.png")):
        target = OLD_DIR / png.name
        if target.exists():
            stem = png.stem
            suffix = png.suffix
            index = 2
            while (OLD_DIR / f"{stem}-{index}{suffix}").exists():
                index += 1
            target = OLD_DIR / f"{stem}-{index}{suffix}"
        shutil.move(str(png), str(target))


def cell_bounds(width: int, height: int, cols: int, rows: int, index: int) -> tuple[int, int, int, int]:
    col = index % cols
    row = index // cols
    left = round(col * width / cols)
    right = round((col + 1) * width / cols)
    top = round(row * height / rows)
    bottom = round((row + 1) * height / rows)
    return left, top, right, bottom


def is_magenta_background(pixel: tuple[int, int, int, int]) -> bool:
    r, g, b, _a = pixel
    return r > 150 and b > 120 and g < 120 and r - g > 70 and b - g > 70


def remove_connected_key(cell: Image.Image) -> Image.Image:
    image = cell.convert("RGBA")
    pixels = image.load()
    width, height = image.size
    seen: set[tuple[int, int]] = set()
    queue: deque[tuple[int, int]] = deque()

    for x in range(width):
        queue.append((x, 0))
        queue.append((x, height - 1))
    for y in range(height):
        queue.append((0, y))
        queue.append((width - 1, y))

    while queue:
        x, y = queue.popleft()
        if (x, y) in seen or x < 0 or y < 0 or x >= width or y >= height:
            continue
        seen.add((x, y))
        if not is_magenta_background(pixels[x, y]):
            continue
        pixels[x, y] = (0, 0, 0, 0)
        queue.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))

    return image


def remove_tiny_fragments(image: Image.Image) -> Image.Image:
    pixels = image.load()
    width, height = image.size
    seen: set[tuple[int, int]] = set()

    for start_y in range(height):
        for start_x in range(width):
            if (start_x, start_y) in seen or pixels[start_x, start_y][3] == 0:
                continue

            component: list[tuple[int, int]] = []
            queue: deque[tuple[int, int]] = deque([(start_x, start_y)])
            seen.add((start_x, start_y))

            while queue:
                x, y = queue.popleft()
                component.append((x, y))
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if nx < 0 or ny < 0 or nx >= width or ny >= height or (nx, ny) in seen:
                        continue
                    seen.add((nx, ny))
                    if pixels[nx, ny][3] > 0:
                        queue.append((nx, ny))

            xs = [point[0] for point in component]
            ys = [point[1] for point in component]
            comp_width = max(xs) - min(xs) + 1
            comp_height = max(ys) - min(ys) + 1
            area = len(component)
            is_sliver = comp_width <= 6 or comp_height <= 6
            if area < 90 or (is_sliver and area < 500):
                for x, y in component:
                    pixels[x, y] = (0, 0, 0, 0)

    return image


def trim_and_square(image: Image.Image, size: int = 128) -> Image.Image:
    alpha = image.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        return Image.new("RGBA", (size, size), (0, 0, 0, 0))

    cropped = image.crop(bbox)
    max_edge = max(cropped.size)
    canvas = Image.new("RGBA", (max_edge, max_edge), (0, 0, 0, 0))
    canvas.alpha_composite(cropped, ((max_edge - cropped.width) // 2, (max_edge - cropped.height) // 2))

    target_inner = 112
    if max_edge > target_inner:
        scale = target_inner / max_edge
        resized = canvas.resize((round(canvas.width * scale), round(canvas.height * scale)), Image.Resampling.LANCZOS)
    else:
        resized = canvas

    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.alpha_composite(resized, ((size - resized.width) // 2, (size - resized.height) // 2))
    return remove_resize_dust(out)


def remove_resize_dust(image: Image.Image) -> Image.Image:
    pixels = image.load()
    width, height = image.size
    seen: set[tuple[int, int]] = set()

    for start_y in range(height):
        for start_x in range(width):
            if (start_x, start_y) in seen or pixels[start_x, start_y][3] == 0:
                continue

            component: list[tuple[int, int]] = []
            queue: deque[tuple[int, int]] = deque([(start_x, start_y)])
            seen.add((start_x, start_y))

            while queue:
                x, y = queue.popleft()
                component.append((x, y))
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if nx < 0 or ny < 0 or nx >= width or ny >= height or (nx, ny) in seen:
                        continue
                    seen.add((nx, ny))
                    if pixels[nx, ny][3] > 0:
                        queue.append((nx, ny))

            xs = [point[0] for point in component]
            ys = [point[1] for point in component]
            comp_width = max(xs) - min(xs) + 1
            comp_height = max(ys) - min(ys) + 1
            area = len(component)
            if area <= 10 or ((comp_width <= 2 or comp_height <= 2) and area <= 40):
                for x, y in component:
                    pixels[x, y] = (0, 0, 0, 0)

    return image


def slice_sheet(sheet_name: str, cols: int, rows: int, names: list[str]) -> None:
    sheet = Image.open(SHEET_DIR / sheet_name).convert("RGBA")
    width, height = sheet.size
    for index, name in enumerate(names):
        cell = sheet.crop(cell_bounds(width, height, cols, rows, index))
        inset = max(6, min(cell.size) // 32)
        cell = cell.crop((inset, inset, cell.width - inset, cell.height - inset))
        transparent = remove_connected_key(cell)
        cleaned = remove_tiny_fragments(transparent)
        trim_and_square(cleaned).save(ASSET_DIR / name)


def make_contact_sheet() -> None:
    files = sorted(
        p
        for p in ASSET_DIR.glob("*.png")
        if p.name != "contact-sheet-imagegen-style.png"
    )
    cols = 10
    cell = 96
    rows = (len(files) + cols - 1) // cols
    sheet = Image.new("RGBA", (cols * cell, rows * cell), (5, 130, 103, 255))
    for index, file in enumerate(files):
        image = Image.open(file).convert("RGBA").resize((72, 72), Image.Resampling.NEAREST)
        x = (index % cols) * cell + 12
        y = (index // cols) * cell + 12
        sheet.alpha_composite(image, (x, y))
    sheet.save(ASSET_DIR / "contact-sheet-imagegen-style.png")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--skip-archive", action="store_true")
    args = parser.parse_args()

    if not args.skip_archive:
        archive_live_pngs()
    slice_sheet("ranks.png", 3, 2, RANKS)
    slice_sheet("activities.png", 6, 3, ACTIVITIES)
    slice_sheet("kin-stats-shop.png", 6, 4, KIN_STATS_SHOP)
    slice_sheet("traits-ui.png", 6, 3, TRAITS_UI)
    make_contact_sheet()


if __name__ == "__main__":
    main()
