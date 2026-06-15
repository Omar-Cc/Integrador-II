---
name: genni-monorepo
description: >
  Reglas de arquitectura frontend para el monorepo pnpm de Marweld.
  Cubre apps/web (Next.js), apps/admin (Vite + React + @tanstack/react-router),
  packages/ui (shadcn/ui + Tailwind CSS), local-first data, axios, react-query
  y zustand. Actívala al crear, modificar o refactorizar cualquier código
  frontend del proyecto.
---

# Genni Monorepo Frontend Skill

## Purpose

This skill guides the creation, modification, and refactor of frontend code in the Marweld pnpm monorepo with the following apps and packages:

* `apps/web`: Next.js app.
* `apps/admin`: Vite + React app using `@tanstack/react-router` for routing.
* `packages/ui`: shared UI library (`@marweld/ui`) using Tailwind CSS and shadcn/ui.
* Local-first data architecture prepared for future migration to a real API.
* Mandatory usage of `axios`, `@tanstack/react-query`, and `zustand`.

The goal is to produce clean, maintainable, atomic, reusable, and scalable code while respecting the monorepo architecture.

---

## Core Rules

1. Always use `pnpm`.
2. Never use `npm`, `yarn`, or `bun` unless the user explicitly requests it.
3. Prefer shared, reusable, atomic UI components.
4. Keep route files thin.
5. Do not place business logic inside route files.
6. Do not fetch data directly inside UI components.
7. All data access must go through `services`.
8. All async/server-like state must use `@tanstack/react-query`.
9. Use `zustand` only for client/global UI state.
10. Keep local mock data isolated in `data`.
11. Design services so they can later switch from local mocks to real API calls without changing components.
12. Use `axios` for all service-layer HTTP/API abstractions.
13. Respect existing aliases, package names, folder conventions, and project configuration.
14. Before adding new patterns, inspect the existing codebase and follow its style.

---

## Monorepo Structure

Actual base structure:

```txt
frontend/
  apps/
    web/          # Next.js — package name: "web"
    admin/        # Vite + React — package name: "admin"
  packages/
    ui/           # Shared UI — package name: "@marweld/ui"
    config/       # Shared TS/ESLint configs — package name: "@marweld/config"
  pnpm-workspace.yaml
  turbo.json
```

---

## Existing Aliases & Imports

### `@marweld/ui` (shared UI package)

The UI package exports are defined in `packages/ui/package.json`:

```json
{
  "exports": {
    "./components/*": "./src/components/*.tsx",
    "./lib/*": "./src/lib/*.ts",
    "./globals.css": "./src/globals.css",
    "./*": "./src/*.tsx"
  }
}
```

**Correct import patterns:**

```tsx
import { Button } from "@marweld/ui/button"
import { Card } from "@marweld/ui/card"
import { cn } from "@marweld/ui/lib/utils"
import { SomeComponent } from "@marweld/ui/components/ui/some-component"
```

> **IMPORTANT**: The package is `@marweld/ui`, NOT `@repo/ui`. Always use `@marweld/ui`.

### `apps/web` (Next.js)

Path alias configured in `tsconfig.json`:

```json
{
  "paths": {
    "@marweld/ui/*": ["../../packages/ui/src/*"]
  }
}
```

> Note: `apps/web` does NOT currently have a `@/` alias pointing to `src/`. If one is needed, add `"@/*": ["./src/*"]` to `tsconfig.json > compilerOptions > paths`.

### `apps/admin` (Vite)

Path aliases configured in both `tsconfig.json` and `vite.config.ts`:

```ts
// vite.config.ts
resolve: {
  alias: {
    "@": path.resolve(__dirname, "src"),
    "@marweld/ui": path.resolve(__dirname, "../../packages/ui/src"),
  },
}
```

Admin has the `@/` alias available for `src/` imports:

```tsx
import { SomeComponent } from "@/features/users/components/some-component"
```

---

## App: `apps/web`

`apps/web` uses Next.js (v16+, App Router).

Expected structure:

```txt
apps/web/
  app/
  src/
    features/
      <feature-name>/
        components/
        data/
        services/
        types/
    shared/
      components/
      hooks/
      lib/
      services/
      stores/
```

