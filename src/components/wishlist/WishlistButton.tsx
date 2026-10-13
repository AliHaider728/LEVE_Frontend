'use client';
import {Heart} from 'lucide-react';
import {useWishlist} from '@/store/wishlist';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
export function WishlistButton({slug,name,className}:{slug:string;name:string;className?:string}){const saved=useWishlist(state=>state.hydrated&&state.saved.includes(slug));const toggle=useWishlist(state=>state.toggle);return <Button type="button" variant="secondary" size="icon" magnetic={false} aria-pressed={saved} aria-label={`${saved?'Remove':'Save'} ${name} ${saved?'from':'to'} wishlist`} onClick={()=>toggle(slug)} className={cn('rounded-full',className)}><Heart aria-hidden className={saved?'fill-accent text-accent':''}/></Button>;}
