"""Generate a short demo video of a chatbot on a fictional client site."""

from pathlib import Path

import imageio.v2 as imageio
import imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "media"
OUT_DIR.mkdir(exist_ok=True)
OUT_MP4 = OUT_DIR / "willow-grove-chatbot-v5.mp4"

W, H = 960, 600
FPS = 12

# Willow & Grove — garden nursery (distinct from ClearPathAI)
BG = (245, 242, 236)
PANEL = (252, 250, 246)
INK = (34, 48, 36)
MUTED = (92, 108, 94)
ACCENT = (46, 107, 68)
ACCENT_DIM = (226, 238, 228)
LINE = (210, 216, 208)
USER_BG = (236, 232, 224)
HEADER = (236, 243, 236)
WHITE = (255, 255, 255)
WASH_A = (46, 107, 68)
WASH_B = (120, 150, 110)
CARD_A = (232, 240, 232)
CARD_B = (238, 234, 224)
CARD_C = (228, 236, 242)


def font(size, bold=False):
    candidates = [
        "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/calibri.ttf",
    ]
    if bold:
        candidates = [
            "C:/Windows/Fonts/segoeuib.ttf",
            "C:/Windows/Fonts/arialbd.ttf",
        ] + candidates
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


F_TITLE = font(22, bold=True)
F_H3 = font(18, bold=True)
F_SMALL = font(14)
F_BODY = font(16)
F_TINY = font(12)
F_BRAND = font(26, bold=True)