> Note: The `src/` directory does not exist yet. Create it when adding the first feature.
> When creating `src/`, also add the `@/` path alias to `tsconfig.json`:
> ```json
> "paths": {
>   "@/*": ["./src/*"],
>   "@marweld/ui/*": ["../../packages/ui/src/*"]
> }
> ```

### `app/` Rules

The `app/` directory is only for Next.js routing and route composition.

Allowed files inside `app/`:

```txt
page.tsx
layout.tsx
loading.tsx
error.tsx
not-found.tsx
route.ts
metadata-related files
```

Route files should stay minimal.

Good example:

```tsx
import { ProductsPage } from "@/features/products/components/products-page"

export default function Page() {
  return <ProductsPage />
}
```

Avoid:

```tsx
export default function Page() {
  // Avoid business logic, big JSX trees, local mocks, service calls,
  // Zustand stores, or complex UI directly here.
}
```

### Web Feature Structure

Each route/domain feature should use:

```txt
src/features/<feature-name>/
  components/
  data/
  services/
  types/
```

Example:

```txt
src/features/products/
  components/
    product-card.tsx
    products-page.tsx
  data/
    products.mock.ts
  services/
    products.service.ts
    products.queries.ts
  types/
    product.types.ts
```

### Web Shared Components

Global app-level components should go in:

```txt
src/shared/components/
```

Examples:

```txt
src/shared/components/layout/
src/shared/components/chatbot/
src/shared/components/navbar/
src/shared/components/footer/
```

Use this for components that are global to the app but not necessarily reusable across `web` and `admin`.

---

## App: `apps/admin`

`apps/admin` uses:

* Vite (v8+)
* React
* `@tanstack/react-router` for routing
* `@tanstack/react-query` for data fetching/cache
* `zustand` for client/global UI state

Expected structure:

```txt
apps/admin/
  src/
    routes/
    features/
      <feature-name>/
        components/
        data/
        services/
        types/
    shared/
      components/
      hooks/
      lib/
      services/
      stores/
    providers/
```

### Admin Routing Rules

Use `@tanstack/react-router` for all admin routes.

The `routes/` directory is only for route definitions and route-level composition.

Route files should import feature pages/components instead of containing full business logic.

Good example:

```tsx
import { createFileRoute } from "@tanstack/react-router"
import { UsersPage } from "@/features/users/components/users-page"

export const Route = createFileRoute("/users")({
  component: UsersPage,
})
```

Avoid putting the following directly in route files:

* Large JSX trees.
* Mock data.
* Service logic.
* Axios calls.
* Complex state logic.
* Business-specific calculations.

---

## Shared UI: `packages/ui` (`@marweld/ui`)

`packages/ui` is the shared component library, published internally as `@marweld/ui`.

It uses:

* Tailwind CSS (v4)
* shadcn/ui
* Atomic and reusable components
* `class-variance-authority`, `clsx`, `tailwind-merge` for styling utilities

Expected structure:

```txt
packages/ui/
  src/
    components/
      ui/
    lib/
      utils.ts
    globals.css
    button.tsx
    card.tsx
    code.tsx
```

Shared UI should contain:

* Buttons
* Inputs
* Cards
* Dialogs
* Dropdowns
* Tables
* Badges
* Tabs
* Form controls
* Generic layout primitives
* Reusable design-system components

Shared UI should NOT contain:

* Business logic.
* Feature-specific copy.
* App-specific data fetching.
* React Query hooks.
* Zustand stores.
* Route-specific components.

---

## shadcn/ui Rules

All three targets (`packages/ui`, `apps/web`, `apps/admin`) have `components.json` configured.

Common configuration (all targets):

* `style`: `"default"`
* `tsx`: `true`
* `baseColor`: `"slate"`
* `cssVariables`: `true`
* CSS path points to `packages/ui/src/globals.css`
* Aliases use `@marweld/ui/components`, `@marweld/ui/lib/utils`, `@marweld/ui/components/ui`

Key difference:

* `packages/ui` and `apps/web`: `rsc: true`
* `apps/admin`: `rsc: false`

### Recommended: Add reusable components to `packages/ui`

Use this when the component may be reused by more than one app.

```bash
pnpm dlx shadcn@latest add <component-name> -c packages/ui
```

Example:

```bash
pnpm dlx shadcn@latest add button -c packages/ui
```

### Add directly to `apps/web`

Use this only when the component is exclusive to the Next.js web app.

