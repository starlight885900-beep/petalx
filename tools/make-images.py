#!/usr/bin/env python3
"""
make-images.py: rasterise the PNG assets the SVG sources can't cover.

Social platforms and iOS home screens will not accept SVG, so this renders:
    assets/img/og-image.png         1200x630  social card
    assets/img/apple-touch-icon.png  180x180  iOS home screen

The petal geometry is the same bezier used in assets/js/blossom.js, so the
mark stays identical across canvas, SVG and PNG.

    python3 tools/make-images.py

NOTE: Inter is not installed here, so the card text falls back to Liberation
Sans. Re-run this on a machine with Inter, or export og-image.svg from a design
tool, if the social card typography needs to match the site exactly.
"""

import math
import pathlib
import sys
from PIL import Image, ImageDraw, ImageFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
IMG = ROOT / "assets" / "img"

ACCENT = (26, 86, 219)      # #1A56DB
ACCENT_INK = (21, 70, 176)  # #1546B0
# The petal outline needs to read against the petal fill, not just differ
# from it: five flat accent petals with a near-accent edge merge into a blob.
ACCENT_EDGE = (12, 45, 120)
MIST = (243, 246, 251)      # #F3F6FB
PAPER = (255, 255, 255)
INK = (15, 27, 46)          # #0F1B2E
SLATE = (82, 96, 109)

SS = 4  # supersample factor, for antialiasing

# Searched in order, first hit wins. Inter first on every platform, then the
# host's own grotesk. ImageFont.load_default() is the last resort and ignores
# the size argument, which renders the card's type at a few illegible pixels,
# so keep a real TTF reachable on any machine that runs this.
FONT_DIRS = [
    pathlib.Path("/usr/share/fonts/truetype"),
    pathlib.Path("C:/Windows/Fonts"),
    pathlib.Path.home() / "AppData/Local/Microsoft/Windows/Fonts",
    pathlib.Path("/Library/Fonts"),
    pathlib.Path.home() / "Library/Fonts",
]
FONT_CANDIDATES = {
    "bold": ["Inter-Bold.ttf", "Inter_28pt-Bold.ttf", "InterDisplay-Bold.ttf",
             "liberation/LiberationSans-Bold.ttf", "segoeuib.ttf", "arialbd.ttf",
             "Helvetica.ttc", "dejavu/DejaVuSans-Bold.ttf"],
    "regular": ["Inter-Regular.ttf", "Inter_28pt-Regular.ttf", "InterDisplay-Regular.ttf",
                "liberation/LiberationSans-Regular.ttf", "segoeui.ttf", "arial.ttf",
                "Helvetica.ttc", "dejavu/DejaVuSans.ttf"],
}


def font(weight, size):
    for name in FONT_CANDIDATES[weight]:
        for base in FONT_DIRS:
            path = base / name
            if path.exists():
                return ImageFont.truetype(str(path), size)
    print("  ! no TTF found; text will render at default size", file=sys.stderr)
    return ImageFont.load_default()


def _cubic(p0, c0, c1, p1, steps=24):
    out = []
    for i in range(steps + 1):
        t = i / steps
        u = 1 - t
        out.append((
            u**3 * p0[0] + 3 * u * u * t * c0[0] + 3 * u * t * t * c1[0] + t**3 * p1[0],
            u**3 * p0[1] + 3 * u * u * t * c0[1] + 3 * u * t * t * c1[1] + t**3 * p1[1],
        ))
    return out


def _quad(p0, c, p1, steps=12):
    out = []
    for i in range(steps + 1):
        t = i / steps
        u = 1 - t
        out.append((
            u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0],
            u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1],
        ))
    return out


def petal_points(R):
    """One notched sakura petal, tip up, origin at the flower centre."""
    w = R * 0.62
    pts = [(0.0, 0.0)]
    pts += _cubic((0, 0), (-w, -R * .34), (-w * .92, -R * .86), (-R * .17, -R))
    pts += _quad((-R * .17, -R), (0, -R * .94), (0, -R * .8))
    pts += _quad((0, -R * .8), (0, -R * .94), (R * .17, -R))
    pts += _cubic((R * .17, -R), (w * .92, -R * .86), (w, -R * .34), (0, 0))
    return pts


def draw_bloom(draw, cx, cy, R):
    for i in range(5):
        angle = i * (2 * math.pi / 5)
        cos_a, sin_a = math.cos(angle), math.sin(angle)
        rotated = [
            (cx + x * cos_a - y * sin_a, cy + x * sin_a + y * cos_a)
            for x, y in petal_points(R)
        ]
        draw.polygon(rotated, fill=ACCENT, outline=ACCENT_EDGE)
    draw.ellipse(
        [cx - R * .09, cy - R * .09, cx + R * .09, cy + R * .09],
        fill=(*ACCENT_INK, 140) if len(ACCENT_INK) == 4 else ACCENT_INK,
    )


def make_og():
    W, H = 1200, 630
    img = Image.new("RGB", (W * SS, H * SS), PAPER)
    d = ImageDraw.Draw(img)

    d.ellipse([610 * SS, -270 * SS, 1450 * SS, 570 * SS], fill=MIST)
    draw_bloom(d, 960 * SS, 330 * SS, 175 * SS)

    d.text((90 * SS, 190 * SS), "P E T A L X T E C H", font=font("bold", 26 * SS), fill=ACCENT_INK)
    d.text((86 * SS, 262 * SS), "Craft &", font=font("bold", 80 * SS), fill=INK)
    d.text((86 * SS, 352 * SS), "Collaboration", font=font("bold", 80 * SS), fill=INK)
    d.text((90 * SS, 470 * SS), "An IT company in Tsuwano, Shimane, connecting Japanese", font=font("regular", 27 * SS), fill=SLATE)
    d.text((90 * SS, 508 * SS), "craft with companies in the United States.", font=font("regular", 27 * SS), fill=SLATE)

    for i in range(5):
        x = (90 + i * 20) * SS
        d.ellipse([x, 570 * SS, x + 10 * SS, 580 * SS], fill=ACCENT)

    img.resize((W, H), Image.LANCZOS).save(IMG / "og-image.png", optimize=True)
    return "og-image.png"


def make_touch_icon():
    S = 180
    img = Image.new("RGB", (S * SS, S * SS), MIST)
    d = ImageDraw.Draw(img)
    draw_bloom(d, S * SS // 2, S * SS // 2, 68 * SS)
    img.resize((S, S), Image.LANCZOS).save(IMG / "apple-touch-icon.png", optimize=True)
    return "apple-touch-icon.png"


if __name__ == "__main__":
    for name in (make_og(), make_touch_icon()):
        size = (IMG / name).stat().st_size
        print(f"  wrote assets/img/{name}  ({size // 1024} KB)")
