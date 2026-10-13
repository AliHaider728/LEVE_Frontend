'use client';
import {useEffect,useRef,useState} from 'react';
import {Search,X} from 'lucide-react';
import {Link} from '@/lib/router-compat';
import {useStoreData} from '@/store/catalog';
import {apiRequest} from '@/lib/api/client';
import {searchProducts,serverSearchMatches} from '@/lib/product-search';
import {formatPKR} from '@/config/store';
import type {Product} from '@/data/products';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
export function ProductSearch({open,onOpenChange}:{open:boolean;onOpenChange:(value:boolean)=>void}) {
 const {products}=useStoreData();const [query,setQuery]=useState('');const [results,setResults]=useState<Product[]>([]);const [loading,setLoading]=useState(false);const [notice,setNotice]=useState('');const input=useRef<HTMLInputElement>(null);const [submitted,setSubmitted]=useState(0);
 useEffect(()=>{
  if(!open){setQuery('');setResults([]);setNotice('');setLoading(false);return;}
  const term=query.trim();if(!term){setResults([]);setNotice('');setLoading(false);return;}
  const controller=new AbortController();setLoading(true);
  const timer=setTimeout(()=>{void apiRequest<unknown>('/api/products?search='+encodeURIComponent(term),{signal:controller.signal}).then(data=>{if(!controller.signal.aborted){setResults(serverSearchMatches(data,products));setNotice('');}}).catch(()=>{if(!controller.signal.aborted){setResults(searchProducts(products,term));setNotice('Live search is unavailable. Showing matches from the saved catalog.');}}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});},submitted?0:200);
  return()=>{clearTimeout(timer);controller.abort();};
 },[open,query,products,submitted]);
 return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent id="leva-search-dialog" onCloseAutoFocus={event=>{event.preventDefault();document.querySelector<HTMLButtonElement>('[data-search-trigger]')?.focus();}} data-lenis-prevent className="z-[70] w-[calc(100%-2rem)] max-w-2xl rounded-2xl bg-background p-5 sm:p-8" onOpenAutoFocus={event=>{event.preventDefault();input.current?.focus();}}>
  <DialogTitle className="text-2xl font-light">Find your essential</DialogTitle><DialogDescription>Search LEVA products by name or keyword.</DialogDescription>
  <form onSubmit={event=>{event.preventDefault();setSubmitted(n=>n+1);}} className="mt-2 flex min-w-0 items-center gap-2 rounded-lg border border-primary/25 bg-white px-3">
   <Search aria-hidden className="size-5 shrink-0"/><label htmlFor="product-search" className="sr-only">Search products</label><input ref={input} id="product-search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Try serum, cream or face wash" maxLength={120} autoComplete="off" className="h-12 min-w-0 flex-1 bg-transparent text-base outline-none"/>
   {query&&<button type="button" aria-label="Clear search" onClick={()=>{setQuery('');input.current?.focus();}} className="grid size-11 shrink-0 place-items-center"><X className="size-4"/></button>}<button className="min-h-11 shrink-0 text-xs font-semibold" type="submit">Search</button>
  </form>
  <div role="status" aria-live="polite" className="text-sm text-muted-foreground">{loading?'Searching…':query.trim()?`${results.length} matching product${results.length===1?'':'s'}`:'Explore our three essentials.'}</div>{notice&&<p className="text-xs text-muted-foreground">{notice}</p>}
  <div className="max-h-[50dvh] overflow-y-auto overscroll-contain" data-lenis-prevent>{loading?<div aria-hidden="true" className="space-y-3 animate-pulse"><div className="h-20 bg-secondary rounded-lg"/><div className="h-20 bg-secondary rounded-lg"/></div>:query.trim()&&results.length===0?<p className="rounded-lg bg-secondary/50 p-5 text-sm">No products match “{query.trim()}”. Try another name or clear your search.</p>:(query.trim()?results:products).map(product=><Link key={product.slug} to="/shop/$slug" params={{slug:product.slug}} onClick={()=>onOpenChange(false)} className="flex min-w-0 items-center gap-4 rounded-lg p-3 hover:bg-secondary/50 focus-visible:outline-2"><img src={product.image} alt="" className="h-20 w-16 shrink-0 rounded-md object-cover"/><div className="min-w-0"><p className="text-base font-medium">{product.name}</p><p className="mt-1 text-sm">{formatPKR(product.price)}</p><p className="text-xs text-muted-foreground">{product.stock>0?'In stock':'Sold out'}</p></div></Link>)}</div>
 </DialogContent></Dialog>;
}
