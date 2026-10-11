"""V5 Chromium page checks, synthetic touch/pointer input. Not Android real-device validation."""
from pathlib import Path
from playwright.sync_api import sync_playwright

HTML=Path(__file__).resolve().parents[1]/'prototype'/'action-lab-v5.html'
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-gpu'])
    page=browser.new_page(viewport={'width':390,'height':844},has_touch=True,is_mobile=True)
    errors=[]
    page.on('pageerror',lambda e: errors.append(str(e)))
    page.set_content(HTML.read_text(encoding='utf-8'),wait_until='load')
    n=0
    def check(message,condition):
        global n
        assert condition, 'FAIL '+message
        n+=1;print('PASS',n,message,flush=True)
    check('V5 controls are visible',page.locator('#incoming').is_visible() and page.locator('#forced-hit').is_visible())
    check('cancel and armor toggles exist',page.locator('#armor').count()==1 and page.locator('#cancel').count()==1)
    page.locator('[data-attack="highSlash"]').dispatch_event('pointerdown')
    page.wait_for_timeout(30)
    page.locator('#incoming').click()
    check('high slash windup is interrupted', '受击打断动作：高位斩' in page.locator('#log').inner_text())
    page.wait_for_function("document.getElementById('phase').textContent==='待命'",timeout=2000)
    check('phase returns to idle on interruption',page.locator('#phase').inner_text()=='待命')
    page.locator('#reset').click()
    page.locator('[data-attack="launcher"]').dispatch_event('pointerdown')
    page.wait_for_function("document.getElementById('phase').textContent.includes('霸体')",timeout=2000)
    check('launcher active has action armor', '霸体' in page.locator('#phase').inner_text())
    page.locator('#incoming').click()
    check('regular incoming hit resisted', '霸体抗打断' in page.locator('#log').inner_text())
    page.locator('#forced-hit').click()
    check('forced interruption overrides armor','受击打断动作：上挑' in page.locator('#log').inner_text())
    page.wait_for_function("document.getElementById('phase').textContent==='待命'",timeout=2000)
    check('force interruption ends action',page.locator('#phase').inner_text()=='待命')
    page.locator('#reset').click()
    page.locator('[data-attack="launcher"]').dispatch_event('pointerdown')
    page.wait_for_function("document.getElementById('phase').textContent==='后摇'",timeout=2000)
    page.wait_for_timeout(120)
    page.locator('[data-attack="airTap"]').dispatch_event('pointerdown')
    check('recovery cancel event logged','后摇取消：上挑 → 空追' in page.locator('#log').inner_text())
    page.locator('#reset').click()
    page.locator('summary').click()
    page.locator('#cancel').uncheck()
    check('cancel toggle disabled', not page.locator('#cancel').is_checked())
    page.locator('summary').click()
    page.locator('[data-attack="launcher"]').dispatch_event('pointerdown')
    page.wait_for_function("document.getElementById('phase').textContent==='后摇'",timeout=2000)
    page.wait_for_timeout(120)
    page.locator('[data-attack="airTap"]').dispatch_event('pointerdown')
    check('disabled cancel queues instead', '输入排队：空追' in page.locator('#log').inner_text())
    check('no JavaScript page errors', not errors)
    print('SUMMARY',n,'PASS',flush=True)
    browser.close()
