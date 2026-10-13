import { adminBackendOrigin } from '@/lib/api/admin-origin';
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
const allowed = [/^admin\/(features|dashboard|customers|reports|best-sellers(?:\/[^/]+)?)$/, /^categories(?:\/admin\/all|\/[^/]+(?:\/delete-impact)?)?$/, /^global-attributes(?:\/[^/]+(?:\/terms(?:\/[^/]+)?)?)?$/, /^reviews(?:\/admin|\/[^/]+(?:\/(approve|reject))?)?$/, /^audio-reviews(?:\/admin|\/[^/]+)?$/, /^contact(?:\/[^/]+(?:\/status)?)?$/, /^bundles(?:\/[^/]+)?$/, /^coupons(?:\/[^/]+)?$/, /^settings(?:\/(routine|social))?$/, /^auth\/(login|logout|me|users)$/, /^products(?:\/[^/]+)?$/, /^orders(?:\/[^/]+(?:\/(status|tracking))?)?$/, /^upload\/image$/, /^features$/];
async function proxy(request: NextRequest, { params }: {
    params: Promise<{
        path: string[];
    }>;
}) {
    if (!['GET', 'HEAD'].includes(request.method)) {
        const origin = request.headers.get('origin');
        const host = request.headers.get('host') || request.nextUrl.host;
        if ((origin && new URL(origin).host !== host) || request.headers.get('sec-fetch-site') === 'cross-site')
            return NextResponse.json({ error: 'This request must come from the admin panel.' }, { status: 403 });
    }
    const { path } = await params;
    const route = path.join('/');
    if (!allowed.some(pattern => pattern.test(route)))
        return NextResponse.json({ error: 'Admin endpoint is not available.' }, { status: 404 });
    const origin = adminBackendOrigin();
    if (!origin)
        return NextResponse.json({ error: 'The backend connection is not configured.' }, { status: 503 });
    const headers = new Headers({ Accept: 'application/json' });
    if (!/^auth\/(login|logout|me)$/.test(route) && route !== 'features') headers.set('X-Leva-Admin-Request', '1');
    const cookie = request.headers.get('cookie');
    if (cookie)
        headers.set('Cookie', cookie);
    const contentType = request.headers.get('content-type');
    if (contentType)
        headers.set('Content-Type', contentType);
    try {
        const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer();
        if (body && body.byteLength > (route === 'audio-reviews' ? 11 : 6) * 1024 * 1024)
            return NextResponse.json({ error: 'Upload is too large.' }, { status: 413 });
        const response = await fetch(origin + '/api/' + route + request.nextUrl.search, { method: request.method, headers, body, credentials: 'include', cache: 'no-store', redirect: 'manual', signal: AbortSignal.timeout(25000) });
        const result = new NextResponse(await response.arrayBuffer(), { status: response.status, headers: { 'Content-Type': response.headers.get('content-type') || 'application/json', 'Cache-Control': 'no-store' } });
        // Keep the HttpOnly session on the frontend host so middleware can validate it.
        for (const value of response.headers.getSetCookie()) {
            result.headers.append('Set-Cookie', value.replace(/;\s*Domain=[^;]+/gi, '').replace(/;\s*Path=[^;]+/gi, '; Path=/'));
        }
        return result;
    }
    catch {
        return NextResponse.json({ error: 'We could not reach the backend. Please try again.' }, { status: 502 });
    }
}
export { proxy as GET, proxy as POST, proxy as PUT, proxy as DELETE };
