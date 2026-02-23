# Nexum Admin Panel

A Vue 3 single-page application that provides a secured admin interface for the Nexum Laravel API. Admins can view the Commission Report and the Top Distributors ranking after authenticating with a Bearer token.

---

## Tech Stack

| Layer | Library / Tool | Version |
|---|---|---|
| Framework | Vue 3 (`<script setup>`) | ^3.5 |
| State management | Pinia | ^3.0 |
| Routing | Vue Router | ^5.0 |
| HTTP client | Axios | ^1.13 |
| Form validation | vee-validate + Yup | ^4.15 / ^1.7 |
| CSS | Tailwind CSS v4 | ^4.1 |
| Build tool | Vite | ^7.3 |

---

## Project Structure

```
backend/
├── .env                          # Environment variables (VITE_API_BASE_URL)
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.js                   # App entry — mounts Vue, Pinia, Router
    ├── App.vue                   # Root component (<RouterView />)
    ├── style.css                 # Global styles (Tailwind import + base cursor rules)
    │
    ├── services/
    │   └── api.js                # Axios instance with auth & 401 interceptors
    │
    ├── stores/
    │   └── auth.js               # Pinia auth store (login, logout, isAuthenticated)
    │
    ├── router/
    │   └── index.js              # Routes + navigation guard
    │
    ├── layouts/
    │   └── AdminLayout.vue       # Sidebar + header shell for authenticated pages
    │
    ├── views/
    │   ├── LoginView.vue         # Login form with vee-validate / Yup validation
    │   ├── CommissionReportView.vue   # Paginated commission report with filters
    │   └── TopDistributorsView.vue    # Paginated top-200 distributors ranking
    │
    └── components/
        └── OrderItemsModal.vue   # Slide-in modal showing line items for an order
```

---

## Environment Variables

Create a `.env` file in the `backend/` directory (already present):

```ini
VITE_API_BASE_URL=http://localhost:8000/api
```

Change the value to match the URL where the Laravel API is running.

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- The [Nexum Laravel API](../api/) running on `http://localhost:8000`

### Install dependencies

```bash
cd backend
npm install
```

### Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for production

```bash
npm run build
```

Output is written to `dist/`. Serve with any static file host or `npm run preview` for a local preview of the production build.

---

## Authentication

The app uses **Laravel Sanctum token authentication**.

- On login, the API returns a Bearer token which is stored in `localStorage`.
- Every subsequent request automatically includes the token via an Axios request interceptor (`src/services/api.js`).
- If any request returns **401 Unauthenticated**, the interceptor clears the stored token and redirects to `/login`.
- The Vue Router navigation guard (`src/router/index.js`) prevents unauthenticated users from accessing protected routes and redirects already-authenticated users away from the login page.

**Default admin credentials (seeded):**

| Field | Value |
|---|---|
| Email | `admin@nexum.com` |
| Password | `password` |

---

## Pages

### Login — `/login`

A centered login card on a dark slate background.

**Validation (vee-validate + Yup):**

| Field | Rules |
|---|---|
| Email | Required · Valid email format |
| Password | Required · Minimum 6 characters |

- Field errors appear inline below each input with a red border highlight.
- API errors (e.g. wrong password) appear in a banner above the form.
- The submit button shows a spinner and is disabled while the request is in flight.
- `novalidate` is set on the form so only vee-validate messages are shown (no browser native bubbles).

---

### Commission Report — `/commission-report`

A paginated table of orders with commission calculations.

**Filters (all optional, combinable):**

| Filter | Description |
|---|---|
| Distributor | Partial match on distributor first/last name, or exact distributor ID |
| Date From | Include orders on or after this date (YYYY-MM-DD) |
| Date To | Include orders on or before this date (YYYY-MM-DD) |
| Invoice | Partial match on invoice number |

**Table columns:**

