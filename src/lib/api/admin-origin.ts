/** Server-side admin connection; browser requests use the same-origin proxy. */
export function adminBackendOrigin() {
  return (process.env.BACKEND_API_URL || 'https://leva-backend.vercel.app').trim().replace(/\/+$/, '');
}
