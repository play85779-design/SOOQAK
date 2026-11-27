from playwright.sync_api import sync_playwright
from pathlib import Path
from threading import Thread
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from functools import partial
import json,traceback
root=Path('/tmp/sooqak160')
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args): pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(root)))
Thread(target=server.serve_forever,daemon=True).start();base=(root/'index.html').as_uri()
results=[]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 ctx=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,device_scale_factor=1,reduced_motion='reduce')
 page=ctx.new_page(); page.route('https://**/*',lambda r:r.abort());errors=[];writes=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:writes.append(r.url) if r.method not in ['GET','HEAD'] else None)
 def test(name,fn):
  try:fn();results.append([name,'PASS'])
  except Exception as e:results.append([name,'FAIL',str(e)[:450]])
 def check(cond,msg='assertion false'):
  if not cond: raise AssertionError(msg)
 page.set_content((root/'index.html').read_text().replace('<link rel="stylesheet" href="./styles.css">','<style>'+ (root/'styles.css').read_text()+'</style>').replace('<script src="./app.js" defer></script>',''))
 page.evaluate("() => {for (const k of ['pushState','replaceState']) {const native=history[k].bind(history);history[k]=(s,t,u)=>native(s,t,'#'+String(u).split('#').pop())}}");page.add_script_tag(content=(root/'app.js').read_text());page.set_default_timeout(4000)
 def go(route):
  page.evaluate('(r)=>{location.hash=r}',route);page.wait_for_timeout(100);page.locator('main').wait_for();page.evaluate('()=>{document.querySelector("#dialog-root").innerHTML=""}')
 def asset_loaded(locator):
  import base64
  el=locator.element_handle();filename=el.get_attribute('src').split('/')[-1];data=(root/'assets'/filename).read_bytes();uri='data:image/svg+xml;base64,'+base64.b64encode(data).decode();el.evaluate('(im,uri)=>im.src=uri',uri);el.evaluate('im=>im.decode()');return el.evaluate('im=>im.complete&&im.naturalWidth>0')
 def fit():check(page.evaluate('document.documentElement.scrollWidth <= innerWidth+2'),str(page.evaluate('[document.documentElement.scrollWidth,innerWidth]')))
 def all_routes(width):
  page.set_viewport_size({'width':width,'height':844})
  for r in ['home','listings','stores','store/tech','post','favorites','account','auth','my-ads','messages','detail','create-store','services','my-stores','notifications','welcome','role']:
   go(r);fit();check(page.locator('main').inner_text().strip(),r);check(page.evaluate('SOOQAK_V101.getState().route')==r.split('/')[0],r)
 for width in [320,360,390,790,1280]:test('17 routes, width '+str(width),lambda w=width:all_routes(w))
 page.set_viewport_size({'width':390,'height':844});go('home')
 def hero():
  page.locator('[data-hero-slide="1"]').click();check(page.locator('.hero img').get_attribute('src').endswith('market-v151.svg'));check(asset_loaded(page.locator('.hero img')));page.screenshot(path='/mnt/data/sooqak-v160-home-390.png',full_page=True)
 test('market hero renders',hero)
 test('electronics icon loads',lambda:check(asset_loaded(page.locator('.catbar img[src*="tech-icon"]'))))
 def tech():go('store/tech');check(page.locator('.store-cover img').first.get_attribute('src').endswith('tech-v152.svg'));check(asset_loaded(page.locator('.store-cover img').first))
 test('tech cover loads',tech)
 def auth():
  go('auth');pw=page.locator('#auth-password-preview');mail=page.locator('#auth-email-preview');check(pw.get_attribute('readonly') is not None and mail.get_attribute('readonly') is not None);page.locator('[data-action="auth-sample"]').click();check(pw.input_value()=='Demo1234' and pw.get_attribute('type')=='password');page.locator('[data-action="demo-password"]').click();check(pw.get_attribute('type')=='text' and pw.input_value()=='Demo1234');check(pw.evaluate('e=>getComputedStyle(e).webkitTextSecurity')=='none');check(page.locator('[data-action="demo-password"]').get_attribute('aria-pressed')=='true');page.screenshot(path='/mnt/data/sooqak-v160-login-390.png',full_page=True);page.locator('[data-action="demo-password"]').click();check(pw.get_attribute('type')=='password');check(pw.evaluate('e=>getComputedStyle(e).webkitTextSecurity')=='disc')
 test('real browser password show/hide',auth)
 def private():
  page.locator('#auth-password-preview').evaluate("e=>e.value='not-a-demo-secret'");page.locator('[data-action="demo-password"]').click();check(page.locator('#auth-password-preview').input_value()=='');check(page.locator('#auth-password-preview').get_attribute('type')=='password')
 test('unexpected autofill value never revealed',private)
 def submit():
  page.locator('[data-action="auth-sample"]').click();page.locator('#auth-demo-form [type=submit]').click();check('غير مفعل' in page.locator('#dialog-root').inner_text());check(page.locator('#auth-password-preview').input_value()=='')
 test('demo submit no actual account',submit)
 def photo():
  go('post');check(page.locator('#preview-images').get_attribute('multiple') is not None);check(page.locator('#single-image').get_attribute('capture') is None);check(page.locator('#capture-image').get_attribute('capture')=='environment');
  with page.expect_file_chooser() as fc:page.locator('[data-photo-picker="single-image"]').click()
  fc.value.set_files(str(root/'assets/og-v155.png'));check(page.locator('#upload-previews img').count()==1)
  with page.expect_file_chooser() as fc:page.locator('[data-photo-picker="preview-images"]').click()
  fc.value.set_files([str(root/'assets/og-v155.png'),str(root/'assets/og-v155.png')]);check(page.locator('#upload-previews img').count()==3)
  page.screenshot(path='/mnt/data/sooqak-v160-post-390.png',full_page=True)
 test('single and multiple local photo selection',photo)
 def post():
  page.locator('[data-post-next]').click();page.locator('#post-title').fill('شاشة كبيره');page.locator('#post-desc').fill('شاشة ممتازة');page.locator('#post-price').fill('100');page.locator('#post-cat').select_option('إلكترونيات');page.locator('#post-region').select_option('منطقة المدينة المنورة');page.locator('#post-city').select_option('ينبع');page.locator('[data-post-next]').click();check('شاشة كبيره' in page.locator('main').inner_text());page.locator('[data-post-preview]').click();check('شاشة كبيره' in page.locator('main').inner_text())
 test('create local listing',post)
 def search():
  page.locator('#dialog-root [data-action="close"]').first.click();page.locator('.bottom [data-go="home"]').click();page.locator('#search input').fill('شاشة كبيرة');page.locator('#search button').click();check('شاشة كبيره' in page.locator('main').inner_text())
 test('Arabic search of created listing',search)
 def favorite():
  page.locator('.search-primary .card-heart').first.click();page.locator('.bottom [data-go="favorites"]').click();check('شاشة كبيره' in page.locator('main').inner_text())
 test('favorite newly created listing',favorite)
 def merchant():
  go('create-store');page.locator('#store-name').fill('متجر التجربة');page.locator('#store-description').fill('وصف محلي');page.locator('#store-setup-form button[type=submit]').click();check('متجر التجربة' in page.locator('main').inner_text());page.locator('[data-attach-id]').first.click();check('منتجات المتجر (1)' in page.locator('main').inner_text());page.locator('[data-unlink-id]').first.click();check('منتجات المتجر (0)' in page.locator('main').inner_text())
 test('store creation attach and unlink',merchant)
 def advanced():
  go('listings');page.locator('.search-filter-btn').click();page.locator('#advanced-filter-form input[name=min]').fill('50');page.locator('#advanced-filter-form input[name=max]').fill('150');page.locator('#advanced-filter-form input[name=mine]').check();page.locator('#advanced-filter-form button[type=submit]').click();check('شاشة كبيره' in page.locator('main').inner_text())
 test('advanced price and own listing filters',advanced)
 test('no javascript errors',lambda:check(not errors,str(errors)))
 test('no outgoing writes',lambda:check(not writes,str(writes)))
 browser.close()
print(json.dumps(results,ensure_ascii=False,indent=2));Path('/mnt/data/sooqak-v160-qa.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
