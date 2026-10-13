import {useStoreData} from '@/store/catalog';
import {useState} from 'react';
import {useNavigate} from '@/lib/router-compat';
import {Minus,Plus,ShoppingBag,Zap} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useCart} from '@/store/cart';
import {formatPKR} from '@/config/store';
import {WhatsAppContact} from './WhatsAppContact';
export function QuantityAddToCart({slug}:{slug:string}){
 const {products}=useStoreData();const [quantity,setQuantity]=useState(1);const addMany=useCart(state=>state.addMany);const buyNow=useCart(state=>state.buyNow);const navigate=useNavigate();const product=products.find(item=>item.slug===slug);const soldOut=!product||product.stock<=0;const buy=()=>{if(soldOut)return;buyNow(slug,quantity);void navigate({to:'/checkout'});};
 return <div><div className="flex flex-wrap items-center gap-3">
  <div className="flex h-12 items-center border border-primary" aria-label="Quantity selector"><Button variant="ghost" size="icon" magnetic={false} aria-label="Decrease quantity" disabled={quantity===1} onClick={()=>setQuantity(value=>Math.max(1,value-1))}><Minus/></Button><span className="w-9 text-center text-sm" aria-live="polite">{quantity}</span><Button variant="ghost" size="icon" magnetic={false} aria-label="Increase quantity" disabled={soldOut||quantity>=(product?.stock||0)} onClick={()=>setQuantity(value=>value+1)}><Plus/></Button></div>
  <Button size="lg" className="h-12 px-5" disabled={soldOut} onClick={()=>addMany(slug,quantity)}><ShoppingBag/>{soldOut?'Sold out':'Add to cart'}</Button>
  <div className="flex min-w-0 items-center gap-3"><Button size="lg" variant="outline" className="h-12 px-5" disabled={soldOut} onClick={buy}><Zap/>Buy now</Button>{product&&<WhatsAppContact product={product} quantity={quantity} compact/>}</div>
 </div>
 {product&&<div data-product-purchase className="fixed inset-x-0 bottom-[calc(4rem+2px+env(safe-area-inset-bottom))] z-40 border-t border-primary/20 bg-background px-3 py-2 md:hidden"><div className="mb-2 flex min-w-0 items-center justify-between gap-2"><p className="min-w-0 truncate text-xs">{product.name}</p><p className="shrink-0 text-sm font-medium">{formatPKR(product.price*quantity)}</p></div><div className="grid grid-cols-[1fr_1fr_44px] gap-2"><Button size="sm" magnetic={false} className="min-h-11 px-2" disabled={soldOut} onClick={()=>addMany(slug,quantity)}>{soldOut?'Sold out':'Add to cart'}</Button><Button size="sm" variant="outline" magnetic={false} className="min-h-11 px-2" disabled={soldOut} onClick={buy}>Buy now</Button><WhatsAppContact product={product} quantity={quantity} compact className="h-11 min-w-11 px-2"/></div></div>}
 </div>;
}
