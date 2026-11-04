"""Compatibility entry point for the repeatable full-game icon crop repair.

The former implementation cropped already-cropped output PNGs in place. Running
it twice could progressively remove artwork. All cuts now use immutable source
artwork through repair_game_icon_crops instead.
"""

from repair_game_icon_crops import main


if __name__ == "__main__":
    main()
