# Rasikawan Portfolio Platform

Multi-tenant portfolio website for kids, plus a hidden admin panel.

- **Backend:** Node.js + Express, PostgreSQL, session auth.
- **Admin SPA:** Vite + React, served from `admin.rasikawan.com`.
- **Portfolio themes:** filesystem bundles (HTML + JSX) — matches the Claude Design export format 1:1, so new themes can be uploaded as ZIPs without touching the core app.

## Routing

| Host                                  | What it serves                              |
|---------------------------------------|---------------------------------------------|
| `rasikawan.com`                       | Apex landing page                           |
| `admin.rasikawan.com`                 | Admin SPA + `/api/*` REST API               |
| `{firstname}.rasikawan.com`           | That child's portfolio (theme + content)    |

Subdomain detection is done by parsing the `Host` header (see [src/middleware/subdomain.js](src/middleware/subdomain.js)). Vary headers on `Host` prevent cache leakage between tenants.

## Quick start

```bash
# 1) install
npm install
(cd admin && npm install)

# 2) configure
cp .env.example .env
#   set PGPASSWORD, SESSION_SECRET, BOOTSTRAP_ADMIN_PASSWORD
#   optionally set DEV_FORCE_SUBDOMAIN=admin to use http://localhost:3000 for the admin

# 3) migrate (applies schema, syncs built-in themes, creates bootstrap admin)
npm run migrate

# 4) run the server
npm run dev                  # backend on :3000
npm run admin:dev            # admin SPA on :5173 (proxies /api -> :3000)

# 5) build admin for production
npm run admin:build          # writes admin/dist/, served by Express under admin.<root>
```

## Local subdomain testing

Production uses real DNS. Locally, either:

**A) Use the dev shim** — set `DEV_FORCE_SUBDOMAIN=admin` in `.env`, restart, then visit `http://localhost:3000`. Switch to a child subdomain by setting `DEV_FORCE_SUBDOMAIN=kong` and restart.

**B) Add hosts entries** so you can test multi-tenant routing simultaneously:
```
127.0.0.1   rasikawan.com
127.0.0.1   admin.rasikawan.com
127.0.0.1   kong.rasikawan.com
```
Then visit `http://admin.rasikawan.com:3000` and `http://kong.rasikawan.com:3000`.

## Tenancy & isolation

- Each child row has a unique `firstname_slug` (the subdomain key).
- The portfolio renderer (`src/routes/portfolio.js`) loads only the child matching the request's subdomain.
- The admin REST API (`/api/*`) is gated by `adminOnly` middleware — it returns 404 on every non-admin host, so it's not even discoverable from a public portfolio page.
- Media is served via `/_media/:childId/:mediaId` and tenant-checked: it 404s if the child ID doesn't match the requesting subdomain.
- Admin session cookies are scoped via `SESSION_COOKIE_DOMAIN`, so portfolio pages never send admin credentials.

## Themes

A theme is a directory under `src/themes/<slug>/` containing:
- `manifest.json` — `{ name, description, entry }` (entry defaults to `index.html`).
- `index.html` — must contain the marker `<!--PORTFOLIO_DATA-->` somewhere in `<head>`. At render time the server replaces it with a `<base href=".../_theme-assets/">` tag and a `<script>` defining `window.PORTFOLIO_DATA` and the `window.L(field, lang)` helper.
- Any JSX / JS / CSS / image assets the theme needs.

Built-in themes ship in `src/themes/{comic,sticker,hero,capy}` and follow the Claude Design export shape verbatim.

Uploaded themes land in `src/themes/_uploaded/<slug>/` and shadow built-ins of the same name. Admins upload them as ZIPs from the **Themes** page in the admin panel. The first top-level directory in the ZIP is stripped, so a Claude Design export with a `my-theme/` wrapper directory works directly.

## Multilang

Multilang fields are stored as `{"en": "...", "th": "..."}`. v1 only renders the English values, but the data shape and the renderer's `L(field, lang)` helper are already lang-aware, so flipping the toggle on later doesn't require a data migration.

## Project layout

```
.
├── db/
│   ├── schema.sql            # full schema, idempotent
│   └── migrate.js            # apply schema + sync themes + bootstrap admin
├── src/
│   ├── server.js             # Express entry, subdomain dispatch
│   ├── config.js             # env -> config object
│   ├── db.js                 # pg pool
│   ├── middleware/
│   │   ├── subdomain.js      # Host -> tenant kind
│   │   └── auth.js           # session guard + adminOnly
│   ├── routes/
│   │   ├── admin-api.js      # REST API for the admin SPA
│   │   └── portfolio.js      # child portfolio render + asset + media routes
│   ├── services/
│   │   ├── children.js
│   │   ├── portfolios.js
│   │   ├── themes.js
│   │   └── media.js
│   └── themes/
│       ├── registry.js       # scan + resolve theme bundles
│       ├── render.js         # inject PORTFOLIO_DATA into a theme's index.html
│       ├── comic/  sticker/  hero/  capy/    # built-in bundles
│       └── _uploaded/        # destination for admin-uploaded themes
└── admin/                    # Vite + React admin SPA
    ├── index.html
    └── src/
        ├── main.jsx App.jsx api.js
        └── pages/
            ├── Login.jsx
            ├── Children.jsx
            ├── ChildEditor.jsx
            └── Themes.jsx
```

