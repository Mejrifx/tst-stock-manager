# eBay Stock Manager

Manage your eBay inventory, listing caps, and activity in one place.

## Tech stack

- **Vite** – build tool
- **TypeScript** – typing
- **React** – UI
- **shadcn/ui** – components
- **Tailwind CSS** – styling
- **React Router** – routing
- **Zustand** – state
- **TanStack Query** – data fetching

## Local development

```sh
# Install dependencies
npm i

# Start dev server (with hot reload)
npm run dev
```

Dev server runs at `http://localhost:8080`.

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Start dev server         |
| `npm run build`| Production build         |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint               |
| `npm run test` | Run tests                |

## Deploy on Netlify

1. Push this repo to GitHub.
2. In [Netlify](https://app.netlify.com): **Add new site** → **Import an existing project** → choose GitHub and this repo.
3. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Deploy. Later pushes to your main branch will trigger automatic deploys.

## License

Private.
