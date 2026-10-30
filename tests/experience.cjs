const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});const p=await browser.newPage({viewport:{width:390,height:844}});const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());
await p.goto('http://127.0.0.1:8017/');await p.screenshot({path:'/tmp/rectoria-new-mobile.png',fullPage:true});
await p.locator('.profile-trigger').click();await p.locator('[data-person="Nata"]').click();await p.waitForTimeout(60);assert.ok((await p.locator('h1').innerText()).includes('Nata'));
await p.locator('.daily-start').click();await p.waitForSelector('.question-text');assert.equal(await p.locator('.grid-numbers button').count(),20);assert.equal(await p.locator('.journey-panel').getAttribute('open'),null);await p.screenshot({path:'/tmp/rectoria-new-exam.png',fullPage:true});
await p.locator('.journey-toggle').click();await p.locator('[data-action="finish"]').click();await p.waitForSelector('.result-summary');assert.ok((await p.locator('.result-summary').innerText()).includes('Nata'));await p.screenshot({path:'/tmp/rectoria-new-result.png',fullPage:true});
await p.goto('http://127.0.0.1:8017/#biblioteca');await p.locator('[data-unseen]').click();assert.equal(await p.locator('.unseen-item').count(),960);
await p.goto('http://127.0.0.1:8017/#practicar');await p.selectOption('#mode','study');await p.locator('#start-form button').click();await p.waitForSelector('.question-text');await p.locator('[data-answer="0"]').click();await p.locator('[data-action="check"]').click();await p.waitForSelector('.feedback h3');assert.ok((await p.locator('.feedback').innerText()).includes('Por qué esta es la respuesta'));await p.locator('.feedback [data-mark]').click();await p.waitForSelector('.feedback');
await p.locator('.mobile-settings summary').click();await p.locator('#theme').click();await p.waitForTimeout(60);await p.screenshot({path:'/tmp/rectoria-new-dark.png',fullPage:true});
await p.goto('http://127.0.0.1:8017/');await p.setViewportSize({width:1440,height:1000});await p.screenshot({path:'/tmp/rectoria-new-desktop.png',fullPage:true});
for(const width of [320,390,820,1440]){await p.setViewportSize({width,height:900});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Desbordamiento ${width}`);}
assert.deepEqual(errors,[]);await browser.close();console.log('PASS: perfil por diálogo, sesión rápida, recorrido plegable, resultados personalizados, preguntas pendientes y anchos 320/390/820/1440.');
})().catch(e=>{console.error(e);process.exit(1)});