## Bootstrap admin

On first `npm run migrate`, an admin user is created from `BOOTSTRAP_ADMIN_EMAIL` / `BOOTSTRAP_ADMIN_PASSWORD`. Change the password right after first login (or re-run migrate after rotating the env vars — passwords aren't overwritten on existing admins; the bootstrap step only runs if the email isn't already present).

## Production deployment

End-to-end steps for deploying to a single Ubuntu/Debian VPS with Nginx + Let's Encrypt + systemd. Adjust paths/usernames as needed.

### 1. DNS

Add two records at your DNS provider, both pointing at the server's public IP:

| Type | Name              | Value           |
|------|-------------------|-----------------|
| A    | `rasikawan.com`   | `<server IP>`   |
| A    | `*.rasikawan.com` | `<server IP>`   |

The wildcard covers both `admin.rasikawan.com` and every `{firstname}.rasikawan.com`. Wait until DNS propagates (`dig +short admin.rasikawan.com`) before issuing certs.

### 2. Server prep

```bash
# as root
adduser --disabled-password --gecos "" portfolio
apt update && apt install -y curl git nginx ufw build-essential
ufw allow OpenSSH && ufw allow 'Nginx Full' && ufw --force enable

# Node 20 LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v   # should print v20.x
```

### 3. PostgreSQL

The app is configured to use the external Postgres at `103.40.118.129`. Confirm reachability and that `portfolio_db` exists:

```bash
# from the app server, test connectivity
PGPASSWORD='...' psql -h 103.40.118.129 -U postgres -d postgres -c "SELECT 1"

# create the database if it doesn't already exist
PGPASSWORD='...' psql -h 103.40.118.129 -U postgres -d postgres \
  -c "CREATE DATABASE portfolio_db"
```

Make sure the Postgres host's `pg_hba.conf` allows TCP from the app server's IP, and that the firewall on the DB host opens 5432 only to the app server.

### 4. Clone, build, configure

```bash
sudo -iu portfolio
git clone https://github.com/neston2609/portfolio.git ~/app
cd ~/app

npm ci --omit=dev
npm run admin:build       # builds admin/dist for Express to serve

cp .env.example .env
# edit .env:
#   NODE_ENV=production
#   PORT=3000
#   ROOT_DOMAIN=rasikawan.com
#   PGPASSWORD=<real password>
#   SESSION_SECRET=<openssl rand -hex 32>
#   SESSION_COOKIE_DOMAIN=         # leave blank — host-only cookies on admin.<root>
#   BOOTSTRAP_ADMIN_EMAIL=admin@rasikawan.com
#   BOOTSTRAP_ADMIN_PASSWORD=<strong one-time password>
chmod 600 .env

npm run migrate           # applies schema, registers built-in themes, creates first admin
```

After your first login, change the bootstrap admin's password (or delete the row and create a new admin via SQL). The migrate step skips bootstrap if the email already exists, so re-running migrate is safe.

### 5. systemd service

```bash
# as root
cat >/etc/systemd/system/portfolio.service <<'EOF'
[Unit]
Description=Rasikawan Portfolio
After=network.target

[Service]
Type=simple
User=portfolio
WorkingDirectory=/home/portfolio/app
EnvironmentFile=/home/portfolio/app/.env
ExecStart=/usr/bin/node src/server.js
Restart=on-failure
RestartSec=5
# Lock the process down
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=read-only
ReadWritePaths=/home/portfolio/app/uploads /home/portfolio/app/src/themes/_uploaded

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now portfolio
systemctl status portfolio
journalctl -u portfolio -f      # tail logs
```

### 6. Nginx reverse proxy

```nginx
# /etc/nginx/sites-available/rasikawan
# Single server block handles the apex, admin, and every child subdomain.

server {
    listen 80;
    listen [::]:80;
    server_name rasikawan.com admin.rasikawan.com *.rasikawan.com;
    # Let certbot answer HTTP-01 challenges; everything else redirects to HTTPS.
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / { return 301 https://$host$request_uri; }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name rasikawan.com admin.rasikawan.com *.rasikawan.com;

    ssl_certificate     /etc/letsencrypt/live/rasikawan.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/rasikawan.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    # Reasonable defaults
    client_max_body_size 25m;        # match MAX_UPLOAD_MB in .env (default 20)
    proxy_read_timeout 60s;

    location / {
        proxy_pass http://127.0.0.1:3000;
        # CRITICAL: pass the original Host so the tenant middleware can route.
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host  $host;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/rasikawan /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

### 7. TLS — wildcard certificate

Single-domain certs don't cover `*.rasikawan.com`. Issue a wildcard cert with the DNS-01 challenge (HTTP-01 can't validate wildcards):

```bash
apt install -y certbot
certbot certonly --manual --preferred-challenges=dns \
  -d 'rasikawan.com' -d '*.rasikawan.com' \
  --agree-tos -m admin@rasikawan.com

