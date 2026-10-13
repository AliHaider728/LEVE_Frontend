'use client';
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
const clean=(value:unknown):string[]=>Array.isArray(value)?[...new Set(value.filter((item):item is string=>typeof item==='string'&&item.length>0&&item.length<=128))].slice(0,100):[];
type WishlistState={saved:string[];hydrated:boolean;hydrate:()=>Promise<void>;toggle:(slug:string)=>void;remove:(slug:string)=>void};
let hydration:Promise<void>|null=null;
/** Guest product identifiers only; no account, customer data or authentication is persisted. */
export const useWishlist=create<WishlistState>()(persist((set,get)=>({saved:[],hydrated:false,hydrate:async()=>{if(get().hydrated)return;if(!hydration)hydration=Promise.resolve(useWishlist.persist.rehydrate()).then(()=>{set({saved:clean(get().saved),hydrated:true});});await hydration;},toggle:slug=>set(state=>({saved:state.saved.includes(slug)?state.saved.filter(item=>item!==slug):clean([...state.saved,slug])})),remove:slug=>set(state=>({saved:state.saved.filter(item=>item!==slug)}))}),{name:'leva-wishlist',skipHydration:true,partialize:state=>({saved:state.saved}),merge:(stored,current)=>({...current,saved:clean((stored as {saved?:unknown}|undefined)?.saved)})}));
