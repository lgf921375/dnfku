"""Chromium UI smoke checks for the original V4 action-lab page; simulated input only."""
from pathlib import Path
from playwright.sync_api import sync_playwright

HTML = Path(__file__).resolve().parents[1] / 'prototype' / 'action-lab.html'
N = 0

def check(label, passes):
    global N
    if not passes: raise AssertionError(f'FAIL: {label}')
    N+=1
    print(f'PASS {N}: {label}', flush=True)

with sync_playwright() as p:
    br=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-gpu'])
    page=br.new_page(viewport={'width':390,'height':844},has_touch=True,is_mobile=True)
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(HTML.read_text(),wait_until='load')
    check('V4 action scene loaded',page.locator('#field').is_visible() and page.locator('#phase').inner_text()=='待命')
    page.locator('[data-attack="launcher"]').dispatch_event('pointerdown')
    page.wait_for_timeout(25)
    check('startup begins before impact',page.locator('#phase').inner_text()=='前摇' and page.locator('#hit-count').inner_text().startswith('0'))
    page.wait_for_timeout(165)
    check('action startup proceeds into impact/recovery',page.locator('#log').inner_text().count('有效帧 上挑 → 命中')==1)
    page.wait_for_timeout(280)
    check('one successful hit only',page.locator('#log').inner_text().count('有效帧 上挑 → 命中')==1)
    page.locator('#reset').click()
    page.locator('[data-attack="launcher"]').dispatch_event('pointerdown')
    page.wait_for_timeout(270)
    page.locator('[data-attack="airTap"]').dispatch_event('pointerdown')
    check('input buffer event logged', '输入排队：空追' in page.locator('#log').inner_text())
    page.wait_for_timeout(440)
    check('buffered followup consumed', '缓冲输入已出队：空追' in page.locator('#log').inner_text())
    page.locator('#reset').click()
    page.locator('summary').click()
    page.locator('[data-key="startup"]').fill('0.2')
    check('startup slider updates',page.locator('#windup-val').inner_text()=='200 ms')
    page.locator('[data-key="hitstop"]').fill('0.07')
    check('hitstop slider updates',page.locator('#stop-val').inner_text()=='70 ms')
    page.locator('#bilateral').uncheck()
    check('unilateral mode toggle is interactive',not page.locator('#bilateral').is_checked())
    page.locator('#bilateral').check()
    page.locator('[data-key="startup"]').fill('0.1')
    page.locator('[data-key="hitstop"]').fill('0.04')
    page.locator('summary').click()
    page.locator('#autoplay').click()
    page.wait_for_timeout(3650)
    log=page.locator('#log').inner_text()
    status=page.locator('#headline').inner_text()
    check('autoplay finishes with protection', '自动连招完成' in status and '扫地保护起身' in status)
    check('autoplay has forced stand record', '连击保护：立即起身' in log)
    check('no script errors',not errors)
    print(f'SUMMARY {N}/{N} PASS, pageerrors={errors}',flush=True)
    page.screenshot(path='/mnt/data/dnfku-v4-mobile-preview.png',full_page=True)
    br.close()
