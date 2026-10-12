# LEVA Vercel connection

Frontend project root: leva-next. Deploy the current source, including src/app/api/admin, src/app/admin and src/middleware.ts. The tracked vercel.json supplies the public backend URL at build and runtime; no credentials are included. An explicit project environment variable should use the same URL.

NEXT_PUBLIC_API_URL=https://leva-backend.vercel.app

Backend project root: backend. Configure database and JWT secrets in Vercel Production environment variables, using the existing local values privately. The local .env is not deployed. Either DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME or LEVA_MYSQL_HOST, LEVA_MYSQL_PORT, LEVA_MYSQL_USER, LEVA_MYSQL_PASSWORD, LEVA_MYSQL_DATABASE are supported. Prefer one consistent set. JWT_SECRET must remain identical across backend requests and must not be a placeholder. Never place database credentials in NEXT_PUBLIC variables.

Backend public settings:

FRONTEND_URL=https://leve-frontend-virid.vercel.app
CORS_ORIGINS=https://leve-frontend-virid.vercel.app
NODE_ENV=production
COOKIE_NAME=leva_admin_token
COOKIE_SECURE=true
COOKIE_SAME_SITE=none

Leave COOKIE_DOMAIN unset. The admin proxy forwards the HttpOnly cookie onto the frontend host; neither localStorage nor a frontend JWT secret is used.

Redeploy the backend, then redeploy the frontend after saving environment variables and including all current admin source files. Health must return 200 before trying login. If it stays 503 with correct database variables, check remote MySQL access/firewall from Vercel. Do not recreate the admin or change its password to resolve a deployment configuration error.

Use admin@leva.pk and the password entered during the hidden admin:setup prompt.
