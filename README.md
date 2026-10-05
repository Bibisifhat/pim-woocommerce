# PIM: Product Information Management for WooCommerce

A small but complete **Product Information Management (PIM)** system. It is the central place where product data is created, structured and edited, and it synchronizes that data to a **WooCommerce** store through the WooCommerce REST API.

Built for a 120-minute hackathon: full stack (frontend, backend, database) plus a live e-commerce integration.

---
# Demo video drive link

**https://drive.google.com/drive/folders/1eZBmRmqT9LKuZ6K5cf28HEQk0FtLxVem?usp=drive_link**
---

## Table of contents

1. [What is a PIM?](#what-is-a-pim)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Tech stack and why](#tech-stack-and-why)
5. [Project structure](#project-structure)
6. [Getting started](#getting-started)
7. [WooCommerce integration](#woocommerce-integration)
8. [Demo walkthrough](#demo-walkthrough)
9. [API reference](#api-reference)
10. [Data model](#data-model)
11. [Design decisions](#design-decisions)
12. [Troubleshooting](#troubleshooting)
13. [Future scope](#future-scope)

---

## What is a PIM?

A PIM is the **single source of truth for product information**: names, SKUs, prices, stock, categories and attributes such as brand, color, size and material. Instead of editing products inside the online store, a team manages them centrally and pushes them out to the e-commerce platform.

```
Products  →  Attributes  →  Categories  →  Sync to WooCommerce
```

## Features

- **Product catalog**: create, view, edit and delete products; search by name, SKU or brand; filter by category.
- **Structured attributes**: brand, color, size and material are stored as fields, not free text.
- **Categories**: products are organized by category and can be filtered by it.
- **WooCommerce sync**: push one product or all pending products to WooCommerce, with per-product status tracking.
- **Drift detection**: editing a synced product marks it *Out of date*, so stale data is never hidden.
- **Dashboard**: counts of total, synced, not-synced and out-of-date products.
- **Mock fallback**: when no store credentials are set, sync targets a built-in mock WooCommerce store, so the app always runs.

### Sync status lifecycle

| Status | Meaning |
|---|---|
| ⚠ Not synced | New product, never pushed to WooCommerce |
| ✓ Synced | Pushed, and identical to the store version |
| ↻ Out of date | Edited in the PIM after the last sync |
| ✕ Error | The last sync attempt failed |

The first sync **creates** the product in WooCommerce (`POST`). The returned `woo_id` is stored, and later syncs **update** that same product (`PUT`).

## Architecture

```
        React + CSS (Vite)
               │
               │  REST  (/api)
               ▼
        Node.js + Express
               │
       ┌───────┴────────────────┐
       ▼                        ▼
 SQLite (node:sqlite)   WooCommerce Integration Layer
                        (services/woocommerce.js)
                                │
                                │  WooCommerce REST API v3
                                ▼
                  WooCommerce store  (or built-in mock)
```

All WooCommerce logic lives in one service file. Routes and UI never talk to the store directly, so the integration can be changed or replaced without touching the rest of the app.

## Tech stack and why

| Layer | Choice | Reason |
|---|---|---|
| Frontend | React + Vite | Fast setup and instant hot reload |
| Styling | Plain CSS | No build config, no extra dependencies |
| Backend | Node.js + Express | Minimal REST API, quick to build |
| Language | JavaScript | No type-setup overhead in a short timebox |
| Database | SQLite via built-in `node:sqlite` | No database server to install, single file, zero dependencies |
| Integration | WooCommerce REST API v3 | The standard way to manage WooCommerce products programmatically |
| Auth to Woo | Consumer key and secret | WooCommerce's native API authentication |

Deliberately left out: Docker, PostgreSQL, TypeScript, ORMs and Redux. For this scope they add setup risk without adding value. The backend has only two runtime dependencies: `express` and `cors`.

## Project structure

```
PIM/
├── README.md
├── .gitignore
├── backend/
│   ├── package.json
│   ├── .env.example            # WooCommerce credentials template
│   ├── reset-sync.js           # dev helper: reset all sync state
│   ├── data/                   # SQLite file is created here (git-ignored)
│   └── src/
│       ├── server.js           # Express app and route mounting
│       ├── db.js               # schema, seed data, DB connection
│       ├── routes/
│       │   ├── products.js     # CRUD, search, filter
│       │   ├── categories.js   # list, create
│       │   ├── sync.js         # sync one, sync all
│       │   └── mockWoo.js      # built-in mock WooCommerce store
│       └── services/
│           └── woocommerce.js  # WooCommerce integration layer
└── frontend/
    ├── package.json
    ├── vite.config.js          # dev proxy: /api → backend
    └── src/
        ├── main.jsx
        ├── App.jsx             # sidebar and view switching
        ├── api.js              # fetch wrappers for the backend
        ├── index.css           # all styling
        ├── pages/              # Dashboard, Products, Sync
        └── components/         # ProductForm, SyncBadge
```

## Getting started

### Prerequisites

- **Node.js 22.5 or newer** (needed for the built-in `node:sqlite`). Check with `node --version`.
- **npm** (included with Node.js)
- **Git**

### 1. Clone and install

```bash
git clone <your-repo-url>
cd PIM

cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure WooCommerce (optional)

Without this step the app runs against the built-in mock store. To use a real store:

```bash
cd backend
cp .env.example .env      # Windows PowerShell: copy .env.example .env
```

Then edit `backend/.env`:

```
WOO_URL=https://your-store.com
WOO_KEY=ck_xxxxxxxxxxxxxxxx
WOO_SECRET=cs_xxxxxxxxxxxxxxxx
```

See [WooCommerce integration](#woocommerce-integration) for how to get the key and secret.

### 3. Run the app

Use two terminals.

**Terminal 1: backend** (http://localhost:5000)

```bash
cd backend
npm run dev
```

**Terminal 2: frontend** (http://localhost:5173)

```bash
cd frontend
npm run dev
```

Open **http://localhost:5173**. On first start the database is created and seeded with 6 demo products.

> **Windows PowerShell:** if `npm run dev` is blocked by the execution policy, use `npm.cmd run dev` instead.

> **Note:** `http://localhost:5000` is the API only. Opening it in a browser and seeing `Cannot GET /` is normal. The UI is on port 5173.

### Useful commands

| Command | Where | What it does |
|---|---|---|
| `npm run dev` | `backend/` | Start the API with auto-restart and load `.env` |
| `npm run start` | `backend/` | Start the API without auto-restart |
| `node reset-sync.js` | `backend/` | Reset every product to "Not synced" and clear stored store IDs |
| `npm run dev` | `frontend/` | Start the Vite dev server |
| `npm run build` | `frontend/` | Production build into `frontend/dist` |
| `npm run lint` | `frontend/` | Run ESLint |

To reset the database completely, stop the backend, delete `backend/data/pim.db`, and start it again.

## WooCommerce integration

The integration layer (`backend/src/services/woocommerce.js`) calls the **WooCommerce REST API v3**:

| Action | Request |
|---|---|
| Create product | `POST /wp-json/wc/v3/products` |
| Update product | `PUT /wp-json/wc/v3/products/{id}` |
| Find category | `GET /wp-json/wc/v3/products/categories?search=` |
| Create category | `POST /wp-json/wc/v3/products/categories` |

How a PIM product maps to WooCommerce:

| PIM field | WooCommerce field |
|---|---|
| name, description, sku | `name`, `description`, `sku` |
| price | `regular_price` |
| stock | `manage_stock` and `stock_quantity` |
| category | `categories` (resolved to a category ID, created if missing) |
| brand, color, size, material | `attributes` (name and options) |

Behavior worth noting:

- **Create vs update** is decided by whether the product already has a stored `woo_id`.
- **Duplicate SKU**: if the store already has a product with the same SKU, the PIM adopts and updates it instead of failing.
- **Auth**: HTTPS stores use Basic Auth with the key and secret. Plain-HTTP stores use query parameters, as WooCommerce requires.
- **Errors**: a failed sync (for example an invalid key) sets the product to *Error* and shows the message in the UI.

### Getting API credentials

1. In WP admin, go to **WooCommerce → Settings → Advanced → REST API**.
2. Click **Add key**.
3. Choose an admin user and set **Permissions to Read/Write**. A read-only key fails with "does not have write permission".
4. Click **Generate API key**, then copy the **consumer key** (`ck_...`) and **consumer secret** (`cs_...`). They are shown only once.
5. Put them in `backend/.env` and restart the backend, because `.env` is read only at startup.

### Live store or mock store?

| `WOO_URL` | Mode | Where synced products appear |
|---|---|---|
| Set | Live WooCommerce | The store's WP admin, under Products |
| Not set | Built-in mock | The "Mock WooCommerce store" panel on the Sync page |

The mock lives in memory at `/mock-woo`, so it empties when the backend restarts. It does not check credentials, which is why a wrong key still "works" in mock mode. A live store rejects it.

**Never commit `.env`.** It is git-ignored. Regenerate any key that has been shared or exposed.

## Demo walkthrough

1. **Dashboard**: all demo products start as "Not synced".
2. **Products**: search, filter by category, and look at the attributes under each name.
3. **Create** a product with **+ Product**. It is saved to SQLite through the Express API.
4. **Sync** it. The badge turns green, and the product appears in the WooCommerce admin with its price, stock, category and attributes.
5. **Edit** the price. The badge becomes *Out of date*.
6. **Sync** again. The same product updates in WooCommerce, with no duplicate.
7. **Sync all** on the Sync page pushes every pending product at once.

## API reference

Base URL: `http://localhost:5000`

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/products?search=&category=` | List products, with optional search and category filter |
| GET | `/api/products/:id` | Get one product |
| POST | `/api/products` | Create a product (`name`, `sku`, `price` required) |
| PUT | `/api/products/:id` | Update a product; marks synced products *Out of date* |
| DELETE | `/api/products/:id` | Delete a product |
| GET | `/api/categories` | List categories |
| POST | `/api/categories` | Create a category |
| POST | `/api/sync/:id` | Sync one product to WooCommerce |
| POST | `/api/sync` | Sync all products that are not synced |
| GET | `/api/stats` | Dashboard counts |
| GET | `/mock-woo/wp-json/wc/v3/products` | Inspect the built-in mock store |

Quick test with curl (on Windows PowerShell use `curl.exe`):

```bash
curl http://localhost:5000/api/products
curl -X POST http://localhost:5000/api/sync/1
```

## Data model

```sql
categories(id, name UNIQUE)

products(
  id, sku UNIQUE, name, description, price, stock,
  brand, color, size, material,
  category_id → categories.id,
  woo_id,           -- WooCommerce product ID once synced
  sync_status,      -- not_synced | synced | out_of_date | error
  last_synced_at,
  updated_at
)
```

## Design decisions

- **Integration boundary**: one service file owns every WooCommerce call, so the store can be swapped without touching routes or UI.
- **Flat attribute columns**: simple and easy to demo. A production system would use a dynamic attribute model (see future scope).
- **Status tracking**: four sync states make it obvious what is in the store and what is stale.
- **Zero-install database**: SQLite through Node's built-in module keeps setup to Node, npm and Git only.
- **Mock fallback**: the app stays fully demoable with no store, and the same code path runs against a live one.
- **No router library**: the UI has three views, so simple state-based switching is enough.

## Troubleshooting

| Problem | Fix |
|---|---|
| `Cannot GET /` on port 5000 | Expected. Open the UI on port 5173 |
| Vite error: failed to resolve `./pages/...` | Make sure `pages/`, `components/` and `api.js` are inside `frontend/src`, not `backend/src` |
| "API key does not have write permission" | Create a key with **Read/Write** permissions |
| Sync still works with a wrong key | `WOO_URL` is not set, so you are in mock mode, or the backend was not restarted after editing `.env` |
| Real sync fails right after switching from mock | Run `node reset-sync.js` to clear fake `woo_id` values, then sync again |
| `rest_no_route` from WooCommerce | In WP admin, go to Settings → Permalinks and click Save once |
| `curl` flags are rejected in PowerShell | Use `curl.exe` instead of `curl` |
| Mock store empty after a restart | It is in-memory. Edit a product and run Sync all to refill it |

## Future scope

- Dynamic attribute system per category (EAV model)
- Product variants (sizes and colors as variations)
- Images and media management
- Bulk CSV import and export
- Two-way sync using WooCommerce webhooks
- Authentication, roles and an audit log
- PostgreSQL for multi-user production use
- Automated tests for the integration layer
