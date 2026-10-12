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

const {adminApi,productUpdate,normalizeAdminProduct,isAdmin}=require('../src/lib/api/admin.ts');
const {middleware}=require('../src/middleware.ts');const {NextRequest}=require('next/server');
let count=0;const response=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}});
async function check(name,fn){await fn();count++;console.log('PASS '+name)}
(async()=>{
 await check('Login discards returned token and includes cookie credentials',async()=>{global.fetch=async(url,options)=>{assert.equal(url,'/api/admin/auth/login');assert.equal(options.credentials,'include');assert.deepEqual(JSON.parse(options.body),{email:'admin@test.invalid',password:'test'});return response({token:'never-store',user:{role:'admin',id:'1'}})};const user=await adminApi.login('admin@test.invalid','test');assert.equal(user.token,undefined);assert.equal(isAdmin(user),true);assert.equal(isAdmin({role:'customer'}),false)});
 await check('SQL boolean zero remains false and metadata survives updates',()=>{const product=normalizeAdminProduct({id:'p',isVisible:0,inStock:0,trackInventory:1,features:['preserve'],images:['url'],variations:[{id:'v'}],productDetailCustomCss:'.x{}'});assert.equal(product.isVisible,false);assert.equal(product.trackInventory,true);const body=productUpdate(product,{name:'Edited'});assert.deepEqual(body.features,['preserve']);assert.equal(body.productDetailCustomCss,'.x{}');assert.equal(body.variations,undefined);assert.equal(body.images,undefined);assert.deepEqual(productUpdate(product,{images:['new']}).images,['new'])});
 await check('Orders use backend pagination and status/tracking routes',async()=>{const calls=[];global.fetch=async(url,options)=>{calls.push([url,options]);return response({orders:[],totalCount:0,page:2,totalPages:0})};await adminApi.orderPage(2,'a & b','Pending');assert.ok(calls[0][0].includes('search=a+%26+b'));await adminApi.status('LEV-1','Shipped','Dispatch');assert.deepEqual(JSON.parse(calls[1][1].body),{status:'Shipped',note:'Dispatch'});await adminApi.tracking('LEV-1','T123');assert.deepEqual(JSON.parse(calls[2][1].body),{trackingNumber:'T123'})});
 await check('Middleware rejects absent, expired, and non-admin sessions',async()=>{let r=await middleware(new NextRequest('http://localhost/admin/products'));assert.ok(r.headers.get('location').includes('/admin/login'));const req=()=>new NextRequest('http://localhost/admin/products',{headers:{cookie:'leva_admin_token=test'}});global.fetch=async()=>response({},401);r=await middleware(req());assert.ok(r.headers.get('location').includes('/admin/login'));global.fetch=async()=>response({role:'customer'});r=await middleware(req());assert.equal(r.headers.get('location'),'http://localhost/');global.fetch=async()=>response({role:'super_admin'});r=await middleware(req());assert.equal(r.headers.get('x-middleware-next'),'1')});
 const proxy=require('../src/app/api/admin/[...path]/route.ts');
 await check('Proxy forwards session cookies, scopes login cookies to frontend, and blocks cross-site writes',async()=>{global.fetch=async(url,options)=>{assert.equal(url,'https://api.example.test/api/auth/login');assert.equal(options.headers.get('Cookie'),'leva_admin_token=existing');return new Response(JSON.stringify({user:{role:'admin'}}),{status:200,headers:{'Set-Cookie':'leva_admin_token=test; Domain=backend.example; Path=/; HttpOnly; Secure; SameSite=None'}})};let r=await proxy.POST(new NextRequest('http://localhost/api/admin/auth/login',{method:'POST',headers:{cookie:'leva_admin_token=existing',origin:'http://localhost','content-type':'application/json'},body:'{}'}),{params:Promise.resolve({path:['auth','login']})});assert.equal(r.status,200);assert.ok(r.headers.get('set-cookie').includes('HttpOnly'));assert.ok(!r.headers.get('set-cookie').includes('Domain='));r=await proxy.POST(new NextRequest('http://localhost/api/admin/auth/login',{method:'POST',headers:{origin:'https://evil.example'},body:'{}'}),{params:Promise.resolve({path:['auth','login']})});assert.equal(r.status,403);r=await proxy.GET(new NextRequest('http://localhost/api/admin/unknown'),{params:Promise.resolve({path:['unknown']})});assert.equal(r.status,404)});
 await check('Admin login works through proxy without browser API configuration',async()=>{const saved=process.env.NEXT_PUBLIC_API_URL;delete process.env.NEXT_PUBLIC_API_URL;try{global.fetch=async(url)=>{assert.equal(url,'/api/admin/auth/login');return response({user:{id:'1',role:'super_admin'}})};assert.equal((await adminApi.login('admin@test.invalid','test')).role,'super_admin');const {adminBackendOrigin}=require('../src/lib/api/admin-origin.ts');assert.equal(adminBackendOrigin(),'http://127.0.0.1:5001');}finally{process.env.NEXT_PUBLIC_API_URL=saved;}});
 await check('Dashboard collects the backend paginated orders without treating page objects as arrays',async()=>{global.fetch=async(url)=>response({orders:[{orderId:url.includes('page=1')?'LEV-1':'LEV-2'}],totalPages:2,totalCount:2});const orders=await adminApi.orders();assert.equal(orders.length,2);assert.equal(orders[1].orderId,'LEV-2');});
 console.log(count+' admin checks passed.');
})().catch(error=>{console.error(error);process.exitCode=1});
