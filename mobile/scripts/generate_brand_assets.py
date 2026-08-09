"""
Generates icon/splash/adaptive-icon/notification-icon assets from the official
MV 99.5 FM logo (mobile/uploads/Logo.png). Run whenever the source logo changes.
"""
from PIL import Image, ImageOps

SRC = "uploads/Logo.png"
OUT = "src/assets/images"
ADMIN_OUT = "../admin/public"

WHITE = (255, 255, 255, 255)

logo = Image.open(SRC).convert("RGBA")
bbox = logo.getbbox()
logo_cropped = logo.crop(bbox)
lw, lh = logo_cropped.size
print(f"Cropped logo: {lw}x{lh}")


def paste_centered(canvas, art, margin_ratio):
    cw, ch = canvas.size
    max_w = cw * (1 - margin_ratio * 2)
    max_h = ch * (1 - margin_ratio * 2)
    scale = min(max_w / art.width, max_h / art.height)
    new_size = (round(art.width * scale), round(art.height * scale))
    resized = art.resize(new_size, Image.LANCZOS)
    pos = ((cw - new_size[0]) // 2, (ch - new_size[1]) // 2)
    canvas.paste(resized, pos, resized)
    return canvas


# 1. Full-color source logo, saved into the app's own asset tree (used in-app:
#    About screen, headers, etc.)
logo_cropped.save(f"{OUT}/logo.png")

# 2. App icon — 1024x1024, opaque white background (store icons must not be
#    transparent), logo inset with a comfortable margin.
icon = Image.new("RGBA", (1024, 1024), WHITE)
paste_centered(icon, logo_cropped, margin_ratio=0.12)
icon.convert("RGB").save(f"{OUT}/icon.png")

# 3. Splash screen — logo centered on white (matches the logo's native
#    presentation; app.json's splash.backgroundColor is set to white to match).
splash = Image.new("RGBA", (1242, 2436), WHITE)
paste_centered(splash, logo_cropped, margin_ratio=0.32)
splash.convert("RGB").save(f"{OUT}/splash.png")

# 4. Android adaptive icon foreground — transparent background, logo inset
#    further since ~33% gets cropped by the OS's circular/rounded/square mask.
adaptive = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
paste_centered(adaptive, logo_cropped, margin_ratio=0.24)
adaptive.save(f"{OUT}/adaptive-icon.png")

# 5. Android notification icon — must be a flat WHITE-only silhouette. Use just
#    the mic+bolt mark (precise pixel coords in the *original* uncropped source),
#    not the full "MV 99.5FM" lockup, which turns to illegible mush at status-bar size.
mark = logo.crop((347, 14, 445, 112))
alpha = mark.split()[-1]
silhouette = Image.new("RGBA", mark.size, (0, 0, 0, 0))
white_layer = Image.new("RGBA", mark.size, (255, 255, 255, 255))
silhouette = Image.composite(white_layer, silhouette, alpha)
notif_canvas = Image.new("RGBA", (288, 288), (0, 0, 0, 0))
paste_centered(notif_canvas, silhouette, margin_ratio=0.14)
notif_canvas.save(f"{OUT}/notification-icon.png")

# 6. Admin dashboard favicon (32/64/180px variants from the same source).
for size, name in [(32, "favicon-32.png"), (64, "favicon-64.png"), (180, "apple-touch-icon.png")]:
    fav = Image.new("RGBA", (size, size), WHITE)
    paste_centered(fav, logo_cropped, margin_ratio=0.08)
    try:
        fav.convert("RGB").save(f"{ADMIN_OUT}/{name}")
    except FileNotFoundError:
        pass

print("Generated: logo.png, icon.png, splash.png, adaptive-icon.png, notification-icon.png")
print("Generated admin favicons (if admin/public exists)")
