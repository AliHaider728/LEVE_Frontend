/** Server-side admin connection; browser requests use the same-origin proxy. */
export function adminBackendOrigin() {
  const url = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL;
  if (!url || url.includes('localhost:5001') || url.includes('127.0.0.1:5001')) {
    return 'https://admin.leva.pk';
  }
  return url.trim().replace(/\/+$/, '');
}
