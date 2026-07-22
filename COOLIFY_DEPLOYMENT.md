# Deploy Hinkro on Coolify

Hinkro runs as one Docker container. Node serves the built React site and the single
`/api/upload` endpoint used to create short-lived Cloudflare R2 upload URLs. Supabase
and R2 remain managed services; they do not run inside Coolify.

```text
Browser -> Coolify/Node -> React site
                    |--> /api/upload -> Cloudflare R2
Browser -----------------------------> Supabase
```

There is no Nginx, Redis, database container, Docker Compose stack, or persistent
volume to configure.

## Before you deploy

You need:

- A working Coolify server and a domain pointed to it.
- Coolify access to `nitlimited/Hinkro-New-Site` through its GitHub App.
- The managed Supabase project URL and anon key.
- The existing R2 account ID, access-key ID, secret, bucket name, and public URL.

The repository already contains the production `Dockerfile`. Coolify should deploy
that file directly.

## 1. Create the Coolify application

1. In Coolify, open the desired project and environment.
2. Select **New Resource -> Private Repository (GitHub App)**.
3. Choose `nitlimited/Hinkro-New-Site` and the production branch.
4. Select **Dockerfile** as the build pack.
5. Use `/Dockerfile` as the Dockerfile location and `/` as the build context.
6. Set the exposed/container port to `3000`.
7. Add the production domain and enable HTTPS.
8. Set the health-check path to `/api/health` on port `3000`.

Do not add a database, persistent storage, or a second Coolify resource for this app.

## 2. Add build variables

These values are compiled into the browser application. In Coolify, add them as
environment variables and enable **Available at Buildtime** (the label can vary by
Coolify version):

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_GOOGLE_MAPS_API_KEY=YOUR_BROWSER_MAPS_KEY
VITE_GOOGLE_PLACE_ID=YOUR_GOOGLE_PLACE_ID
VITE_VAPID_PUBLIC_KEY=YOUR_PUBLIC_VAPID_KEY
```

The first two are required for Supabase-backed content and the portal. The Maps and
VAPID values are needed only when those features are used.

`VITE_` variables are public by design. Never put an R2 secret, Supabase service-role
key, or VAPID private key in a `VITE_` variable.

## 3. Add runtime variables

Add these to the same Coolify application, but do **not** expose them as build
arguments:

```dotenv
R2_ACCOUNT_ID=YOUR_R2_ACCOUNT_ID
R2_ACCESS_KEY_ID=YOUR_R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY=YOUR_R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME=YOUR_BUCKET
R2_PUBLIC_URL=https://YOUR_PUBLIC_R2_DOMAIN
ALLOWED_ORIGINS=https://hinkrokente.com,https://hinkrokente.com
PORT=3000
```

Use the actual domains attached to the application in `ALLOWED_ORIGINS`. If only one
domain is served, list only that domain. Do not add a trailing slash.

## 4. Configure R2 CORS

The browser uploads the selected image directly to R2 after Node signs the request.
The R2 bucket must therefore permit `PUT` from the production site. A minimal policy
is:

```json
[
  {
    "AllowedOrigins": [
      "https://hinkrokente.com",
      "https://hinkrokente.com"
    ],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Keep the R2 API token scoped to this bucket. `R2_PUBLIC_URL` must be a public bucket
domain if uploaded booking images are expected to display through that URL.

## 5. Check Supabase once

The Coolify deployment does not create or migrate Supabase. Before launch, confirm:

- The repository migrations have been applied to the production project.
- The first intended owner has the correct role in `public.profiles`.
- Supabase **Authentication -> URL Configuration** contains the production Site URL
  and `/portal` redirect URL.
- Required Edge Functions, Realtime publications, email/SMTP, and scheduled jobs are
  configured for the portal features you actually intend to use.
- Row Level Security policies are enabled and tested with a normal user, not only an
  administrator.

Do not deploy every optional function merely because it exists. Start with the
features this small site uses and add the rest when needed.

## 6. Deploy and verify

Click **Deploy**. A successful deployment should pass these checks:

```bash
curl -f https://YOUR_DOMAIN/api/health
curl -I https://YOUR_DOMAIN/
curl -I https://YOUR_DOMAIN/portal
```

Then test in a browser:

1. Public home, product, and blog pages load after a hard refresh.
2. Portal sign-in works and redirects back to the production domain.
3. Public catalog data loads from Supabase.
4. A booking reference image uploads and displays from R2.
5. A non-admin account cannot perform admin-only Supabase operations.

Afterward, enable automatic deployment on pushes to the production branch if that is
the workflow you want.

## Local production check

Copy `.env.example` to `.env`, fill in the values, then run:

```bash
docker compose up --build
```

Open `http://localhost:3000` and stop it with `docker compose down`.

## Important limitation

`/api/upload` is intentionally small: it checks the origin, MIME type, file size, and
rate-limits each IP before issuing a five-minute signed R2 URL. Origin checking is not
user authentication. If anonymous upload abuse becomes a real problem, add Turnstile
or require Supabase authentication at that endpoint. For the current small booking
site, monitoring the R2 bucket and Coolify logs is a proportionate starting point.
