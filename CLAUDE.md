# Project: Harvest Catering

React 19 + Vite + TypeScript application using shadcn (`radix-nova` style) and Tailwind CSS v4.

## Commands

```bash
npm run dev        # start dev server
npm run build      # tsc + vite build
npm run typecheck  # type-check without emit
npm run lint       # eslint
npm run format     # prettier (auto-fixes)
```

## Stack

- **React 19** with strict mode
- **Vite 7** — bundler
- **TypeScript ~5.9**
- **React Router DOM v6** — client-side routing
- **shadcn 4.7 (`radix-nova` style)** — UI components
- **Tailwind CSS v4** — utility classes + CSS variables
- **Lucide React** — icons (`lucide-react`)
- **Recharts** — charts
- **Sonner** — toast notifications

## Project Structure

```
src/
  components/
    theme-provider.tsx   # custom ThemeProvider + useTheme hook
    ui/                  # all shadcn components (do not edit manually)
  hooks/
    use-mobile.ts
  layouts/
    dashboard-layout.tsx # AppSidebar + AppHeader + Outlet
  lib/
    utils.ts             # cn() helper
  pages/
    dashboard-page.tsx
    events-page.tsx
  routes/
    index.tsx            # BrowserRouter + route tree
  index.css              # Tailwind imports + CSS variable theme
  main.tsx               # React root: ThemeProvider > TooltipProvider > App
```

Path alias `@/` → `src/`.

## Theming

### CSS Variables

All colors are defined as CSS variables in [src/index.css](src/index.css) using OKLCH. **Never hardcode color values.** Always use semantic tokens via Tailwind utilities:

| Token | Utility |
|---|---|
| Background | `bg-background` |
| Foreground text | `text-foreground` |
| Primary | `bg-primary` / `text-primary` |
| Primary text on primary bg | `text-primary-foreground` |
| Muted backgrounds | `bg-muted` |
| Muted text | `text-muted-foreground` |
| Card | `bg-card` / `text-card-foreground` |
| Border | `border-border` |
| Input | `border-input` |
| Destructive | `bg-destructive` / `text-destructive` |
| Sidebar | `bg-sidebar` / `text-sidebar-foreground` |

### Dark Mode

Dark mode applies the `.dark` class on `<html>`. The custom `@custom-variant dark (&:is(.dark *))` is declared in `index.css`. Use `dark:` prefix for dark-mode overrides.

### Theme Provider

`ThemeProvider` is at [src/components/theme-provider.tsx](src/components/theme-provider.tsx) — a custom implementation (not `next-themes`). Use the `useTheme()` hook to read or set the theme (`"light"`, `"dark"`, `"system"`). Theme is persisted to `localStorage` under the key `"theme"`. Pressing `D` (outside inputs) toggles light/dark.

### Radius

Base radius is `0.625rem`. Use the scale utilities: `rounded-sm`, `rounded-md`, `rounded-lg` (base), `rounded-xl`, `rounded-2xl`, etc. — all derived from `--radius` via `@theme inline`.

### Typography

Font is **Inter Variable** (`--font-sans`). Apply via `font-sans` (default on `<html>`). Headings use `--font-heading` which also resolves to Inter.

## shadcn Components

Components live in [src/components/ui/](src/components/ui/). **Do not edit them by hand** — add via the shadcn CLI:

```bash
npx shadcn add <component>
```

Configuration is in [components.json](components.json):
- Style: `radix-nova`
- Base color: `neutral`
- CSS variables: enabled
- Icon library: `lucide`
- RTL: disabled

## Conventions

### Utilities

Always use `cn()` from `@/lib/utils` for conditional class merging:

```tsx
import { cn } from "@/lib/utils"
<div className={cn("base-classes", condition && "conditional-class")} />
```

### Icons

Import from `lucide-react`. Size with `size-*` utility (`size-4`, `size-5`, etc.):

```tsx
import { SearchIcon } from "lucide-react"
<SearchIcon className="size-4" />
```

### Adding Pages

1. Create file in `src/pages/`.
2. Add a `<Route>` inside `DashboardLayout` in [src/routes/index.tsx](src/routes/index.tsx).
3. Add a nav entry to `navItems` in [src/layouts/dashboard-layout.tsx](src/layouts/dashboard-layout.tsx) if it needs sidebar navigation.

### Formatting

Prettier is configured with `prettier-plugin-tailwindcss` — it auto-sorts Tailwind classes. Run `npm run format` before committing or let the editor do it on save.