def rounded(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def wrap(text, max_chars):
    words = text.split()
    lines, cur = [], ""
    for word in words:
        trial = f"{cur} {word}".strip()
        if len(trial) <= max_chars:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    return lines


def fit_text(draw, text, font, max_width):
    """Keep typed text inside the input; show the trailing end if it’s long."""
    if not text:
        return ""
    try:
        width_of = lambda s: draw.textlength(s, font=font)
    except Exception:
        width_of = lambda s: font.getlength(s) if hasattr(font, "getlength") else len(s) * 8

    if width_of(text) <= max_width:
        return text
    for i in range(1, len(text)):
        candidate = "…" + text[i:]
        if width_of(candidate) <= max_width:
            return candidate
    return text[-1]


def draw_site(chat_open, messages, typing="", cursor=None, toggle_pulse=0.0):
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    for i in range(8):
        alpha = 14 - i
        overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        od = ImageDraw.Draw(overlay)
        od.ellipse((-60 + i * 3, -100, 380, 240), fill=(*WASH_A, alpha))
        od.ellipse((520, -20, 1100, 280), fill=(*WASH_B, max(alpha - 4, 0)))
        img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
        draw = ImageDraw.Draw(img)

    # Header
    draw.rectangle((0, 0, W, 54), fill=HEADER)
    draw.line((0, 54, W, 54), fill=LINE, width=1)
    draw.text((28, 12), "Willow & Grove", font=F_BRAND, fill=INK)
    draw.text((520, 20), "Plants   Workshops   Visit", font=F_SMALL, fill=MUTED)

    # Hero
    draw.text((28, 78), "Neighborhood nursery", font=F_TINY, fill=ACCENT)
    draw.text((28, 100), "Soil, starts, and weekend help", font=F_TITLE, fill=INK)
    draw.text((28, 128), "for city gardeners.", font=F_TITLE, fill=INK)
    draw.text((28, 168), "Local delivery and workshops that fit a small yard.", font=F_BODY, fill=MUTED)

    rounded(draw, (28, 214, 148, 250), 8, ACCENT)
    draw.text((48, 224), "Shop plants", font=F_SMALL, fill=WHITE)
    rounded(draw, (160, 214, 292, 250), 8, BG, outline=LINE, width=1)
    draw.text((174, 224), "Class schedule", font=F_SMALL, fill=INK)

    # Two content blocks under the buttons
    rounded(draw, (28, 280, 268, 430), 12, CARD_A, outline=LINE, width=1)
    draw.rectangle((28, 280, 268, 334), fill=(224, 234, 224))
    draw.text((44, 348), "Cedar raised beds", font=F_BODY, fill=INK)
    draw.text((44, 374), "4×4 and 4×8 in stock", font=F_SMALL, fill=MUTED)
    draw.text((44, 398), "From $129 · local delivery", font=F_SMALL, fill=ACCENT)

    rounded(draw, (288, 280, 528, 430), 12, CARD_B, outline=LINE, width=1)
    draw.rectangle((288, 280, 528, 334), fill=(230, 224, 214))
    draw.text((304, 348), "This week in the yard", font=F_BODY, fill=INK)
    draw.text((304, 374), "Tomato starts · Soil drop-offs", font=F_SMALL, fill=MUTED)
    draw.text((304, 398), "Open Tue–Sun", font=F_SMALL, fill=ACCENT)

    # More page below the fold (clipped)
    draw.text((28, 470), "How delivery works", font=F_H3, fill=INK)
    draw.text((28, 502), "We stage beds at the curb, call ahead, and haul soil bags to the spot…", font=F_BODY, fill=MUTED)
    draw.text((28, 536), "Seasonal guide  ·  Workshop archive  ·  Wholesale", font=F_SMALL, fill=(150, 160, 150))
    draw.text((28, 568), "Visit us at 418 Grove Avenue", font=F_SMALL, fill=(150, 160, 150))

    # Soft fade suggesting more page below
    fade = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    fd = ImageDraw.Draw(fade)
    for i, a in enumerate((0, 25, 60, 100, 140)):
        y0 = H - 36 + i * 5
        fd.rectangle((0, y0, W, H), fill=(*BG, a))
    img = Image.alpha_composite(img.convert("RGBA"), fade).convert("RGB")
    draw = ImageDraw.Draw(img)

    # Chat launcher
    bx1, by1, bx2, by2 = 700, 528, 924, 570
    pulse = int(6 * toggle_pulse)
    if toggle_pulse > 0 and not chat_open:
        ring = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        rd = ImageDraw.Draw(ring)
        alpha = int(70 * (1 - toggle_pulse * 0.35))
        rd.rounded_rectangle(
            (bx1 - 8 - pulse, by1 - 8 - pulse, bx2 + 8 + pulse, by2 + 8 + pulse),
            radius=28,
            outline=(*ACCENT, alpha),
            width=2,
        )
        img = Image.alpha_composite(img.convert("RGBA"), ring).convert("RGB")
        draw = ImageDraw.Draw(img)
    if not chat_open:
        rounded(draw, (bx1, by1, bx2, by2), 22, ACCENT)
        draw.text((bx1 + 40, by1 + 10), "Chat with us", font=F_BODY, fill=WHITE)

    if chat_open:
        px1, py1, px2, py2 = 548, 70, 936, 520
        rounded(draw, (px1, py1, px2, py2), 16, PANEL, outline=LINE, width=1)
        draw.rectangle((px1, py1, px2, py1 + 56), fill=PANEL)
        draw.line((px1, py1 + 56, px2, py1 + 56), fill=LINE, width=1)
        draw.text((px1 + 16, py1 + 10), "GARDEN ASSISTANT", font=F_TINY, fill=ACCENT)
        draw.text((px1 + 16, py1 + 28), "Ask Willow & Grove", font=F_BODY, fill=INK)
        draw.text((px2 - 54, py1 + 20), "Close", font=F_SMALL, fill=MUTED)

        y = py1 + 70
        max_y = py2 - 68
        visible = []
        for who, text in messages:
            lines = wrap(text, 32)
            bubble_h = 16 + len(lines) * 18
            visible.append((who, lines, bubble_h))
        while visible:
            total = sum(item[2] + 10 for item in visible)
            if y + total <= max_y:
                break
            visible.pop(0)

        for who, lines, bubble_h in visible:
            if who == "bot":
                bx = px1 + 14
                bw = 300
                rounded(draw, (bx, y, bx + bw, y + bubble_h), 11, ACCENT_DIM, outline=(170, 198, 176))
            else:
                bw = 280
                bx = px2 - 14 - bw
                rounded(draw, (bx, y, bx + bw, y + bubble_h), 11, USER_BG, outline=LINE)
            ty = y + 7
            for line in lines:
                draw.text((bx + 10, ty), line, font=F_SMALL, fill=INK)
                ty += 18
            y += bubble_h + 10

        input_left, input_right = px1 + 12, px2 - 86
        rounded(draw, (input_left, py2 - 56, input_right, py2 - 18), 16, BG, outline=LINE, width=1)
        caret_on = typing != "" and (int(toggle_pulse * 10) % 2 == 0)
        raw = typing + ("|" if caret_on else "") if typing else ""
        max_input_w = input_right - input_left - 28
        shown = fit_text(draw, raw if raw else "Type a message…", F_SMALL, max_input_w)
        draw.text(
            (input_left + 14, py2 - 44),
            shown,
            font=F_SMALL,
            fill=INK if typing else (150, 150, 150),
        )
        rounded(draw, (px2 - 74, py2 - 52, px2 - 16, py2 - 22), 12, ACCENT)
        draw.text((px2 - 58, py2 - 44), "Send", font=F_SMALL, fill=WHITE)

    if cursor:
        cx, cy = cursor
        pts = [
            (cx, cy),
            (cx, cy + 18),
            (cx + 5, cy + 14),
            (cx + 10, cy + 22),
            (cx + 13, cy + 20),
            (cx + 7, cy + 12),
            (cx + 14, cy + 12),
        ]
        draw.polygon(pts, fill=INK, outline=WHITE)

    return img


def lerp(a, b, t):
    return a + (b - a) * t


def frames():
    greeting = (
        "bot",
        "Hi — I’m the Willow & Grove garden assistant. Need help with plants, beds, or delivery?",
    )
    user_q1 = "Do you deliver raised beds?"
    bot_a1 = (
        "bot",
        "Yes — within 12 miles, Tue–Sat. Cedar 4×8 is in stock, usually 2–3 days out.",
    )
    user_q2 = "Could you do a 4×8 this Thursday?"
    bot_a2 = (
        "bot",
        "Thursday works if we lock it by noon tomorrow. Want me to start the order?",
    )

    def type_line(prior_msgs, text):
        typed = ""
        for ch in text:
            typed += ch
            for _ in range(2):
                yield draw_site(True, prior_msgs, typed, cursor=None, toggle_pulse=0.12)
        for _ in range(4):
            yield draw_site(True, prior_msgs, typed, cursor=None, toggle_pulse=0.15)

    # 0–2s: click Chat with us, then cursor disappears
    for i in range(8):
        yield draw_site(False, [], "", cursor=(820, 510), toggle_pulse=(i % 8) / 8)

    for i in range(6):
        t = i / 5
        yield draw_site(
            False,
            [],
            "",
            cursor=(int(lerp(820, 800, t)), int(lerp(510, 548, t))),
            toggle_pulse=0.5,
        )

    for i in range(3):
        yield draw_site(False, [], "", cursor=(800, 548), toggle_pulse=1.0)

    # Chat open — no cursor for the rest of the conversation
    for i in range(6):
        msgs = [greeting] if i > 1 else []
        yield draw_site(True, msgs, "", cursor=None, toggle_pulse=0.0)

    for i in range(10):
        yield draw_site(True, [greeting], "", cursor=None, toggle_pulse=0.0)

    yield from type_line([greeting], user_q1)

    msgs = [greeting, ("user", user_q1)]
    for i in range(7):
        yield draw_site(True, msgs, "", cursor=None, toggle_pulse=0.0)

    msgs = [greeting, ("user", user_q1), bot_a1]
    for i in range(20):
        yield draw_site(True, msgs, "", cursor=None, toggle_pulse=0.0)

    yield from type_line(msgs, user_q2)

    msgs = [greeting, ("user", user_q1), bot_a1, ("user", user_q2)]
    for i in range(7):
        yield draw_site(True, msgs, "", cursor=None, toggle_pulse=0.0)

    msgs = [greeting, ("user", user_q1), bot_a1, ("user", user_q2), bot_a2]
    for i in range(30):
        yield draw_site(True, msgs, "", cursor=None, toggle_pulse=0.0)

    for i in range(14):
        yield draw_site(True, msgs, "", cursor=None, toggle_pulse=0.0)


def main():
    print("Rendering frames…")
    frame_list = [__import__("numpy").asarray(frame) for frame in frames()]
    print(f"{len(frame_list)} frames")

    imageio.mimwrite(
        OUT_MP4,
        frame_list,
        fps=FPS,
        codec="libx264",
        quality=8,
        pixelformat="yuv420p",
        macro_block_size=None,
        ffmpeg_log_level="error",
    )
    print(f"Wrote {OUT_MP4} ({OUT_MP4.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    import os

    os.environ["IMAGEIO_FFMPEG_EXE"] = imageio_ffmpeg.get_ffmpeg_exe()
    main()
