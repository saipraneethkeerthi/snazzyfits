import {test} from 'node:test';import assert from 'node:assert/strict';import {normalizeProduct} from './catalog.js';
test('preserves store identifiers and prices using the declared currency precision',()=>{
 const p=normalizeProduct({id:4,slug:'tee',name:'Women&#8217;s Tee',permalink:'https://snazzyfits.in/product/tee/',prices:{price:'74900',regular_price:'99900',currency_minor_unit:2,currency_code:'INR'},images:[{src:'https://snazzyfits.in/tee.webp'}],average_rating:'4.5',review_count:2,is_in_stock:true,attributes:[],categories:[]});
 assert.equal(p.price,749);assert.equal(p.regularPrice,999);assert.equal(p.id,4);assert.equal(p.name,'Women’s Tee');assert.equal(p.rating,4.5);assert.equal(p.url,'https://snazzyfits.in/product/tee/');
});
