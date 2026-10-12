import { adminBackendOrigin } from '@/lib/api/admin-origin';
import { NextRequest, NextResponse } from 'next/server';
export async function middleware(request: NextRequest) {
    if (request.nextUrl.pathname === '/admin/login')
        return NextResponse.next();
    const publicOrigin = request.nextUrl.protocol + '//' + (request.headers.get('host') || request.nextUrl.host);
    const login = new URL('/admin/login', publicOrigin);
    login.searchParams.set('next', request.nextUrl.pathname);
    const origin = adminBackendOrigin();
    const cookieName = process.env.ADMIN_SESSION_COOKIE_NAME || 'leva_admin_token';
    if (!origin || !request.cookies.get(cookieName))
        return NextResponse.redirect(login);
    try {
        const response = await fetch(origin + '/api/auth/me', { headers: { Cookie: request.headers.get('cookie') || '' }, credentials: 'include', cache: 'no-store', signal: AbortSignal.timeout(8000) });
        if (!response.ok)
            return NextResponse.redirect(login);
        const user = await response.json();
        if (!['admin', 'super_admin'].includes(user.role))
            return NextResponse.redirect(new URL('/', publicOrigin));
        return NextResponse.next();
    }
    catch {
        return NextResponse.redirect(login);
    }
}
export const config = { matcher: ['/admin/:path*'] };
