# Environment and Secret Handling

The backends read server configuration from the root `.env` file during local development. The frontends read their own `NEXT_PUBLIC_*` values from each frontend's environment at build time.

Never commit real `.env` files, passwords, JWT secrets, or Aiven CA files.

## Local Root `.env`

Create this file at the repository root:

```text
E:/GitHub/s3959931-s3978302-a2/.env
```

Use `.env.example` as the template.

Required database values:

```env
DB_HOST=your-aiven-host
DB_PORT=your-aiven-port
DB_USERNAME=avnadmin
DB_PASSWORD=your-aiven-password
DB_NAME=defaultdb
DB_SSL=true
DB_CA_CERT_PATH=E:/GitHub/s3959931-s3978302-a2/aiven-ca.pem
```

Required auth/admin values:

```env
JWT_SECRET=replace-with-long-random-string
BACKEND_JWT_SECRET=replace-with-long-random-string
ADMIN_JWT_SECRET=replace-with-long-random-string
ADMIN_SESSION_SECRET=replace-with-long-random-string
ADMIN_EMAIL=admin
ADMIN_PASSWORD=admin
```

Local service ports:

```env
BACKEND_PORT=5000
ADMIN_BACKEND_PORT=4002
```

Local frontend values are optional because the code defaults to local URLs. If you need to override them locally, put them in `frontend/.env.local` and `admin-frontend/.env.local`, not only in the root `.env`.

```env
NEXT_PUBLIC_API_ENDPOINT=http://localhost:5000/api
NEXT_PUBLIC_ADMIN_GRAPHQL_ENDPOINT=http://localhost:4002/graphql
NEXT_PUBLIC_ADMIN_WS_ENDPOINT=ws://localhost:4002/graphql
```

For Vercel, add the same `NEXT_PUBLIC_*` values in each Vercel project's Environment Variables screen.

## Hosted Environment Values

Use the same Aiven database values for both Render backend services.

For Render, prefer a secret file:

```env
DB_SSL=true
DB_CA_CERT_PATH=/etc/secrets/aiven-ca.pem
```

Add a Render secret file named:

```text
aiven-ca.pem
```

Render makes it available at:

```text
/etc/secrets/aiven-ca.pem
```

If a platform cannot use secret files, use `DB_CA_CERT` and paste the full certificate with newline escapes:

```env
DB_CA_CERT="-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----"
```

## Variable Ownership

| Variable | Used by | Purpose |
| --- | --- | --- |
| `DB_HOST` | `backend`, `admin-backend` | MySQL hostname |
| `DB_PORT` | `backend`, `admin-backend` | MySQL port |
| `DB_USERNAME` | `backend`, `admin-backend` | MySQL username |
| `DB_PASSWORD` | `backend`, `admin-backend` | MySQL password |
| `DB_NAME` | `backend`, `admin-backend` | MySQL database name |
| `DB_SSL` | `backend`, `admin-backend` | Enables TLS when set to `true` |
| `DB_CA_CERT_PATH` | `backend`, `admin-backend` | Path to CA certificate file |
| `DB_CA_CERT` | `backend`, `admin-backend` | Inline CA certificate alternative |
| `JWT_SECRET` | both backends | Shared fallback JWT secret |
| `BACKEND_JWT_SECRET` | `backend` | JWT secret for normal user auth |
| `ADMIN_JWT_SECRET` | `admin-backend` | JWT secret for admin auth |
| `ADMIN_SESSION_SECRET` | `admin-backend` | Express session secret |
| `ADMIN_EMAIL` | `admin-backend` | Seed admin email/login |
| `ADMIN_PASSWORD` | `admin-backend` | Seed admin password |
| `FRONTEND_URL` | `admin-backend` | Deployed user frontend URL for CORS |
| `ADMIN_FRONTEND_URL` | `admin-backend` | Deployed admin frontend URL for CORS |
| `BACKEND_PORT` | `backend` | Local backend port override |
| `ADMIN_BACKEND_PORT` | `admin-backend` | Local admin backend port override |
| `NEXT_PUBLIC_API_ENDPOINT` | `frontend` | User REST API base URL |
| `NEXT_PUBLIC_ADMIN_GRAPHQL_ENDPOINT` | both frontends | Admin GraphQL HTTP URL |
| `NEXT_PUBLIC_ADMIN_WS_ENDPOINT` | both frontends | Admin GraphQL WebSocket URL |

## Generating Local Secrets

Run this command multiple times and use a different value for each secret:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

For demo admin login, `ADMIN_EMAIL=admin` and `ADMIN_PASSWORD=admin` are intentionally simple. Do not use `admin / admin` for a real deployment.

## Files That Must Stay Private

The following files must not be committed:

- `.env`
- `.env.local`
- `.env.development.local`
- `.env.test.local`
- `.env.production.local`
- `aiven-ca.pem`
- any `*.pem` file

The current `.gitignore` includes these patterns.
