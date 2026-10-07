import fs from 'node:fs/promises';
import sharp from 'sharp';
const raw=JSON.parse(await fs.readFile('research/catalog-source.json','utf8'));
await fs.mkdir('public/images',{recursive:true}); await fs.mkdir('src/data',{recursive:true});
const decode=s=>s.replace(/&#8217;/g,'’').replace(/&amp;/g,'&');
const products=await Promise.all(raw.map(async p=>{
 const path=`/images/product-${p.id}.webp`;
 const buffer=Buffer.from(await(await fetch(p.images[0].src)).arrayBuffer());
 await sharp(buffer).rotate().resize(800,1000,{fit:'inside',withoutEnlargement:true}).webp({quality:82}).toFile(`public${path}`);
 await sharp(buffer).rotate().resize(400,500,{fit:'inside',withoutEnlargement:true}).webp({quality:78}).toFile(`public/images/product-${p.id}-small.webp`);
 return {id:p.id,slug:p.slug,name:decode(p.name),url:p.permalink,image:path,originalImage:p.images[0].src,price:Number(p.prices.price)/10**p.prices.currency_minor_unit,regularPrice:Number(p.prices.regular_price)/10**p.prices.currency_minor_unit,currency:p.prices.currency_code,rating:Number(p.average_rating),reviewCount:p.review_count,inStock:p.is_in_stock,type:p.type,attributes:p.attributes,categories:p.categories,description:decode(p.short_description||p.description),fetchedAt:new Date().toISOString()};
}));
await fs.writeFile('src/data/products.json',JSON.stringify(products,null,2));
const thumbs=await Promise.all(products.map(async(p,i)=>({input:await sharp(`public${p.image}`).resize(180,220,{fit:'contain',background:'#eeeeee'}).png().toBuffer(),left:(i%6)*180,top:Math.floor(i/6)*250})));
await sharp({create:{width:1080,height:Math.ceil(products.length/6)*250,channels:3,background:'#ffffff'}}).composite(thumbs).png().toFile('contact-sheet.png');
console.log(`Downloaded and optimized ${products.length} real product images.`);
