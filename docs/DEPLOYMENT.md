# Free Demo Deployment Guide

This project can be deployed for a short demo with:

- Aiven MySQL for the shared database
- Render Web Services for `backend` and `admin-backend`
- Vercel projects for `frontend` and `admin-frontend`

This is suitable for a university demo, not production reliability. Render Free web services can spin down after idle time, so the first request after inactivity can be slow and WebSocket subscriptions can reconnect.

## Project Services

| Service | Folder | Runtime | Local URL | Hosted on |
| --- | --- | --- | --- | --- |
| User frontend | `frontend` | Next.js | `http://localhost:3000` | Vercel |
| User REST API | `backend` | Express + TypeORM | `http://localhost:5000` | Render |
| Admin frontend | `admin-frontend` | Next.js | `http://localhost:3001` | Vercel |
| Admin API | `admin-backend` | Express + Apollo GraphQL + WebSocket | `http://localhost:4002/graphql` | Render |
| Database | external | MySQL | Aiven host/port | Aiven |

## Important Database Notes

- Use a fresh reachable MySQL database. Aiven MySQL works without changing this project from MySQL to PostgreSQL.
- The normal `backend` must start before `admin-backend` on a fresh database. `backend` has TypeORM `synchronize: true` and creates the tables. `admin-backend` uses `synchronize: false` and expects the tables to already exist.
- Aiven requires TLS. This repo supports both `DB_CA_CERT_PATH` and `DB_CA_CERT`.

## 1. Prepare GitHub

Use the branch that contains the deployment fixes. The recommended deployment branch is `main`.

```powershell
git status
git checkout main
git pull origin main
git push origin main
```

Make sure `.env` and `*.pem` are not tracked:

```powershell
git status --short
git check-ignore -v .env
git check-ignore -v aiven-ca.pem
```

## 2. Prepare Aiven MySQL

In Aiven:

1. Open your MySQL service.
2. Confirm the service status is `Running`.
3. Copy the individual connection fields:
   - Host
   - Port
   - User
   - Password
   - Database name
4. Download or copy the CA certificate.

Keep the CA certificate private. It starts with:

```text
-----BEGIN CERTIFICATE-----
```

and ends with:

```text
-----END CERTIFICATE-----
```

Before deployment, confirm the copied Aiven password matches the password currently active on the Aiven service.

## 3. Local Smoke Test With Aiven

Create a root `.env` from `.env.example`, then fill in your real values.

For local development, download the Aiven CA certificate to:

```text
E:/GitHub/s3959931-s3978302-a2/aiven-ca.pem
```

Use forward slashes in `.env`:

```env
DB_SSL=true
DB_CA_CERT_PATH=E:/GitHub/s3959931-s3978302-a2/aiven-ca.pem
```

Test the database connection from the backend folder:

```powershell
cd E:\GitHub\s3959931-s3978302-a2\backend

node -e "require('dotenv').config({path:'../.env'}); const fs=require('fs'); const mysql=require('mysql2/promise'); const ca=process.env.DB_CA_CERT_PATH ? fs.readFileSync(process.env.DB_CA_CERT_PATH,'utf8') : process.env.DB_CA_CERT?.replace(/\\n/g,'\n'); mysql.createConnection({host:process.env.DB_HOST,port:Number(process.env.DB_PORT),user:process.env.DB_USERNAME,password:process.env.DB_PASSWORD,database:process.env.DB_NAME,ssl:process.env.DB_SSL==='true'?(ca?{ca}:{}):undefined,connectTimeout:10000}).then(async c=>{console.log('DB OK'); await c.end();}).catch(e=>{console.error(e.code, e.message); process.exit(1);})"
```

Expected result:

```text
DB OK
```

If you see `HANDSHAKE_SSL_ERROR self-signed certificate in certificate chain`, the host is reachable but Node does not trust the CA. Recheck `DB_CA_CERT_PATH` or the copied CA certificate.

If you see `ENOTFOUND`, the Aiven host was copied incorrectly or the service is not ready.

If you see `ETIMEDOUT`, the database host is not reachable from your machine or the service is not running.

## 4. Start Locally Before Deploying

Start the normal backend first:

```powershell
cd E:\GitHub\s3959931-s3978302-a2\backend
npm run dev
```

Check:

- `http://localhost:5000/health`
- `http://localhost:5000/db-test`
- `http://localhost:5000/api/database/status`

If data is missing, seed demo data:

```powershell
Invoke-RestMethod -Method Post http://localhost:5000/api/database/seed
```

Then start the admin backend:

```powershell
cd E:\GitHub\s3959931-s3978302-a2\admin-backend
npm run dev
```

Check:

- `http://localhost:4002/health`

Then start both frontends:

```powershell
cd E:\GitHub\s3959931-s3978302-a2\frontend
npm run dev
```

