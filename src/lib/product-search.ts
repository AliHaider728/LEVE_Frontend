import type { Product } from '@/data/products';
const normalize=(text:string)=>text.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
export function searchProducts(products:Product[],query:string):Product[] {
 const terms=normalize(query).split(/\s+/).filter(Boolean);
 if(!terms.length)return [];
 return products.filter(product=>{const text=normalize([product.name,product.type,product.benefit,...product.concerns].join(' '));return terms.every(term=>text.includes(term));});
}
export function serverSearchMatches(payload:unknown,products:Product[]):Product[] {
 if(!Array.isArray(payload))throw new Error('Product search is temporarily unavailable.');
 return products.filter(product=>payload.some(row=>row&&typeof row==='object'&&((product.id&&row.id===product.id)||row.slug===product.slug)));
}
