import {toast} from 'sonner';
import { ApiError } from '@/lib/api/client';
import type { Product,Order,Bundle,Coupon,Category,StoreSettings } from './types';
export type ModuleFlags = Record<string,boolean>;
const reads=new Map<string,Promise<unknown>>();
export function uiRequest<T>(path:string,method='GET',body?:unknown):Promise<T>{
 if(method==='GET'&&reads.has(path))return reads.get(path) as Promise<T>;
 const write=!['GET','HEAD'].includes(method);
 const operation=(async()=>{const multipart=body instanceof FormData;if(write)window.dispatchEvent(new Event('leva-admin-request-start'));
 try{const response=await fetch('/api/admin/'+path,{method,credentials:'include',cache:'no-store',headers:{Accept:'application/json',...(body&&!multipart?{'Content-Type':'application/json'}:{})},body:body===undefined?undefined:multipart?body as FormData:JSON.stringify(body),signal:AbortSignal.timeout(20000)});const data=await response.json().catch(()=>null);if(!response.ok)throw new ApiError(data?.error||(response.status===404?'Backend endpoint not available: '+path:'Unable to complete this request.'),response.status,'http');if(data===null)throw new ApiError('Unexpected backend response. Please try again.',response.status,'invalid-response');return data as T;}catch(error){if(error instanceof ApiError)throw error;throw new ApiError('Could not reach the backend. Please try again.',0,'network');}finally{if(write)window.dispatchEvent(new Event('leva-admin-request-end'));if(method==='GET')reads.delete(path);}})();
 if(method==='GET')reads.set(path,operation);return operation;
}
export async function uploadImage(file:File):Promise<string>{if(file.size>5*1024*1024||!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Choose a JPEG, PNG or WebP image under 5 MB.');const data=new FormData();data.append('image',file);try{const result=await uiRequest<{url:string}>('upload/image','POST',data);return result.url;}catch(error){toast.error(error instanceof Error?error.message:'Image upload failed.');throw error;}}
export const productFromAPI=(p:any):Product=>({...p,category:p.categoryNames?.[0]||'',categorySlug:p.categorySlugs?.[0]||'',brand:p.brand||'LEVA',price:Number(p.price),originalPrice:p.originalPrice==null?undefined:Number(p.originalPrice),features:p.features||[],tags:p.tags||[],specifications:p.specifications||{},attributes:p.attributes||p.variants||[],variations:p.variations||[],images:p.images||[],description:p.description||'',safetyInfo:p.safetyInfo||''});
export const orderFromAPI=(o:any):Order=>({
  ...o,
  id: o.orderId || o.id,
  orderId: o.orderId || o.id,
  user_id: o.user_id || null,
  date: o.date || (o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : ''),
  createdAt: o.createdAt || o.date,
  customerName: o.customerName || o.shippingAddress?.fullName || o.shippingAddress?.name || (o.guestEmail ? o.guestEmail.split('@')[0] : 'Guest Customer'),
  email: o.email || o.guestEmail || '',
  phone: o.phone || o.guestPhone || o.shippingAddress?.phone || '',
  discount: Number(o.discountAmount || o.discount || 0),
  shipping: Number(o.shippingFee || o.shipping || 0),
  subtotal: Number(o.subtotal || 0),
  total: Number(o.total || 0),
  status: o.status === 'Processing' ? 'Order Confirmed' : (o.status || 'Pending'),
  paymentMethod: o.paymentMethod || 'Cash on Delivery (COD)',
  paymentStatus: o.status === 'Delivered' ? 'Paid (COD Collected)' : (o.status === 'Cancelled' ? 'Cancelled' : 'Unpaid (Due on Delivery)'),
  items: (o.items||[]).map((i:any)=>({
    ...i,
    name: i.productName || i.name || 'Product',
    price: Number(i.price || 0),
    image: i.image || '',
    quantity: Number(i.quantity || 1)
  })),
  shippingAddress: {
    fullName: o.shippingAddress?.fullName || o.shippingAddress?.name || o.customerName || '',
    phone: o.shippingAddress?.phone || o.phone || o.guestPhone || '',
    street: o.shippingAddress?.street || o.shippingAddress?.address || '',
    city: o.shippingAddress?.city || '',
    province: o.shippingAddress?.province || o.shippingAddress?.state || '',
    state: o.shippingAddress?.state || o.shippingAddress?.province || '',
    postalCode: o.shippingAddress?.postalCode || '',
    country: o.shippingAddress?.country || 'Pakistan',
    notes: o.shippingAddress?.notes || o.notes || '',
    ...o.shippingAddress
  }
});
export const bundleFromAPI=(b:any):Bundle=>({...b,discountPercent:Number(b.discountPercent||0),products:(b.products||[]).map((p:any)=>({product:productFromAPI(p.product||p),quantity:Number(p.quantity||p.bundle_quantity||1)}))});
export const couponFromAPI=(c:any):Coupon=>({...c,amount:Number(c.discountValue),minSpend:Number(c.minPurchase),usedCount:Number(c.usageCount),expiryDate:c.expiryDate?String(c.expiryDate).slice(0,10):''});
const categoryImage=(value:any):string=>{if(typeof value!=='string')return value?.url||'';try{const parsed=JSON.parse(value);return typeof parsed==='string'?parsed:parsed?.url||'';}catch{return value;}};
export const categoryFromAPI=(c:any):Category=>({...c,isActive:String(c.status).toLowerCase()!=='inactive',parentCategoryId:c.parentId,itemCount:Number(c.itemCount||0),image:categoryImage(c.image),description:c.description||''});
export const settingsFromAPI=(s:any):StoreSettings=>({...s,metaTitle:s.metaTitle||s.defaultMetaTitle||'',metaDescription:s.metaDescription||s.defaultMetaDescription||'',standardShippingFee:Number(s.standardShippingFee),freeShippingThreshold:Number(s.freeShippingThreshold),taxRate:Number(s.taxRate||0)});
export async function allOrders():Promise<Order[]>{let page=1,pages=1;const orders:Order[]=[];do{const data=await uiRequest<{orders:any[],totalPages:number}>('orders?page='+page+'&limit=100');orders.push(...data.orders.map(orderFromAPI));pages=data.totalPages;page++;}while(page<=pages);return orders;}
export const pageModule:Record<string,string>={products:'products','product-new':'products','product-edit':'products',categories:'categories',attributes:'attributes',orders:'orders',customers:'customers',reviews:'reviews','audio-reviews':'audioReviews','contact-messages':'contact',bundles:'bundles','bundle-new':'bundles','bundle-edit':'bundles',coupons:'coupons',reports:'reports',settings:'settings','routine-discounts':'routineDiscounts','best-sellers':'bestSellers','store-appearance':'appearance'};

export const pageRequirements:Record<string,string[]>={reviews:['reviews','products'],'product-new':['products','categories','attributes','settings'],'product-edit':['products','categories','attributes','settings'],'bundle-new':['bundles','products'],'bundle-edit':['bundles','products'],'store-appearance':['appearance','categories','products']};
export function requirementsForPage(page:string){return pageRequirements[page]|| (page==='feature-management'?[]:[pageModule[page]||'dashboard']);}
export function moduleForRequest(path:string){if(path.startsWith('admin/'))return {'features':'features','dashboard':'dashboard','customers':'customers','reports':'reports','best-sellers':'bestSellers'}[path.split('/')[1]];if(path.startsWith('settings/routine'))return 'routineDiscounts';return {'products':'products','categories':'categories','global-attributes':'attributes','orders':'orders','reviews':'reviews','audio-reviews':'audioReviews','contact':'contact','bundles':'bundles','coupons':'coupons','settings':'settings'}[path.split('/')[0]];}
