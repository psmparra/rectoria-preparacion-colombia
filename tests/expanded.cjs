const assert=require('node:assert/strict');const {chromium}=require('playwright');const bank=require('../bank.json');const {validateBank,score}=require('../core');
assert.equal(bank.questions.length,980);assert.equal(bank.situations.length,295);assert.deepEqual(validateBank(bank),[]);
for(let exam=0;exam<7;exam++)assert.equal(bank.questions.filter(q=>q.id>exam*140&&q.id<=(exam+1)*140).length,140);
assert.equal(score(bank.questions.slice(0,140),Object.fromEntries(bank.questions.slice(0,127).map(q=>[q.id,q.correct]))).correct,127);
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:390,height:844}});const faults=[];page.on('pageerror',e=>faults.push(e.message));page.on('dialog',d=>d.accept());
 await page.goto('http://127.0.0.1:8017/');
 // Migración del progreso y del banco almacenado de la versión inicial.
 await page.evaluate(b=>{localStorage.setItem('rectoria.v1',JSON.stringify({goal:95,marks:[1],attempts:[],session:null,theme:'light'}));localStorage.setItem('rectoria.bank.v1',JSON.stringify({...b,questions:b.questions.slice(0,140),situations:b.situations.filter(s=>!s.id.startsWith('S'))}));},bank);
 await page.reload();await page.goto('http://127.0.0.1:8017/#biblioteca');assert.ok((await page.locator('main').innerText()).includes('980 ítems'));assert.equal(await page.locator('.review-item').count(),1);
 const seen=new Set();
 for(let i=0;i<7;i++){
   await page.goto('http://127.0.0.1:8017/#practicar');await page.selectOption('#count','140');await page.locator('#start-form button').click();await page.waitForSelector('.question-text');
   const s=await page.evaluate(()=>JSON.parse(localStorage.getItem('rectoria.v1')).profiles.Mao.session);assert.equal(s.ids.length,140);for(const id of s.ids){assert.ok(!seen.has(id),'Repetición dentro del ciclo');seen.add(id);}
   await page.locator('.journey-toggle').click();await page.locator('[data-action="finish"]').click();await page.waitForSelector('.stats');
 }
 assert.equal(seen.size,980);await page.selectOption('#profile-select','Nata');await page.reload();assert.equal(await page.locator('#profile-select').inputValue(),'Nata');
 await page.goto('http://127.0.0.1:8017/#practicar');assert.ok((await page.locator('main').innerText()).includes('Nata: 980'));
 await page.selectOption('#profile-select','Mao');await page.goto('http://127.0.0.1:8017/#practicar');assert.ok((await page.locator('main').innerText()).includes('Mao: 0'));
 await page.locator('#start-form button').click();await page.waitForSelector('.question-text');assert.equal(await page.locator('.grid-numbers button').count(),20);
 const promise=page.waitForEvent('download');await page.locator('.mobile-settings summary').click();await page.locator('#export').click();const download=await promise;await download.saveAs('/tmp/rectoria-expanded-backup.json');await page.locator('#restore').setInputFiles('/tmp/rectoria-expanded-backup.json');await page.waitForTimeout(150);assert.ok((await page.locator('#toast').innerText()).includes('recuperado'));
 for(const width of [390,1440]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 assert.deepEqual(faults,[]);console.log('PASS: banco 980, migración, 7×140 sin repetir, perfiles independientes, nuevo ciclo, respaldo/restauración y responsive.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
