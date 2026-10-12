"use client";
import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { adminApi, isAdmin } from '@/lib/api/admin';
import { API_URL } from '@/lib/api/client';
import { AdminButton } from '@/components/admin/shared';
export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [show, setShow] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState('');
    useEffect(() => { if (API_URL)
        void adminApi.me().then(user => router.replace(isAdmin(user) ? '/admin' : '/')).catch(() => { }); }, [router]);
    async function submit(event: FormEvent) { event.preventDefault(); setBusy(true); setError(''); try {
        const user = await adminApi.login(email, password);
        if (!isAdmin(user)) {
            try {
                await adminApi.logout();
            }
            finally {
                router.replace('/');
            }
            return;
        }
        const next = new URLSearchParams(window.location.search).get('next');
        router.replace(next && (next === '/admin' || next.startsWith('/admin/')) && !next.startsWith('/admin/login') ? next : '/admin');
        router.refresh();
    }
    catch (error) {
        setError(error instanceof Error ? error.message : 'Sign in failed. Please try again.');
        setBusy(false);
    } }
    return <div className="grid min-h-dvh lg:grid-cols-2"><section className="hidden flex-col items-center justify-center bg-gradient-to-br from-[#FFF4F6] via-[#fce4eb] to-white p-12 lg:flex"><img src="/images/LEVA-logo.png" alt="LEVA" className="mb-10 w-44"/><img src="/images/leva-radiance-serum.png" alt="LEVA Radiance Serum" className="h-80 w-72 object-contain"/><h2 className="mt-8 text-[#603344]">A little care. Every day.</h2></section><section className="flex items-center justify-center p-6"><div className="w-full max-w-sm"><img src="/images/LEVA-logo.png" alt="LEVA" className="mb-8 h-12 w-32 object-contain lg:hidden"/><h1>Welcome back</h1><p className="mb-8 mt-2 text-[#78666d]">Sign in to manage your LEVA store.</p><form onSubmit={submit} className="space-y-5"><label>Email address<Input type="email" autoComplete="username" required value={email} onChange={event => setEmail(event.target.value)} className="mt-2"/></label><label>Password<div className="relative mt-2"><Input aria-label="Password" type={show ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} className="pr-12"/><button type="button" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(!show)} className="absolute right-3 top-3">{show ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></label>{!API_URL && <p role="status" className="rounded-xl bg-[#FFF4F6] p-3 text-xs">Backend connection is not configured. Set NEXT_PUBLIC_API_URL to enable sign in.</p>}{error && <p role="alert" className="rounded-xl bg-[#FFF4F6] p-3 text-[#603344]">{error}</p>}<AdminButton type="submit" disabled={busy || !API_URL} className="w-full">{busy ? 'Signing in…' : 'Sign in'}</AdminButton></form><Link href="/" className="mt-6 block text-center text-sm text-[#603344]">← Back to Storefront</Link></div></section></div>;
}
