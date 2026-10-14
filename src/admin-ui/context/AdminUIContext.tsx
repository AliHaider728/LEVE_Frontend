"use client";
import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ApiError } from '@/lib/api/client';
import { adminApi, isAdmin } from '@/lib/api/admin';
import { uiRequest, productFromAPI, bundleFromAPI, couponFromAPI, categoryFromAPI, settingsFromAPI, allOrders, requirementsForPage, moduleForRequest, type ModuleFlags } from '../api';
import type { AdminPage, Product, Category, Order, Customer, Review, AudioReview, ContactMessage, Bundle, Coupon, GlobalAttribute, StoreSettings, StorefrontNavigationItem, HomepageSectionSetting, RoutineDiscountSettings } from '../types';
export type ToastType = 'success' | 'error' | 'warning' | 'info';
export interface ToastItem {
    id: string;
    type: ToastType;
    message: string;
}
export interface ConfirmDialogOptions {
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
}
export interface PromptDialogOptions extends ConfirmDialogOptions {
    defaultValue?: string;
    inputLabel?: string;
    placeholder?: string;
}
interface DialogState {
    isOpen: boolean;
    type: 'confirm' | 'prompt';
    options: PromptDialogOptions;
    resolve: (val: any) => void;
}
interface AdminUIContextType {
    activePage: AdminPage;
    activePageParams?: any;
    setActivePage: (page: AdminPage, params?: any) => void;
    adminUser: {
        name: string;
        email: string;
        role: 'super_admin' | 'admin';
    } | null;
    // Entities
    products: Product[];
    categories: Category[];
    orders: Order[];
    customers: Customer[];
    reviews: Review[];
    audioReviews: AudioReview[];
    contactMessages: ContactMessage[];
    bundles: Bundle[];
    coupons: Coupon[];
    globalAttributes: GlobalAttribute[];
    settings: StoreSettings;
    navigation: StorefrontNavigationItem[];
    homepageSections: HomepageSectionSetting[];
    // Mutations
    addProduct: (product: Partial<Product>) => Promise<Product>;
    updateProduct: (id: string, patch: Partial<Product>) => Promise<boolean>;
    deleteProduct: (id: string) => Promise<boolean>;
    reorderProducts: (items: {
        id: string;
        displayOrder: number;
    }[]) => Promise<boolean>;
    addCategory: (cat: Partial<Category>) => Promise<Category>;
    updateCategory: (id: string, patch: Partial<Category>) => Promise<boolean>;
    deleteCategory: (id: string) => Promise<boolean>;
    updateOrderStatus: (id: string, status: Order['status']) => Promise<boolean>;
    updateOrderTracking: (id: string, trackingNumber: string) => Promise<boolean>;
    deleteOrder: (id: string) => Promise<boolean>;
    addBundle: (bundle: Partial<Bundle>) => Promise<Bundle>;
    updateBundle: (id: string, patch: Partial<Bundle>) => Promise<boolean>;
    deleteBundle: (id: string) => Promise<boolean>;
    addCoupon: (coupon: Partial<Coupon>) => Promise<Coupon>;
    updateCoupon: (id: string, patch: Partial<Coupon>) => Promise<boolean>;
    deleteCoupon: (id: string) => Promise<boolean>;
    addReview: (review: Partial<Review>) => Promise<Review>;
    updateReviewStatus: (id: string, status: Review['status']) => Promise<boolean>;
    deleteReview: (id: string) => Promise<boolean>;
    addAudioReview: (audio: Partial<AudioReview>) => Promise<AudioReview>;
    deleteAudioReview: (id: string) => Promise<boolean>;
    updateContactStatus: (id: string, status: ContactMessage['status']) => Promise<boolean>;
    deleteContactMessage: (id: string) => Promise<boolean>;
    updateSettings: (settings: Partial<StoreSettings>) => Promise<boolean>;
    updateRoutineDiscountSettings: (routineDiscount: RoutineDiscountSettings) => Promise<boolean>;
    updateAppearanceSettings: (nav: StorefrontNavigationItem[], sections: HomepageSectionSetting[]) => Promise<boolean>;
    addGlobalAttribute: (attr: Partial<GlobalAttribute>) => Promise<GlobalAttribute>;
    updateGlobalAttribute: (id: string, patch: Partial<GlobalAttribute>) => Promise<boolean>;
    deleteGlobalAttribute: (id: string) => Promise<boolean>;
    modules: ModuleFlags;
    saveModules: (flags: ModuleFlags) => Promise<void>;
    loading: boolean;
    pending: boolean;
    moduleLoading: Record<string,boolean>;
    loadedModules: Record<string,boolean>;
    errors: Record<string, string>;
    reload: () => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    dashboard: any;
    reports: any;
    bestSellers: any[];
    setBestSeller: (id: string, enabled: boolean) => Promise<void>;
    // Toast & Dialog
    toasts: ToastItem[];
    showToast: (message: string, type?: ToastType) => void;
    dismissToast: (id: string) => void;
    confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
    prompt: (options: PromptDialogOptions) => Promise<string | null>;
    dialogState: DialogState | null;
    closeDialog: (val: any) => void;
}
const AdminUIContext = createContext<AdminUIContextType | undefined>(undefined);
const emptySettings: StoreSettings = { storeName: '', email: '', phone: '', address: '', currency: 'PKR', metaTitle: '', metaDescription: '', freeShippingThreshold: 0, standardShippingFee: 0, taxRate: 0 };
export const AdminUIProvider: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => {
    const router = useRouter(), pathname = usePathname();
    const parts = useMemo(()=>pathname.split('/').filter(Boolean),[pathname]);
    const section = parts[1] || 'dashboard';
    const aliases: Record<string, string> = { contact: 'contact-messages', 'voice-reviews': 'audio-reviews', features: 'feature-management' };
    const activePage = (section === 'products' && parts[2] ? (parts[2] === 'new' ? 'product-new' : 'product-edit') : section === 'bundles' && parts[2] ? (parts[2] === 'new' ? 'bundle-new' : 'bundle-edit') : aliases[section] || section) as AdminPage;
    const activePageParams = useMemo(() => parts[2] && parts[2] !== 'new' ? { id: decodeURIComponent(parts[2]) } : undefined, [parts]);
    const setActivePage = useCallback((page: AdminPage, params?: any) => { const routes: Record<string, string> = { dashboard: '', 'product-new': 'products/new', 'product-edit': 'products/' + encodeURIComponent(params?.id || ''), 'bundle-new': 'bundles/new', 'bundle-edit': 'bundles/' + encodeURIComponent(params?.id || ''), 'feature-management': 'features' }; router.push('/admin' + (routes[page] === undefined ? '/' + page : routes[page] ? '/' + routes[page] : '')); }, [router]);
    const [adminUser, setAdminUser] = useState<AdminUIContextType['adminUser']>(null);
    const [pendingCount, setPendingCount] = useState(0);
    useEffect(() => { const start = () => setPendingCount(n => n + 1), end = () => setPendingCount(n => Math.max(0, n - 1)); window.addEventListener('leva-admin-request-start', start); window.addEventListener('leva-admin-request-end', end); return () => { window.removeEventListener('leva-admin-request-start', start); window.removeEventListener('leva-admin-request-end', end); }; }, []);
    const [moduleLoading,setModuleLoading]=useState<Record<string,boolean>>({});
    const [loadedModules,setLoadedModules]=useState<Record<string,boolean>>({});
    const loaded=useRef(new Set<string>()),flights=useRef(new Map<string,Promise<void>>());
    const sessionFlight=useRef<Promise<{user:Awaited<ReturnType<typeof adminApi.me>>;flags:ModuleFlags}>|null>(null);
    const mutationFlights=useRef(new Map<string,Promise<unknown>>());
    const [mutations,setMutations]=useState(0);
    const bundleRecords=useRef<Bundle[]>([]);
    const [loading, setLoading] = useState(true), [errors, setErrors] = useState<Record<string, string>>({}), [modules, setModules] = useState<ModuleFlags>({});
    const [products, setProducts] = useState<Product[]>([]), [categories, setCategories] = useState<Category[]>([]), [orders, setOrders] = useState<Order[]>([]), [customers, setCustomers] = useState<Customer[]>([]), [reviews, setReviews] = useState<Review[]>([]), [audioReviews, setAudioReviews] = useState<AudioReview[]>([]), [contactMessages, setContactMessages] = useState<ContactMessage[]>([]), [bundles, setBundles] = useState<Bundle[]>([]), [coupons, setCoupons] = useState<Coupon[]>([]), [globalAttributes, setGlobalAttributes] = useState<GlobalAttribute[]>([]), [settings, setSettings] = useState<StoreSettings>(emptySettings), [navigation, setNavigation] = useState<StorefrontNavigationItem[]>([]), [homepageSections, setHomepageSections] = useState<HomepageSectionSetting[]>([]), [dashboard, setDashboard] = useState<any>(null), [reports, setReports] = useState<any>(null), [bestSellers, setBestSellers] = useState<any[]>([]);
    // Toast
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const dismissToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);
    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        setToasts(prev => [...prev.slice(-3), { id, message, type }]);
        setTimeout(() => {
            dismissToast(id);
        }, type === 'error' ? 5000 : 3000);
    }, [dismissToast]);
    // Dialog
    const [dialogState, setDialogState] = useState<DialogState | null>(null);
    const confirm = useCallback((options: ConfirmDialogOptions) => {
        return new Promise<boolean>((resolve) => {
            setDialogState({
                isOpen: true,
                type: 'confirm',
                options,
                resolve
            });
        });
    }, []);
    const prompt = useCallback((options: PromptDialogOptions) => {
        return new Promise<string | null>((resolve) => {
            setDialogState({
                isOpen: true,
                type: 'prompt',
                options,
                resolve
            });
        });
    }, []);
    const closeDialog = useCallback((val: any) => {
        if (dialogState) {
            dialogState.resolve(val);
            setDialogState(null);
        }
    }, [dialogState]);
    const load=useCallback(async(flags:ModuleFlags,keys:string[],force=false)=>{
        const tasks: [
            string,
            () => Promise<void>
        ][] = [['dashboard', async () => setDashboard(await uiRequest('admin/dashboard'))],
            ['products', async () => setProducts((await uiRequest<any[]>('products')).map(productFromAPI))],
            ['categories', async () => setCategories((await uiRequest<any[]>('categories/admin/all')).flatMap(function flatten(c:any):Category[]{return [categoryFromAPI(c),...(c.children||[]).flatMap(flatten)];}))],
            ['orders', async () => setOrders(await allOrders())],
            ['customers', async () => setCustomers((await uiRequest<any[]>('admin/customers')).map(u => ({ ...u, phone: u.phone || '', avatar: '', ordersCount: Number(u.ordersCount), totalSpent: Number(u.totalSpent), joinedDate: u.joinedDate })))],
            ['reviews', async () => { const data: any = await uiRequest('reviews/admin'); setReviews(Array.isArray(data) ? data : data.reviews || []); }],
            ['audioReviews', async () => setAudioReviews(await uiRequest('audio-reviews/admin'))],
            ['contact', async () => setContactMessages((await uiRequest<any[]>('contact')).map(m => ({ ...m, _id: m.id, status: m.status[0].toUpperCase() + m.status.slice(1).toLowerCase() })))],
            ['bundles', async () => { const data: any = await uiRequest('bundles?all=true'); bundleRecords.current=(data.bundles||[]).map(bundleFromAPI);setBundles(bundleRecords.current); }],
            ['coupons', async () => setCoupons((await uiRequest<any[]>('coupons')).map(couponFromAPI))],
            ['attributes', async () => setGlobalAttributes(await uiRequest('global-attributes'))],
            ['settings', async () => { const data: any = await uiRequest('settings'); setSettings(prev => ({ ...settingsFromAPI(data), routineDiscount: prev.routineDiscount })); setNavigation(data.storefrontNavigation || []); setHomepageSections(data.homepageSections || []); }],
            ['routineDiscounts', async () => { const routineDiscount: RoutineDiscountSettings = await uiRequest('settings/routine'); setSettings(prev => ({ ...prev, routineDiscount })); }],
            ['appearance', async () => {const data:any=await uiRequest('settings?appearance=true');setNavigation(data.storefrontNavigation||[]);setHomepageSections(data.homepageSections||[]);}],
            ['reports', async () => setReports(await uiRequest('admin/reports'))],
            ['bestSellers', async () => setBestSellers(await uiRequest('admin/best-sellers'))]];

      await Promise.all(tasks.filter(([key])=>keys.includes(key)&&(key==='dashboard'||flags[key])).map(async([key,run])=>{
       if(flights.current.has(key))return flights.current.get(key);
       if(!force&&loaded.current.has(key))return;
       setModuleLoading(prev=>({...prev,[key]:true}));
       const task=run().then(()=>setErrors(prev=>{const next={...prev};delete next[key];return next;})).catch(error=>setErrors(prev=>({...prev,[key]:error instanceof Error?error.message:'Unable to load this module.'}))).finally(()=>{loaded.current.add(key);setLoadedModules(prev=>({...prev,[key]:true}));setModuleLoading(prev=>({...prev,[key]:false}));flights.current.delete(key);});
       flights.current.set(key,task);await task;
      }));
    },[]);
    const required=useMemo(()=>requirementsForPage(activePage),[activePage]);
    const bootstrap=useCallback(async(authenticated?:Awaited<ReturnType<typeof adminApi.me>>)=>{
     setLoading(true);setErrors(prev=>{const next={...prev};delete next.session;return next;});
     if(!sessionFlight.current)sessionFlight.current=(async()=>{const user=authenticated||await adminApi.me();if(!isAdmin(user))return {user,flags:{}};return {user,flags:await uiRequest<ModuleFlags>('admin/features')};})();
     try{const {user,flags}=await sessionFlight.current;if(!isAdmin(user)){setAdminUser(null);router.replace('/');return;}setAdminUser(user as AdminUIContextType['adminUser']);setModules(flags);}
     catch(error){if(error instanceof ApiError&&error.status===401){setAdminUser(null);setErrors({});}else setErrors(prev=>({...prev,session:error instanceof Error?error.message:'Unable to load session.'}));}
     finally{sessionFlight.current=null;setLoading(false);}
    },[router]);
    useEffect(()=>{if(pathname==='/admin/login'){setAdminUser(null);setLoading(false);return;}void bootstrap();},[bootstrap,pathname]);
    useEffect(()=>{if(adminUser&&!loading)void load(modules,[...required,'dashboard']);},[adminUser,loading,modules,required,load]);
    const reload=async()=>{if(errors.session||!adminUser)await bootstrap();else await load(modules,required,true);};
    const login=async(email:string,password:string)=>{const user=await adminApi.login(email,password);if(!isAdmin(user)){await adminApi.logout();throw new Error('Administrator access is required.');}await bootstrap(user);router.replace('/admin');};
    const logout=async()=>{await adminApi.logout();setAdminUser(null);setProducts([]);setOrders([]);setCustomers([]);setCategories([]);setReviews([]);setAudioReviews([]);setContactMessages([]);setBundles([]);setCoupons([]);setGlobalAttributes([]);setModules({});loaded.current.clear();setLoadedModules({});router.replace('/admin/login');};
    const mutate=async<T,>(path:string,method:string,body?:unknown,explicitModule?:string):Promise<T>=>{
     const id=method+':'+path;if(mutationFlights.current.has(id))return mutationFlights.current.get(id) as Promise<T>;
     const operation=(async()=>{setMutations(value=>value+1);try{const result=await uiRequest<T>(path,method,body);const key=explicitModule||moduleForRequest(path);const related=key==='products'?['products','bundles','bestSellers','dashboard']:key==='orders'?['orders','products','customers','reports','dashboard']:key==='categories'?['categories','products']:key?[key]:[];await load(modules,related.filter(item=>item===key||loaded.current.has(item)),true);showToast('Changes saved.','success');return result;}catch(error){showToast(error instanceof Error?error.message:'Could not save changes.','error');throw error;}finally{setMutations(value=>Math.max(0,value-1));mutationFlights.current.delete(id);}})();mutationFlights.current.set(id,operation);return operation;
    };
    const productPayload = (patch: Partial<Product>, id?: string) => { const current = products.find(p => p.id === id); const value = { ...current, ...patch }; return { ...value, variants: value.attributes || [], variations: value.variations || [] }; };
    const addProduct = async (p: Partial<Product>) => productFromAPI(await mutate('products', 'POST', productPayload(p)));
    const updateProduct = async (id: string, p: Partial<Product>) => { await mutate('products/' + id, 'PUT', productPayload(p, id)); return true; };
    const deleteProduct = async (id: string) => { await mutate('products/' + id, 'DELETE'); return true; };
    const reorderProducts = async (items: {
        id: string;
        displayOrder: number;
    }[]) => { await mutate('products/reorder', 'PUT', items); return true; };
    const categoryPayload = (p: Partial<Category>, id?: string) => { const v = { ...categories.find(c => c.id === id), ...p }; return { ...v, parentId: v.parentCategoryId || null, status: v.isActive === false ? 'inactive' : 'active' }; };
    const addCategory = async (p: Partial<Category>) => categoryFromAPI(await mutate('categories', 'POST', categoryPayload(p)));
    const updateCategory = async (id: string, p: Partial<Category>) => { await mutate('categories/' + id, 'PUT', categoryPayload(p, id)); return true; };
    const deleteCategory = async (id: string) => { await mutate('categories/' + id, 'DELETE'); return true; };
    const updateOrderStatus = async (id: string, status: Order['status']) => { await mutate('orders/' + encodeURIComponent(id) + '/status', 'PUT', { status }); return true; };
    const updateOrderTracking = async (id: string, trackingNumber: string) => { await mutate('orders/' + encodeURIComponent(id) + '/tracking', 'PUT', { trackingNumber }); return true; };
    const deleteOrder = async (id: string) => { await mutate('orders/' + encodeURIComponent(id), 'DELETE'); return true; };
    const bundlePayload = (p: Partial<Bundle>, id?: string) => { const v = { ...bundles.find(b => b.id === id), ...p }; return { ...v, products: v.products?.map(i => ({ product_id: i.product.id, quantity: i.quantity })) || [] }; };
    const addBundle = async (p: Partial<Bundle>) => {const created:any=await mutate('bundles','POST',bundlePayload(p));const row=bundleRecords.current.find(b=>b.id===created.bundleId);if(!row)throw new Error('Created bundle could not be loaded.');return bundleFromAPI(row);};
    const updateBundle = async (id: string, p: Partial<Bundle>) => { await mutate('bundles/' + id, 'PUT', bundlePayload(p, id)); return true; };
    const deleteBundle = async (id: string) => { await mutate('bundles/' + id, 'DELETE'); return true; };
    const couponPayload = (p: Partial<Coupon>, id?: string) => { const v = { ...coupons.find(c => c.id === id), ...p }; return { ...v, discountValue: v.amount, minPurchase: v.minSpend, expiryDate: v.expiryDate || null }; };
    const addCoupon = async (p: Partial<Coupon>) => couponFromAPI(await mutate('coupons', 'POST', couponPayload(p)));
    const updateCoupon = async (id: string, p: Partial<Coupon>) => { await mutate('coupons/' + id, 'PUT', couponPayload(p, id)); return true; };
    const deleteCoupon = async (id: string) => { await mutate('coupons/' + id, 'DELETE'); return true; };
    const addReview = async (p: Partial<Review>) => mutate<Review>('reviews/admin', 'POST', p);
    const updateReviewStatus = async (id: string, status: Review['status']) => { await mutate('reviews/' + id + '/' + (status === 'approved' ? 'approve' : 'reject'), 'PUT', {}); return true; };
    const deleteReview = async (id: string) => { await mutate('reviews/' + id, 'DELETE'); return true; };
    const addAudioReview = async (p: Partial<AudioReview>) => { const form = new FormData(); const file = (p as any).file; if (!(file instanceof File))
        throw new Error('Select an audio file.'); form.append('audio', file); for (const key of ['customerName', 'duration', 'displayOrder', 'isActive'])
        form.append(key, String((p as any)[key] ?? '')); return mutate<AudioReview>('audio-reviews', 'POST', form); };
    const deleteAudioReview = async (id: string) => { await mutate('audio-reviews/' + id, 'DELETE'); return true; };
    const updateContactStatus = async (id: string, status: ContactMessage['status']) => { await mutate('contact/' + id + '/status', 'PUT', { status }); return true; };
    const deleteContactMessage = async (id: string) => { await mutate('contact/' + id, 'DELETE'); return true; };
    const updateSettings = async (p: Partial<StoreSettings>) => { const merged = { ...settings, ...p }; const base = Object.fromEntries(['storeName', 'email', 'phone', 'address', 'currency', 'standardShippingFee', 'freeShippingThreshold', 'taxRate'].map(key => [key, (merged as any)[key]])); await mutate('settings', 'PUT', { ...base, defaultMetaTitle: merged.metaTitle, defaultMetaDescription: merged.metaDescription }); if(p.socialLinks)await mutate('settings/social','PUT',{socialLinks:p.socialLinks}); return true; };
    const updateRoutineDiscountSettings = async (p: RoutineDiscountSettings) => { await mutate('settings/routine', 'PUT', p); return true; };
    const updateAppearanceSettings = async (nav: StorefrontNavigationItem[], sections: HomepageSectionSetting[]) => { await mutate('settings', 'PUT', { storefrontNavigation: nav, homepageSections: sections },'appearance'); return true; };
    const addGlobalAttribute = async (p: Partial<GlobalAttribute>) => mutate<GlobalAttribute>('global-attributes', 'POST', p);
    const updateGlobalAttribute = async (id: string, p: Partial<GlobalAttribute>) => { const current = globalAttributes.find(a => a.id === id); await uiRequest('global-attributes/' + id, 'PUT', p); if (p.terms) {
        for (const term of p.terms) {
            const old = current?.terms.find(t => t.id === term.id);
            await uiRequest('global-attributes/' + id + '/terms' + (old ? '/' + term.id : ''), old ? 'PUT' : 'POST', term);
        }
        for (const old of current?.terms || [])
            if (!p.terms.some(t => t.id === old.id))
                await uiRequest('global-attributes/' + id + '/terms/' + old.id, 'DELETE');
    } await load(modules,['attributes'],true); showToast('Attribute saved.'); return true; };
    const deleteGlobalAttribute = async (id: string) => { await mutate('global-attributes/' + id, 'DELETE'); return true; };
    const saveModules = async (flags: ModuleFlags) => { const next = await uiRequest<ModuleFlags>('admin/features', 'PUT', flags); for(const key of Object.keys(flags)){loaded.current.delete(key);setLoadedModules(prev=>({...prev,[key]:false}));}setModules(next);showToast('Feature settings saved.'); };
    const setBestSeller = async (id: string, enabled: boolean) => { await mutate('admin/best-sellers/' + id, 'PUT', { isBestseller: enabled }); };
    return <AdminUIContext.Provider value={{ activePage, activePageParams, setActivePage, adminUser, products, categories, orders, customers, reviews, audioReviews, contactMessages, bundles, coupons, globalAttributes, settings, navigation, homepageSections, addProduct, updateProduct, deleteProduct, reorderProducts, addCategory, updateCategory, deleteCategory, updateOrderStatus, updateOrderTracking, deleteOrder, addBundle, updateBundle, deleteBundle, addCoupon, updateCoupon, deleteCoupon, addReview, updateReviewStatus, deleteReview, addAudioReview, deleteAudioReview, updateContactStatus, deleteContactMessage, updateSettings, updateRoutineDiscountSettings, updateAppearanceSettings, addGlobalAttribute, updateGlobalAttribute, deleteGlobalAttribute, toasts, showToast, dismissToast, confirm, prompt, dialogState, closeDialog, modules, saveModules, loading, pending: pendingCount > 0 || mutations > 0, moduleLoading, loadedModules, errors, reload, login, logout, dashboard, reports, bestSellers, setBestSeller }}>{children}</AdminUIContext.Provider>;
};
export function useAdminUI() { const context = useContext(AdminUIContext); if (!context)
    throw new Error('AdminUIProvider is required.'); return context; }
