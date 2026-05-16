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

## License

Internal project — not licensed for redistribution.
