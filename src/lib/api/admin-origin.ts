/** Server-side admin connection; browser requests use the same-origin proxy. */
export function adminBackendOrigin() {
  return (process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === 'production' ? 'https://leva-backend.vercel.app' : 'http://127.0.0.1:5001')).trim().replace(/\/+$/, '');
}