```bash
pnpm dlx shadcn@latest add <component-name> -c apps/web
```

### Add directly to `apps/admin`

Use this only when the component is exclusive to the admin app.

```bash
pnpm dlx shadcn@latest add <component-name> -c apps/admin
```

### Decision Tree

Before adding a shadcn component, decide:

1. Will both `web` and `admin` use it?

   * Yes: add it to `packages/ui`.
   * No: continue.

2. Is it only for `apps/web`?

   * Yes: add it to `apps/web`.
   * No: continue.

3. Is it only for `apps/admin`?

   * Yes: add it to `apps/admin`.

4. If unsure, prefer `packages/ui` only when the component is generic and reusable.

Do not duplicate the same shadcn component across apps if it can live in `packages/ui`.

---

## Data Architecture

The project is local-first for now but must remain ready for a future real API.

Use this flow:

```txt
component → query hook → service → mock data or API
```

Never use this flow:

```txt
component → mock data
component → axios
component → fetch
component → hardcoded async logic
```

### Feature Data Folder

Use `data/` for local mocks, fixtures, or simulated backend data.

Example:

```txt
features/products/data/products.mock.ts
```

Example:

```ts
import type { Product } from "../types/product.types"

export const productsMock: Product[] = [
  {
    id: "1",
    name: "Product 1",
    price: 100,
  },
]
```

### Feature Services Folder

Use `services/` for all data access.

Example:

```txt
features/products/services/products.service.ts
features/products/services/products.queries.ts
```

The service should hide whether data comes from a local mock or a real API.

Example:

```ts
import { productsMock } from "../data/products.mock"

export async function getProducts() {
  return productsMock
}
```

When migrating to a real API, only the service should change:

```ts
import { httpClient } from "@/shared/services/http-client"

export async function getProducts() {
  const { data } = await httpClient.get("/products")
  return data
}
```

---

## Axios Rules

Use `axios` in the service layer.

Create or reuse a shared HTTP client.

For Next.js web:

```txt
apps/web/src/shared/services/http-client.ts
```

For Vite admin:

```txt
apps/admin/src/shared/services/http-client.ts
```

Do not mix Vite and Next.js environment access.

Next.js uses:

```ts
process.env.NEXT_PUBLIC_API_URL
```

Vite uses:

```ts
import.meta.env.VITE_API_URL
```

Example for Next.js:

```ts
import axios from "axios"

export const httpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})
```

Example for Vite:

```ts
import axios from "axios"

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})
```

Do not call `axios.get`, `axios.post`, etc. directly from components.

---

## React Query Rules

Use `@tanstack/react-query` for:

* Local mock data that simulates backend data.
* API data.
* Loading states.
* Error states.
* Cache.
* Refetching.
* Mutations.
* Invalidations.

Do not use React Query for:

* UI-only state.
* Modal open/closed state.
* Sidebar state.
* Theme state.
* Temporary form field state.

Example query file:

```ts
import { useQuery } from "@tanstack/react-query"
import { getProducts } from "./products.service"

export const productsQueryKey = ["products"] as const

export function useProductsQuery() {
  return useQuery({
    queryKey: productsQueryKey,
    queryFn: getProducts,
  })
}
```

Example usage:

```tsx
"use client"

import { useProductsQuery } from "../services/products.queries"

export function ProductsPage() {
  const { data, isLoading, isError } = useProductsQuery()

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Something went wrong.</div>

  return (
    <div>
      {data?.map((product) => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  )
}
```

---

## Zustand Rules

Use `zustand` only for client/global state.

Good use cases:

* Sidebar open/closed.
* Command menu state.
* Chatbot visibility.
* UI preferences.
* Multi-step wizard state.
* Temporary filters that do not need to live in the URL.
* Auth/session UI state when appropriate.

Avoid using Zustand for:

* Server data.
* Mock backend data.
* API responses.
* Lists of entities that should be cached by React Query.

Example:

```ts
import { create } from "zustand"

type SidebarStore = {
  isOpen: boolean
  toggle: () => void
  setOpen: (value: boolean) => void
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  isOpen: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (value) => set({ isOpen: value }),
}))
```

---

## Component Rules

Prefer atomic, reusable components.

Use this hierarchy:

