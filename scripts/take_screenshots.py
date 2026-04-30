from playwright.sync_api import sync_playwright
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "images"
OUT.mkdir(exist_ok=True)

PAGES = [
    ("home", "/"),
    ("about", "/about"),
    ("blog-index", "/blog"),
]
BASE = "https://abc1231qa.cc"

VIEWPORTS = [
    ("", {"width": 1920, "height": 1080}),
    ("-mobile", {"width": 390, "height": 844, "is_mobile": True}),
]

def shoot(page, url, path):
    page.goto(url, wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(800)
    page.screenshot(path=str(path), full_page=True, type="jpeg", quality=85)
    print(f"  -> {path.name}")

with sync_playwright() as p:
    browser = p.chromium.launch()
    for suffix, vp in VIEWPORTS:
        is_mobile = vp.pop("is_mobile", False)
        ctx = browser.new_context(viewport=vp, is_mobile=is_mobile, device_scale_factor=2 if is_mobile else 1)
        page = ctx.new_page()
        print(f"viewport {vp['width']}x{vp['height']}{suffix or ' (desktop)'}")
        for name, path in PAGES:
            shoot(page, BASE + path, OUT / f"{name}{suffix}.jpg")
        ctx.close()
    browser.close()
print("done")
