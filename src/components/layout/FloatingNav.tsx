import {useStoreData} from '@/store/catalog';
import {formatPKR} from '@/config/store';
import {useEffect,useState,useRef} from 'react';
import {Link,useRouterState} from '@/lib/router-compat';
import {Contact,Heart,Home,Search,ShoppingBag,Store} from 'lucide-react';
import {ProductSearch} from '@/components/search/ProductSearch';
import logo from '@/assets/LEVA.png.asset.json';
import {useCart} from '@/store/cart';
import {useWishlist} from '@/store/wishlist';
import {Button} from '@/components/ui/button';
import {CartDrawer} from '@/components/layout/CartDrawer';
import {UserMenu} from '@/components/layout/UserMenu';
const desktopLinks=[{label:'Home',to:'/'},{label:'Shop',to:'/shop'},{label:'About',to:'/about'},{label:'Contact',to:'/contact'}];
const tabs=[{label:'Home',to:'/',icon:Home},{label:'Shop',to:'/shop',icon:Store},{label:'Cart',to:'/cart',icon:ShoppingBag},{label:'Contact',to:'/contact',icon:Contact}];
export function FloatingNav(){
 const {settings}=useStoreData();
 const header=useRef<HTMLElement>(null);
 const [searchOpen,setSearchOpen]=useState(false);
 const [scrolled,setScrolled]=useState(false);
 const [hidden,setHidden]=useState(false);
 const [isMounted,setIsMounted]=useState(false);
 const hiddenRef=useRef(false);
 const scrolledRef=useRef(false);
 const pathname=useRouterState({select:state=>state.location.pathname});
 const cartOpen=useCart(state=>state.open);
 const setCartOpen=useCart(state=>state.setOpen);
 const count=useCart(state=>Object.values(state.items).reduce((sum,n)=>sum+n,0)+Object.values(state.bundles).reduce((sum,n)=>sum+n,0)+Object.values(state.custom).reduce((sum,n)=>sum+n,0));
 const wishCount=useWishlist(state=>state.hydrated?state.saved.length:0);

 useEffect(()=>{
  setIsMounted(true);
 },[]);

 useEffect(()=>{
  let sampledY=Math.max(0,window.scrollY);
  let frame=0;
  const show=(value:boolean)=>{
   if(hiddenRef.current!==value){hiddenRef.current=value;setHidden(value);}
  };
  const update=()=>{
   const y=Math.max(0,window.scrollY);
   const isScrolled=y>32;
   if(scrolledRef.current!==isScrolled){scrolledRef.current=isScrolled;setScrolled(isScrolled);}
   if(y<100||searchOpen||cartOpen||header.current?.querySelector('[data-state="open"],[aria-expanded="true"],:focus-visible')){
    show(false);sampledY=y;return;
   }
   const delta=y-sampledY;
   if(Math.abs(delta)<4)return;
   sampledY=y;
   if(delta>0&&y>140)show(true);
   else if(delta<0)show(false);
  };
  const onScroll=()=>{if(!frame)frame=requestAnimationFrame(()=>{frame=0;update();});};
  window.addEventListener('scroll',onScroll,{passive:true});
  return()=>{window.removeEventListener('scroll',onScroll);if(frame)cancelAnimationFrame(frame);};
 },[pathname,searchOpen,cartOpen]);

 return <>
  <div
   data-store-header-wrapper
   className={`fixed inset-x-0 top-0 z-40 w-full ${isMounted?'transition-transform duration-200 ease-out motion-reduce:transition-none':''} ${hidden?'-translate-y-full':'translate-y-0'}`}
   onFocusCapture={()=>{hiddenRef.current=false;setHidden(false);}}
  >
   <div
    data-announcement-bar
    className="hidden h-[var(--announce-h)] w-full items-center justify-center overflow-hidden bg-primary px-4 text-center text-xs font-medium text-primary-foreground md:flex"
   >
    Free delivery over {formatPKR(settings.freeShippingThreshold)}&nbsp; | &nbsp;Cash on Delivery nationwide&nbsp; | &nbsp;WhatsApp +{settings.whatsappNumber}
   </div>
   <header
    ref={header}
    data-store-header
    className={`h-[var(--navbar-h)] w-full border-b border-primary/10 bg-white text-foreground ${scrolled||pathname!=='/'?'shadow-sm':''}`}
   >
    <div className="flex h-16 min-w-0 w-full items-center justify-between gap-2 px-3 md:grid md:h-20 md:grid-cols-[1fr_auto_1fr] md:px-6 lg:px-8">
     <Link to="/" aria-label="LEVA home" className="min-w-0 shrink-0 md:col-start-2 md:row-start-1 md:justify-self-center"><img src={logo.url} alt="LEVA" className="h-12 w-auto max-w-[110px] object-contain md:h-[70px] md:max-w-none lg:h-[90px]"/></Link>
     <nav aria-label="Primary navigation" className="hidden items-center gap-2 md:col-start-1 md:row-start-1 md:flex lg:gap-6">{desktopLinks.map(link=><Link key={link.to} to={link.to} className="inline-flex min-h-11 items-center whitespace-nowrap text-[11px] font-semibold tracking-wide uppercase lg:text-sm focus-visible:outline-2 focus-visible:outline-offset-4" activeProps={{className:'border-b-2 border-current'}}>{link.label}</Link>)}</nav>
     <div className="flex shrink-0 items-center gap-0.5 md:col-start-3 md:row-start-1 md:gap-1 md:justify-self-end">
      <Button type="button" variant="ghost" size="icon" magnetic={false} aria-label="Search products" aria-haspopup="dialog" aria-expanded={searchOpen} aria-controls="leva-search-dialog" data-search-trigger onClick={()=>setSearchOpen(true)}><Search/></Button>
      <Button asChild variant="ghost" size="icon" magnetic={false} className="relative"><Link to="/wishlist" aria-label={`Wishlist with ${wishCount} ${wishCount===1?'item':'items'}`}><Heart/>{wishCount>0&&<span aria-hidden className="absolute right-0 top-0 grid size-5 place-items-center rounded-full bg-accent text-xs font-medium">{wishCount}</span>}</Link></Button>
      <div className="hidden md:block"><UserMenu/></div>
      <Button variant="ghost" size="icon" magnetic={false} className="relative" onClick={()=>setCartOpen(true)} aria-label={`Open cart with ${count} items`}><ShoppingBag/>{count>0&&<span className="absolute right-0 top-0 grid size-5 place-items-center rounded-full bg-accent text-xs font-medium">{count}</span>}</Button>
     </div>
    </div>
   </header>
  </div>
  <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-primary/15 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">{tabs.map(tab=>{const Icon=tab.icon;const active=tab.to==='/'?pathname==='/':pathname.startsWith(tab.to);return <Link key={tab.to} to={tab.to} className={`relative flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-medium ${active?'text-accent':'text-foreground'}`}><Icon className="size-5"/><span>{tab.label}</span>{tab.label==='Cart'&&count>0&&<span className="absolute right-[22%] top-1 grid size-5 place-items-center rounded-full bg-accent text-xs text-accent-foreground">{count}</span>}</Link>;})}</nav>
  <ProductSearch open={searchOpen} onOpenChange={setSearchOpen}/><CartDrawer/>
 </>;
}
