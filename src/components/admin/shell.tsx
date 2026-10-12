"use client";
import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Menu, PanelLeftClose, LogOut, ExternalLink } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { adminApi, isAdmin } from '@/lib/api/admin';
import { AdminButton, Loading, ErrorState } from './shared';
import { toast } from 'sonner';
const links = [['Dashboard', '/admin'], ['Products', '/admin/products'], ['Orders', '/admin/orders'], ['Customers', '/admin/customers'], ['Reviews', '/admin/reviews'], ['Contact Messages', '/admin/contact'], ['Bundles', '/admin/bundles'], ['Coupons', '/admin/coupons'], ['Store Settings', '/admin/settings'], ['Feature Toggles', '/admin/features']];
export function AdminShell({ children }: {
    children: ReactNode;
}) {
    const router = useRouter(), pathname = usePathname(), cache = useQueryClient();
    const [drawer, setDrawer] = useState(false), [collapsed, setCollapsed] = useState(false), [loggingOut, setLoggingOut] = useState(false);
    const session = useQuery({ queryKey: ['admin-session'], queryFn: adminApi.me, retry: false, staleTime: 0, refetchOnWindowFocus: true });
    useEffect(() => { if (session.data && !isAdmin(session.data))
        router.replace('/'); if (session.isError)
        router.replace('/admin/login'); }, [session.data, session.isError, router]);
    const features = useQuery({ queryKey: ['admin-features'], queryFn: adminApi.features, retry: false, enabled: !!session.data && isAdmin(session.data) });
    async function logout() { setLoggingOut(true); try {
        await adminApi.logout();
        cache.clear();
        router.replace('/admin/login');
    }
    catch (error) {
        toast.error(error instanceof Error ? error.message : 'Logout failed');
        setLoggingOut(false);
    } }
    if (session.isPending)
        return <div className="p-6"><Loading /></div>;
    if (session.isError)
        return <div className="p-6"><ErrorState error={session.error}/></div>;
    if (!session.data || !isAdmin(session.data))
        return null;
    const optional = [['Categories', 'categories', 'categories'], ['Attributes', 'attributes', 'attributes'], ['Voice Reviews', 'voiceReviews', 'voice-reviews'], ['Routine Discounts', 'routineDiscounts', 'routine-discounts'], ['Sales Reports', 'salesReports', 'sales-reports']].filter(([, flag]) => features.data?.[flag] === true).map(([label, , path]) => [label, '/admin/' + path]);
    const navigation = <><Link href="/admin" className="block px-4 py-6"><img src="/images/LEVA-logo.png" alt="LEVA" className="h-12 w-32 object-contain"/></Link><nav aria-label="Admin navigation" className="space-y-1 p-3">{[...links, ...optional].map(([name, url]) => <Link key={url} href={url} onClick={() => setDrawer(false)} className={'block rounded-xl px-4 py-3 ' + (pathname === url || (url != '/admin' && pathname.startsWith(url + '/')) ? 'bg-[#603344] text-white' : 'text-[#78666d] hover:bg-[#FFF4F6]')}>{name}</Link>)}</nav>{features.isError && <p className="p-5 text-xs text-[#78666d]">Backend endpoint not available: GET /api/features. Optional modules are hidden.</p>}</>;
    return <div className="flex min-h-dvh"><aside className={'sticky top-0 hidden h-dvh shrink-0 overflow-y-auto border-r border-[#ecdfe4] bg-white lg:block ' + (collapsed ? 'w-0 overflow-hidden border-0' : 'w-60')}>{!collapsed && navigation}</aside><Sheet open={drawer} onOpenChange={setDrawer}><SheetContent side="left" className="admin-root w-72 overflow-y-auto p-0"><SheetTitle className="sr-only">Admin navigation</SheetTitle>{navigation}</SheetContent></Sheet><div className="min-w-0 flex-1"><header className="flex min-h-20 flex-wrap items-center justify-between gap-3 border-b border-[#ecdfe4] px-4 py-3 sm:px-6"><div className="flex items-center gap-2"><AdminButton secondary className="lg:hidden" aria-label="Open navigation" onClick={() => setDrawer(true)}><Menu /></AdminButton><AdminButton secondary className="hidden lg:inline-flex" aria-label="Collapse sidebar" onClick={() => setCollapsed(!collapsed)}><PanelLeftClose /></AdminButton><span className="font-medium">Store administration</span></div><div className="flex flex-wrap items-center gap-3"><button aria-label="Notifications" onClick={() => toast.info('Notifications endpoint is not available in the backend.')} className="rounded-full bg-[#FFF4F6] p-3"><Bell size={18}/></button><div className="text-xs"><p className="font-semibold">{session.data.name}</p><p className="max-w-48 truncate text-[#78666d]">{session.data.email}</p></div><Link href="/" className="flex items-center gap-1 text-xs"><ExternalLink size={14}/>View storefront</Link><AdminButton secondary disabled={loggingOut} onClick={logout}><LogOut />{loggingOut ? 'Signing out…' : 'Logout'}</AdminButton></div></header><main className="mx-auto max-w-[1500px] p-4 sm:p-6">{children}</main></div></div>;
}
