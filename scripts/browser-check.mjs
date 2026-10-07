import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';import fs from 'node:fs/promises';
const base=process.env.QA_BASE_URL||'http://127.0.0.1:5173';
const browser=await chromium.launch();const page=await browser.newPage();const errors=[];
page.on('pageerror',e=>errors.push(e.message));
await fs.mkdir('qa',{recursive:true});
for(const width of [360,390,430,768,1024,1440,1920]){
 await page.setViewportSize({width,height:900});await page.goto(`${base}/`,{waitUntil:'networkidle'});
 await page.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=650){window.scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,70));}window.scrollTo({top:0,behavior:'instant'});});
 await page.evaluate(async()=>{document.querySelectorAll('img').forEach(i=>i.loading='eager');await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));await document.fonts.ready;});
 await page.waitForTimeout(800);
 const status=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,broken:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src),heading:document.querySelector('h1').getBoundingClientRect().right>innerWidth}));
 assert.equal(status.overflow,false,`Overflow at ${width}`);assert.deepEqual(status.broken,[],`Broken images at ${width}`);assert.equal(status.heading,false,`Heading clips at ${width}`);
 if([390,1440].includes(width))await page.screenshot({path:`qa/home-${width}.png`,fullPage:true});
 console.log(`${width}px: no overflow or broken images`);
}
await page.setViewportSize({width:1440,height:1000});await page.goto(`${base}/`);
await page.locator('.product-card .wishlist-button').first().click();await page.getByRole('link',{name:/Wishlist, 1 saved/}).click();await page.waitForURL('**/wishlist');assert.equal(await page.locator('.product-card').count(),1);
await page.getByRole('button',{name:'Search products'}).click();await page.getByRole('searchbox').fill('tote');assert.equal(await page.locator('.search-result').count(),1);await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').count(),0);await page.waitForFunction(()=>document.querySelector('button[aria-label="Search products"]')===document.activeElement);
await page.goto(`${base}/collections/all`);await page.getByRole('combobox').selectOption('low');const prices=await page.locator('.product-card .price').allTextContents();assert.ok(prices[0].includes('399'));assert.equal(await page.locator('.product-card').count(),24);
await page.locator('.quick-add').first().click();await page.getByRole('dialog').waitFor();await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').count(),0);
await page.goto(`${base}/products/snazzy-unisex-oversized-t-shirt-7/`);await page.locator('.variant-options button').first().click();assert.ok((await page.locator('.purchase-button').getAttribute('href')).includes('attribute_pa_size='));
await page.goto(`${base}/`);await page.locator('#email').fill('test@example.com');await page.locator('.consent input').check();await page.getByRole('button',{name:'Join the list'}).click();await page.locator('.form-message').filter({hasText:/not available/}).waitFor();
await page.emulateMedia({reducedMotion:'reduce'});await page.reload();assert.equal(await page.locator('[data-reveal]').first().evaluate(el=>getComputedStyle(el).opacity),'1');
await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Open navigation'}).click();await page.getByRole('dialog').getByRole('link',{name:'Women',exact:true}).click();await page.waitForURL('**/collections/women');assert.ok(await page.locator('.product-card').count()>0);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
assert.deepEqual(errors,[]);console.log('Wishlist, search, sort, quick add, size selection, newsletter availability, reduced motion, mobile navigation and runtime checks passed.');
await browser.close();