```powershell
cd E:\GitHub\s3959931-s3978302-a2\admin-frontend
npm run dev
```

Open:

- `http://localhost:3000`
- `http://localhost:3001`

Demo admin login:

```text
admin / admin
```

For a fresh database, this only works if `ADMIN_EMAIL=admin` and `ADMIN_PASSWORD=admin` are set when `admin-backend` creates the admin user.

## 5. Deploy `backend` on Render

In Render:

1. Click `New +`.
2. Click `Web Service`.
3. Connect GitHub if needed.
4. Choose the repo `s3959931-s3978302-a2`.
5. Use these settings:

| Setting | Value |
| --- | --- |
| Name | `teaching-tutor-backend` |
| Runtime | `Node` |
| Branch | `main` |
| Root Directory | `backend` |
| Build Command | `npm ci && npm run build` |
| Start Command | `npm start` |
| Instance Type | `Free` |

Add environment variables:

```env
NODE_ENV=production
DB_HOST=your-aiven-host
DB_PORT=your-aiven-port
DB_USERNAME=avnadmin
DB_PASSWORD=your-aiven-password
DB_NAME=defaultdb
DB_SSL=true
DB_CA_CERT_PATH=/etc/secrets/aiven-ca.pem
JWT_SECRET=replace-with-long-random-string
BACKEND_JWT_SECRET=replace-with-long-random-string
```

Do not manually set `PORT` on Render. Render provides it.

Add a Render secret file:

| Field | Value |
| --- | --- |
| Filename | `aiven-ca.pem` |
| Contents | Full Aiven CA certificate |

Render exposes that file at:

```text
/etc/secrets/aiven-ca.pem
```

Deploy, then test:

- `https://your-backend.onrender.com/health`
- `https://your-backend.onrender.com/db-test`
- `https://your-backend.onrender.com/api/database/status`

If the database is empty, seed it:

```powershell
Invoke-RestMethod -Method Post https://your-backend.onrender.com/api/database/seed
```

## 6. Deploy `admin-backend` on Render

Create another Render Web Service from the same repo.

| Setting | Value |
| --- | --- |
| Name | `teaching-tutor-admin-backend` |
| Runtime | `Node` |
| Branch | `main` |
| Root Directory | `admin-backend` |
| Build Command | `npm ci && npm run build` |
| Start Command | `npm start` |
| Instance Type | `Free` |

Add environment variables:

```env
NODE_ENV=production
DB_HOST=your-aiven-host
DB_PORT=your-aiven-port
DB_USERNAME=avnadmin
DB_PASSWORD=your-aiven-password
DB_NAME=defaultdb
DB_SSL=true
DB_CA_CERT_PATH=/etc/secrets/aiven-ca.pem
JWT_SECRET=replace-with-long-random-string
ADMIN_JWT_SECRET=replace-with-long-random-string
ADMIN_SESSION_SECRET=replace-with-long-random-string
ADMIN_EMAIL=admin
ADMIN_PASSWORD=admin
```

Add the same Render secret file:

| Field | Value |
| --- | --- |
| Filename | `aiven-ca.pem` |
| Contents | Full Aiven CA certificate |

Deploy, then test:

- `https://your-admin-backend.onrender.com/health`

After both Vercel frontends are deployed, come back to this Render service and add:

```env
FRONTEND_URL=https://your-frontend.vercel.app
ADMIN_FRONTEND_URL=https://your-admin-frontend.vercel.app
```

Then choose `Save, rebuild, and deploy`.

## 7. Deploy `frontend` on Vercel

In Vercel:

1. Click `Add New`.
2. Click `Project`.
3. Import the same GitHub repo.
4. Use these settings:

| Setting | Value |
| --- | --- |
| Framework Preset | `Next.js` |
| Root Directory | `frontend` |
| Build Command | Default or `npm run build` |

Add environment variables:

```env
NEXT_PUBLIC_API_ENDPOINT=https://your-backend.onrender.com/api
NEXT_PUBLIC_ADMIN_GRAPHQL_ENDPOINT=https://your-admin-backend.onrender.com/graphql
NEXT_PUBLIC_ADMIN_WS_ENDPOINT=wss://your-admin-backend.onrender.com/graphql
```

Deploy and save the Vercel URL.

## 8. Deploy `admin-frontend` on Vercel

Create another Vercel project from the same GitHub repo.

| Setting | Value |
| --- | --- |
| Framework Preset | `Next.js` |
| Root Directory | `admin-frontend` |
| Build Command | Default or `npm run build` |

Add environment variables:

```env
NEXT_PUBLIC_ADMIN_GRAPHQL_ENDPOINT=https://your-admin-backend.onrender.com/graphql
NEXT_PUBLIC_ADMIN_WS_ENDPOINT=wss://your-admin-backend.onrender.com/graphql
```

