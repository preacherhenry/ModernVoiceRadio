"""
One-off generator for placeholder app-icon/splash assets so Expo prebuild has
something valid to bundle. Replace these with real designed assets before
shipping to the App Store / Play Store.
"""
from PIL import Image, ImageDraw

OUT = "src/assets/images"
VIOLET = (124, 58, 237, 255)   # #7C3AED
MAGENTA = (236, 72, 153, 255)  # #EC4899
DUSK = (11, 11, 20, 255)       # #0B0B14
WHITE = (255, 255, 255, 255)


def gradient_square(size, c1, c2):
    img = Image.new("RGBA", (size, size), c1)
    px = img.load()
    for y in range(size):
        t = y / max(size - 1, 1)
        r = round(c1[0] + (c2[0] - c1[0]) * t)
        g = round(c1[1] + (c2[1] - c1[1]) * t)
        b = round(c1[2] + (c2[2] - c1[2]) * t)
        for x in range(size):
            px[x, y] = (r, g, b, 255)
    return img


def draw_radio_glyph(img, scale=0.34):
    d = ImageDraw.Draw(img)
    w, h = img.size
    cx, cy = w / 2, h / 2
    r = w * scale
    # concentric "broadcast" arcs + center dot, reads as a simple radio-tower mark
    for i, factor in enumerate([1.0, 0.68, 0.36]):
        bbox = [cx - r * factor, cy - r * factor, cx + r * factor, cy + r * factor]
        d.arc(bbox, start=200, end=340, fill=WHITE, width=max(int(w * 0.02), 2))
    dot_r = w * 0.05
    d.ellipse([cx - dot_r, cy - dot_r, cx + dot_r, cy + dot_r], fill=WHITE)


# 1. App icon (1024x1024, opaque, no transparency per store guidelines)
icon = gradient_square(1024, VIOLET, MAGENTA)
draw_radio_glyph(icon)
icon.convert("RGB").save(f"{OUT}/icon.png")

# 2. Splash screen (dark background, centered mark)
splash = Image.new("RGBA", (1242, 2436), DUSK)
mark = gradient_square(360, VIOLET, MAGENTA)
draw_radio_glyph(mark)
mask = Image.new("L", mark.size, 0)
ImageDraw.Draw(mask).ellipse([0, 0, mark.size[0], mark.size[1]], fill=255)
splash.paste(mark, ((1242 - 360) // 2, (2436 - 360) // 2), mask)
splash.convert("RGB").save(f"{OUT}/splash.png")

# 3. Android adaptive icon foreground (transparent bg, mark inset so it isn't
#    clipped by the OS's circular/square/rounded-square adaptive mask)
adaptive = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
inset_mark = gradient_square(560, VIOLET, MAGENTA)
draw_radio_glyph(inset_mark)
inset_mask = Image.new("L", inset_mark.size, 0)
ImageDraw.Draw(inset_mask).ellipse([0, 0, inset_mark.size[0], inset_mark.size[1]], fill=255)
adaptive.paste(inset_mark, ((1024 - 560) // 2, (1024 - 560) // 2), inset_mask)
adaptive.save(f"{OUT}/adaptive-icon.png")

# 4. Notification icon: Android requires a flat WHITE-on-transparent silhouette
notif = Image.new("RGBA", (288, 288), (0, 0, 0, 0))
nd = ImageDraw.Draw(notif)
cx, cy = 144, 144
for factor in [1.0, 0.68, 0.36]:
    r = 100 * factor
    nd.arc([cx - r, cy - r, cx + r, cy + r], start=200, end=340, fill=WHITE, width=14)
nd.ellipse([cx - 14, cy - 14, cx + 14, cy + 14], fill=WHITE)
notif.save(f"{OUT}/notification-icon.png")

print("Generated icon.png, splash.png, adaptive-icon.png, notification-icon.png")