| Column | Notes |
|---|---|
| Invoice | Mono-spaced invoice number |
| Purchaser | Full name of the customer who placed the order |
| Distributor | The referring distributor, or `—` if the order is ineligible |
| Referred Dist. | Number of distributors the referrer had recruited at order time |
| Order Date | Date the order was placed |
| % | Commission percentage (5 / 10 / 15 / 20 / 30%), or `—` if ineligible |
| Order Total | Sum of `quantity × price` for all line items |
| Commission | Calculated commission amount in USD, or `—` if ineligible |
| Items | Button that opens the Order Items modal for that row |

**Pagination:** 15 rows per page. Prev / Next buttons are disabled while data is loading.

**Skeleton loader:** On initial load and on every page/filter change, 15 animated shimmer rows replace the data rows. The table header always remains visible.

---

### Top Distributors — `/top-distributors`

A paginated ranked table of the top 200 distributors by total sales.

- **Total Sales** = `SUM(quantity × price)` from orders placed by users directly referred by the distributor. The distributor's own orders are excluded.
- Ranking uses `DENSE_RANK` — tied distributors share the same rank number. All distributors with rank ≤ 200 are included (may slightly exceed 200 rows when ties exist at rank 200).
- Rows are ordered by rank ascending, then name ascending.

**Search (optional):**

| Query param | Description |
|---|---|
| `search` | Partial, case-insensitive match on distributor full name (first + last). Ranks reflect position in the full leaderboard — only the visible rows are filtered, not the rank values themselves. |

Enter a name in the search box and press **Enter** or click **Search**. A **Clear** button appears whenever a search term is active; clicking it resets the results to the full leaderboard.

**Table columns:**

| Column | Notes |
|---|---|
| Rank | `DENSE_RANK` position; top 3 shown with gold / silver / bronze badges |
| Distributor Name | Full name |
| Total Sales | Sum of referred-customer order values in USD |

**Pagination:** 10 rows per page.

**Skeleton loader:** On initial load, search, and pagination, 10 animated shimmer rows appear. The rank column shows a circular shimmer matching the badge shape exactly.

---

### Order Items Modal

Opened via the **Items** button on any Commission Report row.

**Header subtitle** shows (once loaded):
```
ABC4170 · Jane Smith · via John Doe
```
- Invoice number in monospace
- Purchaser name
- Distributor name in indigo (omitted if the order has no eligible distributor)

**Table columns:** SKU · Product · Price · Qty · Total
**Footer:** Order Total (sum of all line items)

**Skeleton loader:** While the API call is in flight, the subtitle and the value cells in the table show animated shimmer bars. The column headers and the "Order Total" label are always visible.

---

## HTTP Client (`src/services/api.js`)

```
Axios instance
  baseURL  →  VITE_API_BASE_URL (from .env)
  headers  →  Accept: application/json, Content-Type: application/json

Request interceptor
  Reads token from localStorage → sets Authorization: Bearer <token>

Response interceptor
  401  →  removes token from localStorage, redirects to /login
```

---

## Auth Store (`src/stores/auth.js`)

```
state
  token          string | null   (persisted in localStorage)

getters
  isAuthenticated  computed bool

actions
  login(email, password)   POST /login → store token
  logout()                 POST /logout → clear token (fires even if API fails)
```

---

## Router (`src/router/index.js`)

```
/login                  LoginView          meta: requiresGuest
/                       AdminLayout        meta: requiresAuth
  ├── (redirect)        → /commission-report
  ├── commission-report   CommissionReportView
  └── top-distributors    TopDistributorsView

Navigation guard
  requiresAuth + no token  →  redirect to /login
  requiresGuest + token    →  redirect to /commission-report
```

---

## Global Styles (`src/style.css`)

```css
/* Pointer cursor on all interactive controls */
button, a, [role="button"], label[for], select { cursor: pointer; }

/* Not-allowed cursor on disabled buttons */
button:disabled, [role="button"][aria-disabled="true"] { cursor: not-allowed; }
```

These base rules are applied via `@layer base` so they can be overridden by any Tailwind utility class.
