"use client";
import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, LoaderCircle, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { adminApi, isAdmin } from '@/lib/api/admin';
import { AdminButton } from '@/components/admin/shared';
export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('admin@leva.pk');
    const [password, setPassword] = useState(''), [show, setShow] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState('');
    useEffect(() => { void adminApi.me().then(user => router.replace(isAdmin(user) ? '/admin' : '/')).catch(() => {}); }, [router]);
    async function submit(event: FormEvent) {
        event.preventDefault(); setBusy(true); setError('');
        try {
            const user = await adminApi.login(email.trim(), password);
            if (!isAdmin(user)) { await adminApi.logout(); router.replace('/'); return; }
            const next = new URLSearchParams(window.location.search).get('next');
            router.replace(next && (next === '/admin' || next.startsWith('/admin/')) && !next.startsWith('/admin/login') ? next : '/admin');
            router.refresh();
        } catch (error) { setError(error instanceof Error ? error.message : 'Sign in failed. Please try again.'); setBusy(false); }
    }
    return <div className="admin-login">
        <section className="admin-login-brand">
            <Link href="/" aria-label="LEVA storefront"><img src="/images/LEVA-logo.png" alt="LEVA" className="w-36"/></Link>
            <div className="admin-login-art"><span className="admin-pill">THE DAILY ESSENTIALS</span><img src="/images/leva-radiance-serum.png" alt="LEVA Radiance Serum"/><div><h2>A little care.<br/>Every day.</h2><p>Thoughtfully made skincare.<br/>Thoughtfully managed.</p></div></div>
            <p className="text-xs text-[#78666d]">LEVA · Store administration</p>
        </section>
        <section className="admin-login-form-area">
            <div className="admin-login-card">
                <img src="/images/LEVA-logo.png" alt="LEVA" className="mb-8 w-28 lg:hidden"/>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF4F6] text-[#603344]"><LockKeyhole size={22}/></div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[.16em] text-[#78666d]">ADMIN PORTAL</p>
                <h1>Welcome back</h1><p className="mb-8 mt-2 text-[#78666d]">Your store, all in one place.</p>
                <form onSubmit={submit} className="space-y-5">
                    <div><label htmlFor="admin-email">Email address</label><Input id="admin-email" type="email" autoComplete="username" required value={email} onChange={event => setEmail(event.target.value)} className="mt-2"/></div>
                    <div><label htmlFor="admin-password">Password</label><div className="relative mt-2"><Input id="admin-password" type={show ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" required value={password} onChange={event => setPassword(event.target.value)} className="pr-14"/><button type="button" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(!show)} className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-xl text-[#78666d]">{show ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></div>
                    {error && <p role="alert" className="rounded-xl border border-[#ecdfe4] bg-[#FFF4F6] p-3 text-sm text-[#603344]">{error}</p>}
                    <AdminButton type="submit" disabled={busy} className="min-h-12 w-full gap-2">{busy ? <><LoaderCircle size={17}/>Signing in…</> : <>Sign in to dashboard<ArrowRight size={17}/></>}</AdminButton>
                </form>
                <p className="mt-5 flex items-center justify-center gap-2 text-xs text-[#78666d]"><ShieldCheck size={15}/>Secure access for your store team</p>
                <Link href="/" className="mt-8 flex items-center justify-center gap-2 text-sm text-[#603344]"><ArrowLeft size={15}/>Back to storefront</Link>
            </div>
        </section>
    </div>;
}
