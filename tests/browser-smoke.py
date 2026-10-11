"""Optional isolated browser smoke test. Requires preinstalled Playwright + Chromium.

Run: python tests/browser-smoke.py
No server, downloads or game assets are required. This injects the standalone
HTML into a headless browser and simulates pointer events; it is not real
Android hardware or human touch testing.
"""
from pathlib import Path
import os

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "prototype" / "standalone.html"
passed = 0


def check(name, condition):
    global passed
    if not condition:
        raise AssertionError(f"FAIL: {name}")
    passed += 1
    print(f"PASS {passed}: {name}", flush=True)


with sync_playwright() as api:
    binary = os.getenv("DNFKU_CHROMIUM") or (
        "/usr/bin/chromium" if Path("/usr/bin/chromium").exists() else None
    )
    opts = {"headless": True, "args": ["--no-sandbox", "--disable-gpu"]}
    if binary:
        opts["executable_path"] = binary
    browser = api.chromium.launch(**opts)
    page = browser.new_page(viewport={"width": 390, "height": 844},
                            has_touch=True, is_mobile=True)
    errors = []
    page.on("pageerror", lambda err: errors.append(str(err)))
    page.set_content(HTML.read_text(encoding="utf-8"), wait_until="load")

    check("controls render on narrow viewport",
          page.locator("#demo").is_visible() and
          page.locator('[data-action="groundSweep"]').is_visible())

    page.locator("summary").click()
    page.locator('[data-param="gravity"]').fill("16")
    check("live gravity adjustment", page.locator("#gravity-val").inner_text() == "16")
    page.locator('[data-param="gravity"]').fill("22")
    page.locator("summary").click()

    page.locator("#demo").click()
    page.wait_for_timeout(3400)
    events = page.locator("#log").inner_text()
    check("autoplay reaches ground-protection stand",
          "自动演示：保护起身已触发" in page.locator("#demo-state").inner_text())
    check("autoplay logs three accepted sweeps", events.count("命中 groundSweep") == 3)
    check("autoplay includes landing", "落地倒地" in events)

    page.locator("#reset").click()
    attack = page.locator('[data-action="launcher"]')
    sweep = page.locator('[data-action="groundSweep"]')
    attack.dispatch_event("pointerdown")
    check("pointerdown starts launch", "浮空" in page.locator("#status").inner_text())
    page.wait_for_timeout(1070)
    check("launch naturally transitions to prone", "倒地" in page.locator("#status").inner_text())

    sweep.dispatch_event("pointerdown")
    sweep.dispatch_event("pointerdown")
    check("immediate duplicate sweep is blocked",
          "hit-cadence" in page.locator("#log").inner_text() and
          "扫地：1/3" in page.locator("#status").inner_text())
    for _ in range(2):
        page.wait_for_timeout(125)
        sweep.dispatch_event("pointerdown")
    check("spaced sweeps trigger forced stand", "保护起身" in page.locator("#status").inner_text())

    attack.dispatch_event("pointerdown")
    check("protection blocks launcher", "protected-invulnerability" in page.locator("#log").inner_text())
    check("no JS page errors", not errors)
    print(f"SUMMARY {passed}/{passed} PASS", flush=True)
    browser.close()