```txt
packages/ui (@marweld/ui)
  Generic reusable design-system components.

apps/<app>/src/shared/components
  App-level reusable components.

apps/<app>/src/features/<feature>/components
  Feature-specific components.
```

### Put a component in `packages/ui` when:

* It is generic.
* It has no business logic.
* It can be reused by both `web` and `admin`.
* It is part of the design system.
* It wraps or extends shadcn generically.

### Put a component in `shared/components` when:

* It is reused inside one app only.
* It is app-level but not monorepo-level.
* It is global to the app, such as layout, navbar, footer, chatbot, sidebar, etc.

### Put a component in `features/<feature>/components` when:

* It belongs to one feature.
* It uses feature-specific copy.
* It depends on feature-specific types.
* It consumes feature-specific query hooks.
* It represents a page section for a specific route/domain.

---

## Naming Conventions

Use these conventions unless the existing codebase clearly uses another pattern.

### Folders

Use kebab-case:

```txt
user-profile/
product-catalog/
order-history/
```

### Component Files

Use kebab-case:

```txt
product-card.tsx
products-page.tsx
user-form.tsx
```

### Component Names

Use PascalCase:

```tsx
export function ProductCard() {}
export function ProductsPage() {}
export function UserForm() {}
```

### Types

Use:

```txt
<entity>.types.ts
```

Example:

```txt
product.types.ts
user.types.ts
```

### Services

Use:

```txt
<feature>.service.ts
<feature>.queries.ts
<feature>.mutations.ts
```

Examples:

```txt
products.service.ts
products.queries.ts
products.mutations.ts
```

### Mock Data

Use:

```txt
<feature>.mock.ts
```

Example:

```txt
products.mock.ts
```

### Zustand Stores

Use:

```txt
<feature>.store.ts
```

Example:

```txt
sidebar.store.ts
chatbot.store.ts
```

---

## TypeScript Rules

1. Prefer explicit exported types for feature entities.
2. Keep DTOs and domain types in `types/`.
3. Avoid `any`.
4. Use `unknown` when the type is intentionally unknown.
5. Keep service return types clear.
6. Do not duplicate types across apps if they belong to a shared domain.
7. Avoid placing types inside components unless they are private and small.

Example:

```ts
export type Product = {
  id: string
  name: string
  price: number
}
```

---

## Next.js Client Component Rules

In `apps/web`, use `"use client"` when a component uses:

* React hooks.
* React Query hooks.
* Zustand stores.
* Browser APIs.
* Event handlers.
* Local interactive state.
* Forms.
* Effects.

Example:

```tsx
"use client"

export function ProductsPage() {
  return <div>Products</div>
}
```

Do not add `"use client"` unnecessarily to route files unless required.

Prefer placing client logic in feature components instead of `app/page.tsx`.

---

## Provider Rules

Each app should have its own providers.

For React Query:

```txt
src/providers/query-provider.tsx
```

Example for `apps/web`:

```tsx
"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { PropsWithChildren, useState } from "react"

export function QueryProvider({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

Example for `apps/admin`:

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { PropsWithChildren, useState } from "react"

export function QueryProvider({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

Use the provider at the app root.

---

## Feature Creation Workflow

When creating a new feature:

1. Identify the app:

   * `apps/web`
   * `apps/admin`

2. Identify the feature name.

3. Create this structure:

```txt
src/features/<feature-name>/
  components/
  data/
  services/
  types/
```

4. Add types first.

5. Add mock data in `data/`.

6. Add service functions in `services/`.

7. Add React Query hooks in `services/`.

8. Add feature components.

9. Add or update route files:

   * For `web`: inside `app/`.
   * For `admin`: inside `src/routes/` using `@tanstack/react-router`.

10. Use shared UI components from `@marweld/ui` when available.

11. Add shadcn components using the correct monorepo command when needed.

---

## Example Feature: Products

Expected structure:

```txt
src/features/products/
  components/
    product-card.tsx
    products-page.tsx
  data/
    products.mock.ts
  services/
    products.service.ts
    products.queries.ts
  types/
    product.types.ts
```

### `types/product.types.ts`

```ts
export type Product = {
  id: string
  name: string
  description: string
  price: number
}
```

### `data/products.mock.ts`

```ts
import type { Product } from "../types/product.types"

