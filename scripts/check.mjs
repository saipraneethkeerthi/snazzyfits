import fs from 'node:fs';import assert from 'node:assert/strict';
const products=JSON.parse(fs.readFileSync('src/data/products.json','utf8'));
assert.equal(new Set(products.map(p=>p.id)).size,products.length,'Catalog must have unique IDs');
for(const p of products){assert.ok(fs.existsSync(`public${p.image}`),`Missing image for ${p.id}`);assert.ok(p.price>0);assert.ok(p.url.startsWith('https://snazzyfits.in/product/'));}
const homeIds=[3792,3719,3661,3679,3478,3294,3807,3692];assert.equal(new Set(homeIds).size,homeIds.length,'Homepage product sections must not duplicate products');
for(const id of homeIds)assert.ok(products.some(p=>p.id===id));
console.log(`Checked ${products.length} unique products, local images, store links and non-overlapping homepage sections.`);
