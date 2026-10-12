/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS is required for this isolated TypeScript test loader. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
// Load the real frontend TypeScript modules; all API traffic below is intercepted.
process.env.NEXT_PUBLIC_API_URL = 'https://api.example.test/';
const root = path.resolve(__dirname, '..');
const resolve = Module._resolveFilename;
Module._resolveFilename = function(request, parent, ...args) {
  return resolve.call(this, request.startsWith('@/') ? path.join(root, 'src', request.slice(2)) : request, parent, ...args);
};
Module._extensions['.ts'] = (module, filename) => {
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } });
  module._compile(output.outputText, filename);
};
const { ApiError, apiRequest } = require('../src/lib/api/client.ts');
const { normalizeProducts, normalizeBundles, normalizeSettings } = require('../src/lib/api/catalog.ts');
const { buildCheckoutPayload, placeOrder } = require('../src/lib/api/checkout.ts');
const { getCartTotals } = require('../src/lib/cart-totals.ts');
const { useStoreData } = require('../src/store/catalog.ts');
const { products: localProducts } = require('../src/data/products.ts');
const details = { fullName: 'Test Customer', mobile: '03001234567', email: '', street: 'Test street 123', city: 'Lahore', province: 'Punjab', notes: '' };
const rawProducts = localProducts.map((p, i) => ({ id: 'backend-' + i, slug: p.slug, name: p.name, price: 1000 + i * 100, originalPrice: 1500, inStock: true, trackInventory: true, stockQuantity: 12, images: ['https://example.test/product.png'], categoryNames: [p.type], isVisible: true, status: 'published' }));
const products = normalizeProducts(rawProducts);
let count = 0;
async function check(name, run) { await run(); count++; console.log('PASS ' + name); }
function response(body, status = 200) { return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }); }
(async () => {
  await check('Backend products map to exactly three stable storefront slots with real IDs', () => { assert.equal(products.length, 3); assert.equal(products[0].id, 'backend-0'); assert.equal(products[2].type, 'Cleanser'); assert.deepEqual(products.map(p => p.slug), localProducts.map(p => p.slug)); });
  await check('Partial catalog retains local fallback; invalid/empty responses are rejected', () => { const partial = normalizeProducts(rawProducts.slice(0,1)); assert.equal(partial.length,3); assert.equal(partial.filter(p=>p.id).length,1); assert.throws(()=>normalizeProducts([]),ApiError); assert.throws(()=>normalizeProducts({products:[]}),ApiError); });
  const bundles = normalizeBundles({bundles:[{id:'bundle-id',slug:'live-duo',name:'Live Duo',isActive:true,currentPrice:1800,originalTotalPrice:2100,products:rawProducts.slice(0,2).map(p=>({...p,bundle_quantity:1}))}]},products);
  await check('Wrapped backend bundle response resolves linked IDs and savings', () => { assert.deepEqual(bundles[0].productSlugs,['product-01','product-02']); assert.equal(bundles[0].id,'bundle-id'); assert.equal(bundles[0].savePercent,14); });
  const settings = normalizeSettings({standardShippingFee:350,freeShippingThreshold:2500,phone:'03001234567',routineDiscount:{minimumDistinctProducts:2,tiers:[{minProducts:2,discountPercent:10},{minProducts:3,discountPercent:15}],quantityBonusEnabled:true,quantityBonusPercent:5}});
  await check('Live delivery settings and routine savings drive consistent cart totals', () => { const normal=getCartTotals({'product-01':1},{},undefined,{}, {products,bundles,settings}); assert.equal(normal.shipping,350); const custom=getCartTotals({}, {},undefined, {'product-01':1,'product-02':1,'product-03':1}, {products,bundles,settings}); assert.equal(custom.customDiscount,495); assert.equal(custom.total,custom.subtotal-custom.discount+custom.shipping); const repeat=getCartTotals({}, {},undefined, {'product-01':2,'product-02':1}, {products,bundles,settings}); assert.equal(repeat.customDiscount,465); const bundle=getCartTotals({}, {'live-duo':1},'LEVA10',{}, {products,bundles,settings}); assert.equal(bundle.total,bundle.subtotal-bundle.discount+bundle.shipping); });
  const cart={items:{'product-01':2},bundles:{'live-duo':1},custom:{'product-02':1},coupon:' leva10 '};
  const payload=buildCheckoutPayload(details,cart,{products,bundles},'request-id-123456789');
  await check('Checkout sends only identity/quantity/address/coupon metadata, never monetary fields', () => { const forbidden=/price|total|discountAmount|shippingFee|deliveryCharge/i; const scan=value=>{ if(value&&typeof value==='object') for(const [key,item] of Object.entries(value)){assert.equal(forbidden.test(key),false,key);scan(item);} }; scan(payload); assert.equal(payload.items[0].productId,'backend-0'); assert.equal(payload.items[1].productType,'bundle'); assert.equal(payload.items[2].isRoutine,true); assert.equal(payload.appliedCoupon.code,'LEVA10'); assert.equal(payload.city,'Lahore'); });
  await check('Fallback product IDs, fractional quantities and missing variable options cannot be ordered', () => { assert.throws(()=>buildCheckoutPayload(details,{items:{'product-01':1},bundles:{},custom:{},coupon:''},{products:localProducts,bundles:[]},'test'),ApiError); assert.throws(()=>buildCheckoutPayload(details,{...cart,items:{'product-01':1.5}},{products,bundles},'test'),ApiError); assert.throws(()=>buildCheckoutPayload(details,{items:{'product-01':1},bundles:{},custom:{},coupon:''},{products:[{...products[0],requiresVariation:true}],bundles},'test'),ApiError); });
  await check('API origin is normalized and credentialed JSON requests are used', async () => { global.fetch=async(url,options)=>{assert.equal(url,'https://api.example.test/api/orders');assert.equal(options.credentials,'include');assert.equal(options.method,'POST');assert.equal(options.headers['Content-Type'],'application/json');return response({ok:true});}; assert.deepEqual(await apiRequest('/api/orders',{method:'POST',body:'{}'}),{ok:true}); });
  await check('Network, HTTP and malformed API responses produce typed errors', async () => { global.fetch=async()=>{throw new Error('offline');}; await assert.rejects(apiRequest('/api/products'),error=>error instanceof ApiError&&error.code==='network'); global.fetch=async()=>response({error:'Out of stock'},400); await assert.rejects(apiRequest('/api/orders'),error=>error instanceof ApiError&&error.status===400&&error.message==='Out of stock'); global.fetch=async()=>new Response('bad-json',{status:200}); await assert.rejects(apiRequest('/api/settings'),error=>error instanceof ApiError&&error.code==='invalid-response'); });
  await check('Order receipt uses server-confirmed prices and totals', async () => { global.fetch=async()=>response({orderId:'LEV-TEST-ABC123',createdAt:'2026-10-12T00:00:00Z',subtotal:2000,discountAmount:0,shippingFee:350,total:2350,status:'Pending',items:[{productName:'Server product',quantity:2,price:1000}]}); const order=await placeOrder(payload,details); assert.equal(order.orderNumber,'LEV-TEST-ABC123');assert.equal(order.total,2350);assert.equal(order.items[0].total,2000); });
  await check('Existing backend price-assertion rejection is explained without sending prices', async () => { global.fetch=async()=>response({error:'Routine savings or prices have changed. Refresh your cart and try again.'},400); await assert.rejects(placeOrder(payload,details),/couldn't confirm your discount/); });
  await check('Shared store recovers products, bundles and settings when API is unreachable', async () => { global.fetch=async()=>{throw new Error('offline');}; await useStoreData.getState().load(); const state=useStoreData.getState(); assert.equal(state.products.length,3);assert.equal(state.bundles.length,2);assert.equal(state.loading,false);assert.equal(state.ready,true);assert.match(state.notice,/saved collection/);assert.equal(state.products.some(p=>p.id),false); });
  await check('Shared store loads live products, bundles, settings and approved reviews', async () => { useStoreData.setState({ready:false}); global.fetch=async(url)=>{ if(url.includes('/api/products'))return response(rawProducts);if(url.endsWith('/api/settings'))return response({standardShippingFee:350,freeShippingThreshold:2500});if(url.endsWith('/api/bundles'))return response({bundles:[{id:'bundle-id',slug:'live-duo',name:'Live Duo',isActive:true,currentPrice:1800,originalTotalPrice:2100,products:rawProducts.slice(0,2).map(p=>({...p,bundle_quantity:1}))}]});if(url.includes('/api/reviews/product/'))return response([{reviewerName:'Test Reviewer',rating:5,content:'A real approved review.',verifiedPurchase:true}]);throw new Error('Unexpected request '+url); }; await useStoreData.getState().load(); const state=useStoreData.getState(); assert.equal(state.products[0].id,'backend-0');assert.equal(state.settings.shippingFlatRate,350);assert.equal(state.reviews.length,3);assert.equal(state.reviewsLive,true);assert.equal(state.notice,''); });
  console.log('\n'+count+' API contract checks passed (mocked fetch; no real orders submitted).');
})().catch(error=>{console.error(error);process.exitCode=1;});
