import type {Metadata} from 'next';
import WishlistView from './view';
export const metadata:Metadata={title:'Your Wishlist — LEVA',description:'Your saved LEVA skincare essentials.'};
export default function Page(){return <WishlistView/>;}
