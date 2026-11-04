"""Asset-pipeline regressions for the actual clipping/colour-key failure modes."""

import unittest
import tempfile
from pathlib import Path
from unittest.mock import patch

from PIL import Image, ImageDraw

from repair_game_icon_crops import frame, remove_key
import slice_imagegen_assets


class IconCropTests(unittest.TestCase):
    def test_transparent_key_and_fringe_do_not_erase_outlined_purple_art(self):
        image = Image.new("RGBA", (32, 32), (255, 0, 255, 255))
        draw = ImageDraw.Draw(image)
        draw.rectangle((6, 6, 25, 25), fill=(195, 0, 195, 255))
        draw.rectangle((7, 7, 24, 24), fill=(0, 0, 0, 255))
        draw.rectangle((8, 8, 23, 23), fill=(170, 55, 195, 255))
        cleaned = remove_key(image)
        self.assertEqual(cleaned.getpixel((0, 0))[3], 0)
        self.assertEqual(cleaned.getpixel((6, 6))[3], 0)
        self.assertEqual(cleaned.getpixel((7, 7)), (0, 0, 0, 255))
        self.assertEqual(cleaned.getpixel((16, 16)), (170, 55, 195, 255))

    def test_closed_background_holes_clear_but_cog_centre_can_be_retained(self):
        image = Image.new("RGBA", (32, 32), (255, 0, 255, 255))
        ImageDraw.Draw(image).rectangle((6, 6, 25, 25), outline="black", width=3)
        self.assertEqual(remove_key(image).getpixel((16, 16))[3], 0)
        retained = remove_key(image, interior=False)
        self.assertEqual(retained.getpixel((16, 16)), (255, 0, 255, 255))
        self.assertEqual(retained.getpixel((0, 0))[3], 0)

    def test_tall_and_wide_art_keep_the_entire_outline_and_pixel_palette(self):
        for size in [(220, 80), (80, 220)]:
            image = Image.new("RGBA", size, (0, 0, 0, 0))
            draw = ImageDraw.Draw(image)
            draw.rectangle((0, 0, size[0] - 1, size[1] - 1), fill=(100, 60, 20, 255), outline="black", width=4)
            output = frame(image)
            bounds = output.getchannel("A").getbbox()
            self.assertEqual(output.size, (128, 128))
            self.assertGreaterEqual(min(bounds[:2]), 8)
            self.assertLessEqual(max(bounds[2:]), 120)
            self.assertEqual(output.getpixel(bounds[:2]), (0, 0, 0, 255))
            output_colors = {color for _, color in output.getcolors(output.width * output.height)}
            input_colors = {color for _, color in image.getcolors(image.width * image.height)}
            self.assertTrue(output_colors <= input_colors | {(0, 0, 0, 0)})

    def test_empty_art_is_rejected_rather_than_publishing_an_empty_icon(self):
        with self.assertRaisesRegex(ValueError, "no visible subject"):
            frame(Image.new("RGBA", (128, 128)))

    def test_legacy_rebuild_does_not_archive_icons_it_cannot_recreate(self):
        with tempfile.TemporaryDirectory() as directory:
            assets = Path(directory)
            (assets / "portrait-peasant.png").write_bytes(b"source portrait")
            (assets / "activity-teach-child.png").write_bytes(b"newer icon")
            (assets / "holding-overview-banner.png").write_bytes(b"banner")
            with patch.object(slice_imagegen_assets, "ASSET_DIR", assets), \
                 patch.object(slice_imagegen_assets, "OLD_DIR", assets / "old"):
                slice_imagegen_assets.archive_live_pngs()
            self.assertEqual((assets / "old/portrait-peasant.png").read_bytes(), b"source portrait")
            self.assertEqual((assets / "activity-teach-child.png").read_bytes(), b"newer icon")
            self.assertEqual((assets / "holding-overview-banner.png").read_bytes(), b"banner")


if __name__ == "__main__":
    unittest.main()
