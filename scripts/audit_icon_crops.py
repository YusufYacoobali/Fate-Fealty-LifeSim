"""Audit every registered game icon and render before/after review sheets.

This reads the actual source references, rather than assuming a fixed icon list.
Large illustrations and launcher artwork are reported separately: their intended
full-bleed compositions do not follow the transparent UI-icon margin contract.
"""

from __future__ import annotations

import argparse
import hashlib
import io
import json
import re
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets" / "generated"
ILLUSTRATIONS = {
    "combat-yard-pixel.png", "forge-workshop-pixel.png", "gazette-village-pixel.png",
    "holding-overview-banner.png", "work-occupations-banner.png", "paywall-progression-hero.png",
}


def properties(data: bytes) -> dict:
    with Image.open(io.BytesIO(data)) as image:
        rgba = image.convert("RGBA")
        bounds = rgba.getchannel("A").point(lambda a: 255 if a >= 8 else 0).getbbox()
        return {"size": list(image.size), "visibleBounds": list(bounds) if bounds else None,
                "sha256": hashlib.sha256(data).hexdigest()}


def draw_sheet(rows: list, destination: Path, before: bool, *, compare: bool = False) -> None:
    columns, width, height = (6, 200, 176) if compare else (8, 150, 158)
    sheet = Image.new("RGB", (columns * width, ((len(rows) + columns - 1) // columns) * height), "#eadbb2")
    draw = ImageDraw.Draw(sheet)
    for i, row in enumerate(rows):
        x, y = i % columns * width, i // columns * height
        versions = [True, False] if compare else [before]
        for j, old in enumerate(versions):
            image = Image.open(io.BytesIO(row["oldData"] if old else row["data"])).convert("RGBA")
            image.thumbnail((94, 114) if compare else (112, 112), Image.Resampling.NEAREST)
            cell = 100 if compare else width
            sheet.paste(image, (x + j * cell + (cell - image.width) // 2, y + 4), image)
        short = row["name"].replace("activity-", "a-").replace("holding-upgrade-", "hu-").replace("career-action-", "ca-")
        draw.text((x + 3, y + 121), short, fill="#162a42")
        if compare:
            draw.text((x + 15, y + 138), "BEFORE        AFTER", fill="#775533")
    sheet.save(destination)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--baseline", default="c9cadaf18b04db44f82675a5cc98f6539b16bdb3")
    parser.add_argument("--output", type=Path, default=ROOT / "docs/validation/icon-crops")
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    references = {}
    for source in sorted((ROOT / "src").rglob("*")):
        if source.suffix not in (".ts", ".tsx"):
            continue
        for name in re.findall(r"assets/generated/([^'\"\)]+\.png)", source.read_text()):
            references.setdefault(name, set()).add(str(source.relative_to(ROOT)))
    icons, illustrations, findings = [], [], []
    for name, uses in sorted(references.items()):
        data = (ASSETS / name).read_bytes()
        old = subprocess.check_output(["git", "show", f"{args.baseline}:assets/generated/{name}"], cwd=ROOT)
        row = {"name": name, "uses": sorted(uses), "before": properties(old), "after": properties(data),
               "changed": data != old, "oldData": old, "data": data}
        if name in ILLUSTRATIONS:
            illustrations.append(row)
            continue
        size, bounds = row["after"]["size"], row["after"]["visibleBounds"]
        if not bounds:
            findings.append(f"Empty icon: {name}")
        elif bounds[0] <= 0 or bounds[1] <= 0 or bounds[2] >= size[0] or bounds[3] >= size[1]:
            findings.append(f"Visible artwork touches canvas boundary: {name}")
        if row["changed"] and (size != [128, 128] or not bounds or
                               min(bounds[:2]) < 8 or bounds[2] > 120 or bounds[3] > 120):
            findings.append(f"Repaired icon lacks standard 8px safe margin: {name}")
        icons.append(row)
    changed = [row for row in icons if row["changed"]]
    for old, label in [(True, "before"), (False, "after")]:
        for start in range(0, len(icons), 48):
            draw_sheet(icons[start:start + 48], args.output / f"all-{label}-{start // 48 + 1}.png", old)
    for start in range(0, len(changed), 24):
        draw_sheet(changed[start:start + 24], args.output / f"comparison-{start // 24 + 1}.png", False, compare=True)
    public = lambda row: {key: value for key, value in row.items() if key not in ("data", "oldData")}
    launcher_paths = ["assets/icon/icon-ios.png", "assets/icon/icon_android.png"]
    report = {"baseline": args.baseline, "referencedPngs": len(references), "iconsReviewed": len(icons),
              "iconsChanged": len(changed), "findings": findings, "icons": list(map(public, icons)),
              "illustrations": list(map(public, illustrations)),
              "launchers": [{"path": path, **properties((ROOT / path).read_bytes())} for path in launcher_paths],
              "policy": "Transparent UI icons must have visible breathing room. Repaired icons are 128px RGBA with at least 8px margin. Full-bleed illustrations/launcher art are separate visual reviews. Legitimate separate hearts, rays and coins are preserved."}
    (args.output / "audit.json").write_text(json.dumps(report, indent=2) + "\n")
    print(f"Reviewed {len(icons)} icons; repaired {len(changed)}; {len(illustrations)} illustrations and {len(launcher_paths)} launcher assets reported separately")
    if findings:
        raise SystemExit("\n".join(findings))
    print("PASS: all icons decode, all have transparent edge clearance; repaired icons meet the 8px margin")


if __name__ == "__main__":
    main()
