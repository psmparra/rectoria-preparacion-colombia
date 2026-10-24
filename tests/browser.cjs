const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const bank=require('../bank.json');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 const page=await context.newPage(), errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 const folder='/tmp/rectoria-checks';fs.mkdirSync(folder,{recursive:true});
 const snap=async(name)=>{await page.screenshot({path:`${folder}/${name}.png`,fullPage:true});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Desbordamiento: ${name}`);};
 await page.goto('http://127.0.0.1:8011');await snap('desktop-inicio');
 await page.locator('[data-mode="study"]').click();await page.waitForTimeout(80);assert.equal(await page.locator('#mode').inputValue(),'study');
 await snap('desktop-selector');await page.locator('#start-form button').click();await page.waitForSelector('.question-text');
 const session=await page.evaluate(()=>JSON.parse(localStorage.getItem('rectoria.v1')).session);
 const q=bank.questions.find(q=>q.id===session.ids[0]);
 await page.locator(`[data-answer="${(q.correct+1)%3}"]`).click();await page.locator('[data-action="check"]').click();
 assert.ok(await page.locator('.feedback').textContent());await snap('desktop-feedback');
 await page.locator('[data-mark]').click();await page.reload();assert.equal(await page.locator('.feedback').count(),1);
 await snap('desktop-examen');await page.locator('[data-action="finish"]').click();await page.waitForSelector('.stats');await snap('desktop-resultados');
 let state=await page.evaluate(()=>JSON.parse(localStorage.getItem('rectoria.v1')));assert.equal(state.attempts.length,1);assert.equal(state.attempts[0].result.correct,0);assert.equal(state.attempts[0].result.answered,1);
 await page.locator('a[href="#historial"]').first().click();await snap('desktop-historial');
 await page.locator('a[href="#biblioteca"]').first().click();await snap('desktop-biblioteca');assert.equal(await page.locator('.review-item').count(),1);
 await page.locator('[data-tab="errors"]').click();assert.equal(await page.locator('.review-item').count(),20);
 await page.goto('http://127.0.0.1:8011/#practicar');await page.selectOption('#mode','reinforce');await page.locator('#start-form button').click();await page.waitForSelector('.question-text');
 let s=await page.evaluate(()=>JSON.parse(localStorage.getItem('rectoria.v1')).session);assert.equal(s.mode,'reinforce');assert.equal(s.ids.length,20);
 await page.locator('[data-action="finish"]').click();await page.waitForSelector('.stats');
 await page.goto('http://127.0.0.1:8011/#practicar');await page.selectOption('#mode','exam');await page.selectOption('#count','140');await page.locator('#start-form button').click();await page.waitForSelector('.question-text');assert.equal(await page.locator('.grid-numbers button').count(),140);assert.equal(await page.locator('.feedback').count(),0);
 await page.locator('[data-answer="0"]').click();await page.locator('[data-step="1"]').click();await page.locator('[data-step="-1"]').click();assert.equal(await page.locator('.option.selected').count(),1);
 await page.locator('#theme').click();await snap('desktop-dark');
 await page.setViewportSize({width:390,height:844});
 for(const route of ['inicio','practicar','examen','biblioteca','resultados','historial']){await page.goto(`http://127.0.0.1:8011/#${route}`);await snap('mobile-'+route);}
 await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('rectoria.v1'));s.theme='light';localStorage.setItem('rectoria.v1',JSON.stringify(s));});await page.reload();await snap('mobile-light');
 const downloadPromise=page.waitForEvent('download');await page.setViewportSize({width:1440,height:1000});await page.locator('#export').click();const dl=await downloadPromise;await dl.saveAs(`${folder}/backup.json`);const backup=JSON.parse(fs.readFileSync(`${folder}/backup.json`));assert.equal(backup.bank.questions.length,140);
 await page.locator('#restore').setInputFiles(`${folder}/backup.json`);await page.waitForTimeout(100);assert.ok((await page.locator('#toast').textContent()).includes('recuperado'));
 // Abre directamente el HTML sin servidor y sin acceso a Internet.
 const offline=await browser.newContext();const direct=await offline.newPage();await direct.goto('http://127.0.0.1:8011/');await offline.setOffline(true);await direct.locator('[data-mode="exam"]').click();await direct.locator('#start-form button').click();await direct.waitForSelector('.question-text');
 const sizes=await browser.newContext();const sizing=await sizes.newPage();
 for(const n of [20,40,70,140]){await sizing.goto('http://127.0.0.1:8011/');await sizing.evaluate(()=>localStorage.removeItem('rectoria.v1'));await sizing.reload();await sizing.locator('[data-mode="exam"]').click();await sizing.selectOption('#count',String(n));await sizing.locator('#start-form button').click();await sizing.waitForSelector('.question-text');assert.equal(await sizing.locator('.grid-numbers button').count(),n);}
 await page.setViewportSize({width:390,height:844});await page.locator('.mobile-settings summary').click();assert.ok(await page.locator('#theme').isVisible());await page.locator('#theme').click();await page.locator('.mobile-settings summary').click();
 await page.setViewportSize({width:820,height:1180});await snap('tablet-examen');
 assert.deepEqual(errors,[]);console.log('PASS: tres modalidades, recuperación, marcado, navegación, resultados, exportación/restauración, práctica sin red y 15 capturas sin desbordamientos. Apertura file:// no verificada: política del navegador administrado.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
