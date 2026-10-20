import { adminBackendOrigin } from '@/lib/api/admin-origin';
import { NextRequest, NextResponse } from 'next/server';

async function fetchBackend(path: string, cookie: string) {
    const origin = adminBackendOrigin();
    const headers = { Cookie: cookie, 'X-Leva-Admin-Request': '1', Accept: 'application/json' };
    try {
        const res = await fetch(origin + path, {
            headers,
            credentials: 'include',
            cache: 'no-store',
            signal: AbortSignal.timeout(8000)
        });
        if (res.ok) return res;
        if (origin !== 'https://leva-backend.vercel.app') {
            return await fetch('https://leva-backend.vercel.app' + path, {
                headers,
                credentials: 'include',
                cache: 'no-store',
                signal: AbortSignal.timeout(10000)
            });
        }
        return res;
    } catch (err) {
        if (origin !== 'https://leva-backend.vercel.app') {
            return await fetch('https://leva-backend.vercel.app' + path, {
                headers,
                credentials: 'include',
                cache: 'no-store',
                signal: AbortSignal.timeout(10000)
            });
        }
        throw err;
    }
}

export async function middleware(request: NextRequest) {
    if (request.nextUrl.pathname === '/admin/login')
        return NextResponse.next();
    const publicOrigin = request.nextUrl.protocol + '//' + (request.headers.get('host') || request.nextUrl.host);
    const login = new URL('/admin/login', publicOrigin);
    login.searchParams.set('next', request.nextUrl.pathname);
    const origin = adminBackendOrigin();
    const cookieName = process.env.ADMIN_SESSION_COOKIE_NAME || 'leva_admin_token';
    const cookieHeader = request.headers.get('cookie') || '';
    if (!origin || !request.cookies.get(cookieName))
        return NextResponse.redirect(login);
    try {
        const response = await fetchBackend('/api/auth/me', cookieHeader);
        if (!response.ok)
            return NextResponse.redirect(login);
        const user = await response.json();
        if (!['admin', 'super_admin'].includes(user.role))
            return NextResponse.redirect(new URL('/', publicOrigin));
        if(request.nextUrl.pathname==='/admin/features' && user.role!=='super_admin')return NextResponse.redirect(new URL('/admin',publicOrigin));
        const segment=request.nextUrl.pathname.split('/')[2] || '';
        const modules:Record<string,string>={products:'products',categories:'categories',attributes:'attributes',orders:'orders',customers:'customers',reviews:'reviews','voice-reviews':'audioReviews','audio-reviews':'audioReviews',contact:'contact','contact-messages':'contact',bundles:'bundles',coupons:'coupons',reports:'reports',settings:'settings','routine-discounts':'routineDiscounts','best-sellers':'bestSellers','store-appearance':'appearance'};
        if(modules[segment]){
            const result = await fetchBackend('/api/admin/features', cookieHeader);
            if(!result.ok)return NextResponse.redirect(new URL('/admin',publicOrigin));
            const flags=await result.json();if(flags[modules[segment]]!==true)return NextResponse.redirect(new URL('/admin',publicOrigin));
        }
        return NextResponse.next();
    }
    catch {
        return NextResponse.redirect(login);
    }
}
export const config = { matcher: ['/admin/:path*'] };