export const productsMock: Product[] = [
  {
    id: "1",
    name: "Product 1",
    description: "Product description",
    price: 100,
  },
]
```

### `services/products.service.ts`

```ts
import { productsMock } from "../data/products.mock"

export async function getProducts() {
  return productsMock
}
```

### `services/products.queries.ts`

```ts
import { useQuery } from "@tanstack/react-query"
import { getProducts } from "./products.service"

export const productsQueryKey = ["products"] as const

export function useProductsQuery() {
  return useQuery({
    queryKey: productsQueryKey,
    queryFn: getProducts,
  })
}
```

### `components/product-card.tsx`

```tsx
import type { Product } from "../types/product.types"

type ProductCardProps = {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article>
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <span>{product.price}</span>
    </article>
  )
}
```

### `components/products-page.tsx`

```tsx
"use client"

import { ProductCard } from "./product-card"
import { useProductsQuery } from "../services/products.queries"

export function ProductsPage() {
  const { data, isLoading, isError } = useProductsQuery()

  if (isLoading) return <div>Loading products...</div>
  if (isError) return <div>Could not load products.</div>

  return (
    <section>
      <h1>Products</h1>

      <div>
        {data?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
```

---

## Import Rules

1. Follow existing aliases (`@marweld/ui/*`, `@/` in admin).
2. Prefer clean absolute imports if aliases are configured.
3. Do not invent aliases without checking configuration.
4. Avoid deep imports from another feature unless there is an established shared module.
5. UI package imports must use `@marweld/ui`.

Examples:

```tsx
import { Button } from "@marweld/ui/button"
import { Card } from "@marweld/ui/card"
import { cn } from "@marweld/ui/lib/utils"
```

---

## Styling Rules

1. Use Tailwind CSS (v4).
2. Use shadcn/ui primitives when appropriate.
3. Keep component styles readable.
4. Avoid unnecessary custom CSS.
5. Prefer composition over large conditional class strings.
6. Use the `cn` utility from `@marweld/ui/lib/utils` when available.
7. Do not create new design tokens unless required.

---

## Response Behavior

When working in this repository, always:

1. Mention which app/package is being changed.
2. Explain where files should be created.
3. Provide the exact `pnpm` commands when commands are needed.
4. Use the correct shadcn command based on the target.
5. Keep route files minimal.
6. Create services and queries for data access.
7. Use `zustand` only for client state.
8. Prefer reusable UI from `@marweld/ui`.
9. Avoid duplicating code.
10. End with a concise checklist of what was created or changed.

---

## Checklist Before Finishing

Before finalizing any implementation, verify:

* The correct app/package was targeted.
* `pnpm` was used.
* Route files are thin.
* Feature files are inside the correct `features/<feature-name>` folder.
* Components are atomic and reusable where possible.
* Shared UI is placed in `packages/ui` when appropriate.
* shadcn components were added with the correct `-c` target.
* Mock data is inside `data/`.
* API/data logic is inside `services/`.
* React Query hooks consume services.
* Zustand is not used for server data.
* Types are placed in `types/`.
* Axios is not called directly from components.
* Next.js client components use `"use client"` only when needed.
* Admin routes use `@tanstack/react-router`.
* Imports use `@marweld/ui` (not `@repo/ui`).
* Imports follow existing aliases and monorepo conventions.

---

## Common Commands

Install dependencies:

```bash
pnpm install
```

Add a dependency to the web app:

```bash
pnpm --filter web add <package-name>
```

Add a dependency to the admin app:

```bash
pnpm --filter admin add <package-name>
```

Add a dependency to the shared UI package:

```bash
pnpm --filter @marweld/ui add <package-name>
```

Add a shadcn component to shared UI:

```bash
pnpm dlx shadcn@latest add <component-name> -c packages/ui
```

Add a shadcn component to web:

```bash
pnpm dlx shadcn@latest add <component-name> -c apps/web
```

Add a shadcn component to admin:

```bash
pnpm dlx shadcn@latest add <component-name> -c apps/admin
```

Run dev for all apps:

```bash
pnpm dev
```

Run dev for a specific app:

```bash
pnpm --filter web dev
pnpm --filter admin dev
```

Type-check all packages:

```bash
pnpm check-types
```

---

## Golden Rule

Keep the architecture ready for a real API migration.

Today, services may return local mock data.

Tomorrow, services should be able to switch to axios API calls without changing components, routes, stores, or UI structure.