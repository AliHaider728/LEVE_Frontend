import { adminBackendOrigin } from '@/lib/api/admin-origin';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const allowed: Array<{ pattern: RegExp; methods: string[] }> = [
  { pattern: /^api\/products(?:\/[^/]+)?$/, methods: ['GET'] },
  { pattern: /^api\/bundles$/, methods: ['GET'] },
  { pattern: /^api\/settings$/, methods: ['GET'] },
  { pattern: /^api\/features$/, methods: ['GET'] },
  { pattern: /^api\/reviews\/product\/[^/]+$/, methods: ['GET'] },
  { pattern: /^api\/reviews$/, methods: ['POST'] },
  { pattern: /^api\/coupons\/validate$/, methods: ['POST'] },
  { pattern: /^api\/orders$/, methods: ['POST'] },
];

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const route = path.join('/');
  const rule = allowed.find(candidate => candidate.pattern.test(route) && candidate.methods.includes(request.method));
  if (!rule) return NextResponse.json({ error: 'Store endpoint is not available.' }, { status: 404 });

  const origin = adminBackendOrigin();
  if (!origin) return NextResponse.json({ error: 'The backend connection is not configured.' }, { status: 503 });

  const headers = new Headers({ Accept: 'application/json', 'X-Leva-Storefront': '1' });
  const cookie = request.headers.get('cookie');
  const contentType = request.headers.get('content-type');
  if (cookie) headers.set('Cookie', cookie);
  if (contentType) headers.set('Content-Type', contentType);

  try {
    const body = request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.arrayBuffer();
    if (body && body.byteLength > 1024 * 1024) return NextResponse.json({ error: 'Request is too large.' }, { status: 413 });
    const upstreamPath = route.replace(/^api\//, '');
    let response: Response;
    try {
      response = await fetch(`${origin}/api/${upstreamPath}${request.nextUrl.search}`, {
        method: request.method,
        headers,
        body,
        cache: 'no-store',
        redirect: 'manual',
        signal: AbortSignal.timeout(8000),
      });
    } catch (localErr) {
      if (origin !== 'https://admin.leva.pk') {
        response = await fetch(`https://admin.leva.pk/api/${upstreamPath}${request.nextUrl.search}`, {
          method: request.method,
          headers,
          body,
          cache: 'no-store',
          redirect: 'manual',
          signal: AbortSignal.timeout(20000),
        });
      } else {
        throw localErr;
      }
    }
    const result = new NextResponse(await response.arrayBuffer(), {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'Cache-Control': 'no-store',
      },
    });
    for (const value of response.headers.getSetCookie()) {
      result.headers.append('Set-Cookie', value.replace(/;\s*Domain=[^;]+/gi, '').replace(/;\s*Path=[^;]+/gi, '; Path=/'));
    }
    return result;
  } catch {
    return NextResponse.json({ error: 'We could not reach the backend. Please try again.' }, { status: 502 });
  }
}

export { proxy as GET, proxy as POST };