# Certbot will print a TXT record like _acme-challenge.rasikawan.com — add it
# to your DNS, wait for propagation (dig TXT _acme-challenge.rasikawan.com),
# then press Enter to complete.
```

If your DNS provider has a certbot plugin (Cloudflare, Route53, DigitalOcean, etc.) prefer that — it automates renewal. Manual DNS-01 won't auto-renew; either move to a plugin or set a calendar reminder every 60 days:

```bash
certbot renew --manual --preferred-challenges=dns
systemctl reload nginx
```

### 8. Verify

```bash
curl -I https://rasikawan.com                         # 200, apex landing
curl -I https://admin.rasikawan.com                   # 200, admin SPA
curl -I https://admin.rasikawan.com/api/auth/me       # 401, unauthed
curl -I https://nobody.rasikawan.com                  # 404, no such child
```

Log in at `https://admin.rasikawan.com` with `BOOTSTRAP_ADMIN_EMAIL`, create a child (slug e.g. `kong`), then visit `https://kong.rasikawan.com` to see the rendered portfolio.

### 9. Updates / redeploys

```bash
sudo -iu portfolio
cd ~/app
git pull
npm ci --omit=dev
npm run admin:build
npm run migrate            # idempotent — safe even if no schema change
sudo systemctl restart portfolio
```

For zero-downtime restarts behind Nginx, run two Node processes on different ports (`PORT=3001` second copy), point Nginx `proxy_pass` at an upstream pool, and restart them one at a time.

### 10. Backups

Daily Postgres dump + uploads tarball, off-host:

```bash
# /etc/cron.daily/portfolio-backup (chmod +x)
#!/bin/bash
set -e
DEST=/var/backups/portfolio
DATE=$(date +%F)
mkdir -p "$DEST"
PGPASSWORD='...' pg_dump -h 103.40.118.129 -U postgres portfolio_db \
  | gzip > "$DEST/db-$DATE.sql.gz"
tar czf "$DEST/uploads-$DATE.tar.gz" -C /home/portfolio/app uploads src/themes/_uploaded
# rotate: keep last 14
find "$DEST" -type f -mtime +14 -delete
# upload to off-site storage (S3, rsync to another box, etc.)
```

Verify restores periodically — a backup you've never restored isn't a backup.

### 11. Operational notes

- **Cookies:** leave `SESSION_COOKIE_DOMAIN` blank. That gives host-only cookies on `admin.rasikawan.com`, so the admin session can never leak to a child portfolio page. Setting it to `.rasikawan.com` would defeat tenant isolation.
- **`trust proxy`:** the server already sets `app.set('trust proxy', 1)`, which is needed for `secure: true` cookies to work behind Nginx. If you put a second reverse proxy (e.g. Cloudflare) in front, increase to `2`.
- **Uploads & themes:** persisted under `~/app/uploads/` and `~/app/src/themes/_uploaded/`. Both are excluded by `.gitignore` and survive redeploys (you `git pull` rather than re-cloning). Back them up.
- **Logs:** `journalctl -u portfolio -f` for the app, `/var/log/nginx/{access,error}.log` for the proxy.
- **Rate limiting:** there's no rate limit on `/api/auth/login`. For internet-facing admin you should add one (Nginx `limit_req` zone or `express-rate-limit`) before opening admin login to the world. Alternatively, restrict `admin.rasikawan.com` to a VPN/office IP in Nginx with `allow`/`deny`.

## Pushing changes

A helper script wraps the daily "stage → commit → push" cycle:

```bash
./scripts/push.sh "your commit message"      # one-liner
./scripts/push.sh                            # opens an interactive prompt
./scripts/push.sh --amend                    # amend last commit, push with --force-with-lease
./scripts/push.sh -n "msg"                   # dry run (no writes)

# or via npm:
npm run push -- "your commit message"
```

What it does: refuses to run on detached HEAD, prompts before pushing directly to `main`/`master` (override with `ALLOW_MAIN_PUSH=1`), runs `git add -A` (respects `.gitignore`), commits with your message, and pushes to the branch's tracked upstream. Never uses `--force` (only `--force-with-lease` on `--amend`) and never skips hooks.

## License

Internal project — not licensed for redistribution.
