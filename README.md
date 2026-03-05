# eBay Stock Manager

Manage your eBay inventory with automatic listing quantity control. The system maintains a fixed cap of 3 units visible on eBay per SKU, automatically syncing sales and replenishing quantities in real-time.

## Features

- **Quantity-Based Inventory**: Track total stock, available stock, and reserved stock per SKU
- **Automatic eBay Sync**: Poll eBay every 5 minutes for new orders
- **Auto-Replenishment**: When items sell, automatically update eBay to show 3 units again
- **Sales Tracking**: View order history with buyer info and status
- **Activity Log**: Complete audit trail of all inventory and sync events
- **OAuth Integration**: Secure eBay API authentication
- **Low Stock Alerts**: Visual warnings when stock runs low

## How It Works

```
1. You list items manually on eBay with quantity = 3
2. System detects the listing and tracks it in admin panel
3. When 2 units sell on eBay:
   - Admin panel: 20 → 18 total stock
   - eBay listing: 3 → 1 quantity shown
4. Sync worker detects the change (every 5 min)
5. System automatically updates eBay back to 3 units
6. Admin panel shows: 18 total stock, 3 listed on eBay
```

## Tech Stack

- **Vite + React + TypeScript**
- **shadcn/ui** – component library
- **Tailwind CSS** – styling
- **Zustand** – state management
- **Axios** – HTTP client for eBay API
- **TanStack Query** – data fetching
- **eBay Inventory API** – quantity management
- **eBay Fulfillment API** – order fetching

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure eBay Credentials

Create `.env.local` in the project root:

```bash
VITE_EBAY_CLIENT_ID=your_client_id
VITE_EBAY_CLIENT_SECRET=your_client_secret
VITE_EBAY_REDIRECT_URI=http://localhost:8080/auth/ebay/callback
VITE_EBAY_ENVIRONMENT=sandbox  # or 'production'
VITE_EBAY_REFRESH_TOKEN=
```

**Where to get credentials:**
1. Go to [eBay Developer Program](https://developer.ebay.com/)
2. Create an Application (Production or Sandbox)
3. Copy **Client ID** (App ID)
4. Copy **Client Secret** (Cert ID)
5. Set **RuName** (OAuth redirect URL): `http://localhost:8080/auth/ebay/callback`

### 3. Run Development Server

```bash
npm run dev
```

App runs at `http://localhost:8080`

### 4. Connect to eBay

1. Open the app → Settings
2. Click **Connect to eBay**
3. Authorize the app on eBay
4. You'll be redirected back with a connected status

### 5. Enable Auto-Sync

In Settings:
- Toggle **Auto-Sync** ON
- Set sync interval (default: 5 minutes)

The system will now:
- Poll eBay for new orders every 5 minutes
- Detect sales and update your stock
- Automatically replenish eBay listings back to 3 units

## Usage

### Dashboard
- View total stock, listed quantity, and sales
- Low stock alerts for SKUs with < 5 units
- Recent activity feed

### Inventory
- Search and filter all SKUs
- Add/Remove stock with reasons
- Manually replenish eBay listings
- Color-coded stock status (Green: 10+, Yellow: 5-9, Red: <5)

### eBay Listings
- View all active eBay listings
- See current listed quantity vs. cap
- One-click replenish to cap (3 units)
- Direct links to eBay listings

### Sales
- Order history with SKU, quantity, buyer
- Order status tracking (Pending, Shipped, Delivered)
- Sales analytics (total sales, last 7 days)

### Activity
- Complete audit log of all events
- Sale detection, stock adjustments, replenishments
- Sync success/error logs with timestamps

### Settings
- eBay connection status
- Sync interval configuration
- Manual sync trigger
- Environment display (sandbox/production)

## eBay API Scopes Required

The app needs these OAuth scopes:
- `https://api.ebay.com/oauth/api_scope/sell.inventory` – manage inventory
- `https://api.ebay.com/oauth/api_scope/sell.fulfillment` – read orders
- `https://api.ebay.com/oauth/api_scope/sell.account` – account access

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_EBAY_CLIENT_ID` | eBay App ID | `YourAppId-PRD-...` |
| `VITE_EBAY_CLIENT_SECRET` | eBay Cert ID | `PRD-abc123...` |
| `VITE_EBAY_REDIRECT_URI` | OAuth callback URL | `http://localhost:8080/auth/ebay/callback` |
| `VITE_EBAY_ENVIRONMENT` | Sandbox or Production | `sandbox` or `production` |
| `VITE_EBAY_REFRESH_TOKEN` | OAuth refresh token | Auto-filled after auth |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 8080) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |

## Deploy on Netlify

1. Push this repo to GitHub
2. In [Netlify](https://app.netlify.com): **Add new site** → **Import from Git**
3. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Add environment variables in Netlify:
   - `VITE_EBAY_CLIENT_ID`
   - `VITE_EBAY_CLIENT_SECRET`
   - `VITE_EBAY_REDIRECT_URI` (use your production domain)
   - `VITE_EBAY_ENVIRONMENT=production`
5. Deploy!

**Important:** Update the eBay RuName redirect URI to match your production domain (e.g., `https://yourapp.netlify.app/auth/ebay/callback`)

## Testing in Sandbox

1. Set `VITE_EBAY_ENVIRONMENT=sandbox`
2. Use eBay Sandbox credentials
3. Create test listings on [eBay Sandbox](https://sandbox.ebay.com)
4. Use test buyer accounts to place orders
5. Verify sync detects orders and replenishes quantities

## Current Limitations

- **Fixed 3-unit cap**: All SKUs use the same cap (customizable per-SKU coming soon)
- **Manual listing creation**: You must create eBay listings manually first
- **No bulk import**: Add stock one SKU at a time (bulk CSV import coming soon)
- **localStorage for tokens**: Refresh tokens stored in browser (backend DB recommended for production)

## Troubleshooting

**"Not Connected" Status**
- Check `.env.local` has correct credentials
- Try reconnecting in Settings
- Check browser console for errors

**Sync Not Detecting Orders**
- Verify eBay connection is active
- Check sync interval in Settings
- Look for SYNC_ERROR in Activity log
- Ensure OAuth scopes are correct

**Listings Not Replenishing**
- Check available stock > 0 for that SKU
- Verify eBay listing ID is correct
- Check Activity log for ERROR events
- Try manual replenish from Inventory page

**Build Warnings**
- CSS `@import` warning is safe to ignore
- Large chunk size warning: app works fine, optimization can be done later

## License

Private.
