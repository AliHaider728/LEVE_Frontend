'use client';
import {useEffect} from 'react';
import {useWishlist} from '@/store/wishlist';
export function WishlistHydration(){const hydrate=useWishlist(state=>state.hydrate);useEffect(()=>{void hydrate();const sync=(event:StorageEvent)=>{if(event.key==='leva-wishlist')void useWishlist.persist.rehydrate();};window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync);},[hydrate]);return null;}