Deploy and save the admin Vercel URL.

## 9. Final Demo Checklist

Before presenting, wake both Render services:

- `https://your-backend.onrender.com/health`
- `https://your-admin-backend.onrender.com/health`

Then test:

- User frontend loads from Vercel.
- Courses load on the user frontend.
- Candidate signup works with an email ending in `@candidate.edu.au`.
- Lecturer login works with seeded lecturer data if you need lecturer workflows.
- Admin frontend loads from Vercel.
- Admin login works with `admin / admin`.
- Admin dashboard can read users, courses, and reports.

Seeded lecturer accounts created by `POST /api/database/seed`:

| Email | Password |
| --- | --- |
| `john.smith@lecturer.edu.au` | `lecturer123` |
| `sarah.johnson@lecturer.edu.au` | `lecturer123` |
| `michael.williams@lecturer.edu.au` | `lecturer123` |
| `emily.brown@lecturer.edu.au` | `lecturer123` |
| `david.davis@lecturer.edu.au` | `lecturer123` |
| `lisa.wilson@lecturer.edu.au` | `lecturer123` |

The seed endpoint also creates 2 roles, 6 courses, and 12 lecturer-course assignments if they do not already exist.

## Useful Local Maintenance Commands

If a stale backend process keeps serving old `.env` values on Windows, stop Node processes for this repo:

```powershell
Get-CimInstance Win32_Process -Filter "name = 'node.exe'" |
  Where-Object { $_.CommandLine -like '*s3959931-s3978302-a2*' } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
```

If the admin user already exists with the wrong password, reset it locally after `.env` points at the correct database:

```powershell
cd E:\GitHub\s3959931-s3978302-a2\admin-backend

node -e "require('dotenv').config({path:'../.env'}); const fs=require('fs'); const bcrypt=require('bcryptjs'); const mysql=require('mysql2/promise'); const ssl=process.env.DB_SSL==='true' ? (process.env.DB_CA_CERT_PATH ? {ca:fs.readFileSync(process.env.DB_CA_CERT_PATH,'utf8')} : process.env.DB_CA_CERT ? {ca:process.env.DB_CA_CERT.replace(/\\n/g,'\n')} : {}) : undefined; (async()=>{const hash=await bcrypt.hash('admin',10); const c=await mysql.createConnection({host:process.env.DB_HOST,port:Number(process.env.DB_PORT),user:process.env.DB_USERNAME,password:process.env.DB_PASSWORD,database:process.env.DB_NAME,ssl}); await c.query('UPDATE users SET password=? WHERE email=? AND userType=?',[hash,'admin','admin']); await c.end(); console.log('Admin password reset to admin');})().catch(e=>{console.error(e); process.exit(1);})"
```

## Troubleshooting

| Symptom | What it means | Fix |
| --- | --- | --- |
| `Cannot find module 'dotenv'` from root `node -e` command | The command ran outside a package that has `dotenv` installed | Run the command from `backend` and load `../.env` |
| `ENOTFOUND` | Wrong Aiven host or DNS not ready | Copy the Host field again from Aiven and confirm service is `Running` |
| `ETIMEDOUT` | Database host is unreachable | Confirm Aiven service status and copied port |
| `HANDSHAKE_SSL_ERROR self-signed certificate in certificate chain` | TLS works but CA certificate is missing or incomplete | Use full CA certificate through `DB_CA_CERT_PATH` or `DB_CA_CERT` |
| `/db-test` shows `connected:false` | Backend process is using stale or wrong env values | Stop and restart backend after editing `.env` |
| `/db-test` shows `isEmpty:true` | The database needs seed/demo data | POST `/api/database/seed` |
| Admin login does not accept `admin / admin` | Admin user was created with a different password | Set `ADMIN_PASSWORD=admin` before first admin-backend start, or reset the existing admin password |
| Vercel frontend cannot call API | URL env vars are wrong or missing | Use `https://` for HTTP endpoints, `/api` for REST, `/graphql` for GraphQL, and `wss://` for WebSocket |
| Admin frontend blocked by CORS | `admin-backend` does not know deployed frontend URLs | Set `FRONTEND_URL` and `ADMIN_FRONTEND_URL` on Render admin-backend and redeploy |
| WebSocket disconnects during demo | Render Free service slept or restarted | Open the Render health URLs before presenting |

## Official Platform References

- Render Free instances: https://render.com/docs/free
- Render environment variables and secret files: https://render.com/docs/configure-environment-variables
- Vercel monorepos: https://vercel.com/docs/monorepos
- Vercel environment variables: https://vercel.com/docs/environment-variables
- Aiven for MySQL: https://aiven.io/docs/products/mysql
- Aiven TLS/SSL certificates: https://aiven.io/docs/platform/concepts/tls-ssl-certificates
