import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const base=process.env.QA_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
 await page.goto(base,{waitUntil:'networkidle'});
 await page.waitForFunction(()=>[...document.querySelectorAll('.hero video')].every(v=>!v.paused&&v.readyState>=2));
 assert.equal(await page.locator('video').count(),3);
 assert.equal(await page.locator('.campaign video').getAttribute('src'),null,'Campaign must not load before approaching it');
 assert.equal(requests.some(url=>url.endsWith('/campaign.webm')),false);
 assert.equal(await page.locator('h1').innerText(),'WEAR\nYOUR\nATTITUDE.');
 await page.evaluate(()=>window.scrollTo({top:350,behavior:'instant'}));await page.waitForTimeout(100);
 const hero=await page.evaluate(()=>({progress:Number(document.querySelector('.hero').style.getPropertyValue('--hero-progress')),headline:getComputedStyle(document.querySelector('.hero h1')).opacity,content:getComputedStyle(document.querySelector('.hero-content>p')).opacity,scale:new DOMMatrixReadOnly(getComputedStyle(document.querySelector('.hero-visual .cinematic-media')).transform).a}));
 assert.ok(hero.progress>0&&hero.progress<1);assert.ok(Number(hero.headline)<1);assert.ok(Number(hero.content)<1);assert.ok(hero.scale>1&&hero.scale<=1.0351);
 await page.getByRole('button',{name:'Pause hero motion'}).click();await page.waitForFunction(()=>[...document.querySelectorAll('.hero video')].every(v=>v.paused));
 await page.getByRole('button',{name:'Play hero motion'}).click();await page.waitForFunction(()=>[...document.querySelectorAll('.hero video')].every(v=>!v.paused));
 await page.locator('.campaign').scrollIntoViewIfNeeded();await page.waitForFunction(()=>{const v=document.querySelector('.campaign video');return !v.paused&&v.readyState>=2;});
 await page.waitForFunction(()=>[...document.querySelectorAll('.hero video')].every(v=>v.paused));
 const parallax=await page.locator('.campaign-photo').evaluate(el=>parseFloat(el.style.getPropertyValue('--parallax-y')));assert.ok(Math.abs(parallax)<=10);
 await page.getByRole('button',{name:'Pause campaign motion'}).click();await page.waitForFunction(()=>document.querySelector('.campaign video').paused);
 for(const index of [1,2]){
  await page.locator('.story-step').nth(index).evaluate(el=>{const r=el.getBoundingClientRect();window.scrollTo({top:scrollY+r.top+r.height/2-innerHeight*.52,behavior:'instant'});});await page.waitForTimeout(150);
  assert.equal(await page.locator('.story-step.story-active').count(),1);
  assert.equal(await page.locator('.story-step').nth(index).evaluate(el=>el.classList.contains('story-active')),true);
  assert.equal(await page.locator('.story-image-label').innerText(),await page.locator('.story-step').nth(index).locator('span').innerText());
  assert.ok(Math.abs((await page.locator('.story-visual').boundingBox()).y-105)<2,'Story visual must remain sticky');
 }
 const videoHandle=await page.$('.hero video');
 await page.locator('.product-card .wishlist-button').first().click();assert.equal(await videoHandle.evaluate(el=>el.isConnected),true,'Wishlist must not remount campaign media');
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>[...document.querySelectorAll('video')].every(v=>v.paused));
 assert.equal(await page.locator('.story').evaluate(el=>el.classList.contains('story-motion')),false);
 assert.equal(await page.locator('.story-image-label').innerText(),'SNAZZYFITS / EVERYDAY, YOUR WAY.');
 assert.equal(await page.locator('.story-visual').evaluate(el=>getComputedStyle(el).clipPath),'none');
 assert.equal(await page.locator('.hero h1').evaluate(el=>getComputedStyle(el).transform),'none');
 assert.equal(await page.locator('.button').first().evaluate(el=>getComputedStyle(el).transitionDuration),'0s');
 assert.equal(await page.locator('.product-card').first().evaluate(el=>getComputedStyle(el).opacity),'1');
 await page.setViewportSize({width:390,height:844});assert.equal(await page.locator('.story-visual').evaluate(el=>getComputedStyle(el).position),'relative');
 await page.emulateMedia({reducedMotion:'no-preference'});await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.waitForFunction(()=>[...document.querySelectorAll('.hero video')].every(v=>!v.paused));
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 const reduced=await browser.newPage({reducedMotion:'reduce'});const reducedVideoRequests=[];reduced.on('request',r=>{if(r.url().endsWith('.webm'))reducedVideoRequests.push(r.url());});await reduced.goto(base,{waitUntil:'networkidle'});
 assert.deepEqual(reducedVideoRequests,[],'Reduced-motion users must never fetch the loops');assert.equal(await reduced.locator('.hero video').first().getAttribute('src'),null);
 await page.locator('.campaign').scrollIntoViewIfNeeded();await page.waitForTimeout(850);assert.equal(await page.locator('.campaign-photo').evaluate(el=>getComputedStyle(el).clipPath),'inset(0px)');
 assert.deepEqual(errors,[]);
 console.log('Motion checks passed: lazy/inline video, scroll effects, pause/offscreen behavior, ≤20px parallax, sticky story, stable wishlist media, mobile stacking and live reduced-motion handling.');
}finally{await browser.close();}
