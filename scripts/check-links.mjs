import fs from 'node:fs/promises';
const products=JSON.parse(await fs.readFile('src/data/products.json','utf8'));
const store='https://snazzyfits.in';
const urls=[...products.map(p=>p.url),...['cart','login','products','about-us','contact-us','refund-policy','shipping-policy','privacy-policy','terms-of-services','contact-information'].map(p=>`${store}/${p}/`)];
const results=await Promise.all(urls.map(async url=>{try{const r=await fetch(url,{method:'HEAD',signal:AbortSignal.timeout(15000)});return {url,status:r.status};}catch(e){return {url,error:e.message};}}));
for(const result of results.filter(r=>r.error||r.status>=400)){try{const r=await fetch(result.url,{signal:AbortSignal.timeout(15000)});result.status=r.status;delete result.error;await r.body?.cancel();}catch(e){result.error=e.message;}}
await fs.writeFile('qa/link-check.json',JSON.stringify(results,null,2));
const failed=results.filter(r=>r.error||r.status>=400);console.log(`${results.length-failed.length}/${results.length} existing store links returned successful responses.`);if(failed.length){console.log(failed);process.exitCode=1;}
