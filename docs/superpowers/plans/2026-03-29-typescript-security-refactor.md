# TypeScript + Security Refactor Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the entire MEMENTO media tracker from JavaScript to strict TypeScript with security hardening.

**Architecture:** Bottom-up migration — types first, then lib layer, then hooks/contexts, then components, then pages, then app shell. Security improvements woven in: Zod validation, error boundaries, CSP headers, generic auth error messages, input sanitization.

**Tech Stack:** React 19 + Vite 8 + TypeScript (strict) + Tailwind CSS 4 + Supabase + Zod + DOMPurify

---

## File Structure

### New files to create:
| File | Purpose |
|------|---------|
| `tsconfig.json` | TypeScript strict config for Vite bundler mode |
| `vite-env.d.ts` | Typed env vars (VITE_SUPABASE_URL, etc.) |
| `src/types/index.ts` | All domain types (Category, CollectionItem, Collection, etc.) |
| `src/types/validation.ts` | Zod schemas for form validation |
| `src/types/sanitize.ts` | DOMPurify sanitizer utility |
| `src/components/ErrorBoundary.tsx` | React error boundary |

### Files to rename + rewrite (.js/.jsx → .ts/.tsx):
| Old | New |
|-----|-----|
| `vite.config.js` | `vite.config.ts` |
| `src/lib/supabase.js` | `src/lib/supabase.ts` |
| `src/lib/storage.js` | `src/lib/storage.ts` |
| `src/lib/api.js` | `src/lib/api.ts` |
| `src/contexts/AuthContext.jsx` | `src/contexts/AuthContext.tsx` |
| `src/hooks/useCollection.js` | `src/hooks/useCollection.ts` |
| `src/components/Layout.jsx` | `src/components/Layout.tsx` |
| `src/components/MediaCard.jsx` | `src/components/MediaCard.tsx` |
| `src/components/SearchBar.jsx` | `src/components/SearchBar.tsx` |
| `src/pages/AuthPage.jsx` | `src/pages/AuthPage.tsx` |
| `src/pages/CategoryPage.jsx` | `src/pages/CategoryPage.tsx` |
| `src/pages/Library.jsx` | `src/pages/Library.tsx` |
| `src/App.jsx` | `src/App.tsx` |
| `src/main.jsx` | `src/main.tsx` |

### Files to modify:
| File | Change |
|------|--------|
| `package.json` | Add deps, update build script |
| `eslint.config.js` | Add typescript-eslint, change glob to .ts/.tsx |
| `index.html` | Change script src to main.tsx |
| `vercel.json` | Add security headers (CSP, X-Frame-Options, etc.) |

---

## Task 1: Install dependencies and configure TypeScript

**Files:**
- Modify: `package.json`
- Create: `tsconfig.json`
- Create: `vite-env.d.ts`

- [ ] **Step 1: Install dependencies**

```bash
npm install -D typescript @types/node zod dompurify @types/dompurify typescript-eslint
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src", "vite-env.d.ts"]
}
```

- [ ] **Step 3: Create `vite-env.d.ts`**

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_TMDB_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

- [ ] **Step 4: Update `package.json` scripts**

Change `"build": "vite build"` to `"build": "tsc -b && vite build"` and add `"typecheck": "tsc --noEmit"`.

- [ ] **Step 5: Update `index.html`**

Change `<script type="module" src="/src/main.jsx">` to `<script type="module" src="/src/main.tsx">`.

- [ ] **Step 6: Rename `vite.config.js` to `vite.config.ts`** (content identical, just extension change)

- [ ] **Step 7: Update `eslint.config.js`** — change files glob to `**/*.{ts,tsx}`, add `typescript-eslint` parser and plugin, replace `no-unused-vars` with `@typescript-eslint/no-unused-vars`.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "chore: add TypeScript config, dependencies, and env types"
```

---

## Task 2: Create type definitions and validation schemas

**Files:**
- Create: `src/types/index.ts`
- Create: `src/types/validation.ts`
- Create: `src/types/sanitize.ts`

- [ ] **Step 1: Create `src/types/index.ts`**

All domain types. Key types:

```typescript
export type Category = 'movies' | 'tvshows' | 'albums' | 'books';
export type Status = 'completed' | 'in_progress' | 'planned' | 'dropped';

export interface CollectionItem {
  id: string;
  title: string;
  year: string | null;
  poster: string | null;
  artist?: string;
  author?: string;
  addedAt: number;
  status: Status;
  rating: number | null;
  notes: string;
}

export type Collection = Record<Category, CollectionItem[]>;

export interface CollectionRow {
  id: string;
  user_id: string;
  category: Category;
  title: string;
  year: string | null;
  poster: string | null;
  artist: string | null;
  author: string | null;
  status: Status;
  rating: number | null;
  notes: string;
  added_at: number;
}

export interface SearchResult {
  id: string;
  title: string;
  year: string | null;
  poster: string | null;
  artist?: string;
  author?: string;
  type: Category;
}

export interface StatusDisplay { label: string; color: string; }
export type StatusConfig = Record<Category, Partial<Record<Status, StatusDisplay | null>>>;
export interface StatusOption { value: Status; label: string; color: string; }

// Context types use inline imports from @supabase/supabase-js to avoid circular deps
export interface AuthContextValue {
  user: import('@supabase/supabase-js').User | null;
  session: import('@supabase/supabase-js').Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<import('@supabase/supabase-js').AuthResponse>;
  signIn: (email: string, password: string) => Promise<import('@supabase/supabase-js').AuthResponse>;
  signOut: () => Promise<{ error: Error | null }>;
}

export type ItemUpdates = Partial<Pick<CollectionItem, 'status' | 'rating' | 'notes'>>;

export interface UseCollectionReturn {
  collection: Collection;
  add: (type: Category, item: SearchResult) => Promise<void>;
  remove: (type: Category, id: string) => Promise<void>;
  update: (type: Category, id: string, updates: ItemUpdates) => Promise<void>;
  isInCollection: (type: Category, id: string) => boolean;
  totalCount: number;
  loaded: boolean;
}
```

- [ ] **Step 2: Create `src/types/validation.ts`**

Zod schemas for runtime validation:

```typescript
import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
export const notesSchema = z.string().max(2000, 'Notes must be under 2000 characters');
export const ratingSchema = z.number().min(1).max(5).nullable();
export const statusSchema = z.enum(['completed', 'in_progress', 'planned', 'dropped']);
export const categorySchema = z.enum(['movies', 'tvshows', 'albums', 'books']);
```

- [ ] **Step 3: Create `src/types/sanitize.ts`**

```typescript
import DOMPurify from 'dompurify';

export function sanitizeText(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add domain types, Zod validation schemas, and sanitizer"
```

---

## Task 3: Migrate lib layer (supabase, storage, api)

**Files:**
- Delete: `src/lib/supabase.js` → Create: `src/lib/supabase.ts`
- Delete: `src/lib/storage.js` → Create: `src/lib/storage.ts`
- Delete: `src/lib/api.js` → Create: `src/lib/api.ts`

- [ ] **Step 1: Migrate `src/lib/supabase.ts`**

Add runtime guard for missing env vars. Type the client as `SupabaseClient`.

- [ ] **Step 2: Migrate `src/lib/storage.ts`**

Key changes:
- All functions typed with `Category`, `Collection`, `CollectionItem`, `Status`
- `STATUS_CONFIG` typed as `StatusConfig`
- Use `!` assertions on `collection[type]` or helper function to satisfy `noUncheckedIndexedAccess`

- [ ] **Step 3: Migrate `src/lib/api.ts`**

Key changes:
- Type TMDB response interfaces (`TmdbMovieResult`, `TmdbTvResult`)
- Generic `tmdbFetch<T>` with typed response
- Add `res.ok` checks on ALL fetch calls (iTunes and OpenLibrary were missing these — security fix)
- `searchFns` typed as `Record<Category, (query: string) => Promise<SearchResult[]>>`

- [ ] **Step 4: Run `npx tsc --noEmit` to verify types compile**

- [ ] **Step 5: Delete old `.js` files (`supabase.js`, `storage.js`, `api.js`)**

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "refactor: migrate lib layer to TypeScript with typed APIs"
```

---

## Task 4: Migrate AuthContext and useCollection hook

**Files:**
- Delete: `src/contexts/AuthContext.jsx` → Create: `src/contexts/AuthContext.tsx`
- Delete: `src/hooks/useCollection.js` → Create: `src/hooks/useCollection.ts`

- [ ] **Step 1: Migrate `src/contexts/AuthContext.tsx`**

Key changes:
- `createContext<AuthContextValue | null>(null)`
- Props interface: `{ children: ReactNode }`
- Return types on signUp/signIn/signOut
- `useAuth()` returns `AuthContextValue` (null check inside)

- [ ] **Step 2: Migrate `src/hooks/useCollection.ts`**

Key changes:
- Cast Supabase responses as `CollectionRow[]`
- `rowsToCollection` returns `Collection`, guards `collection[row.category]` with `if (items)` check
- `findCategory` returns `Category | null`
- `update` builds `Partial<CollectionRow>` instead of untyped `{}`
- Migration filter uses type guard: `.filter((r): r is ... => r.category !== null)`

- [ ] **Step 3: Run `npx tsc --noEmit`**

- [ ] **Step 4: Delete old `.jsx`/`.js` files**

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "refactor: migrate AuthContext and useCollection hook to TypeScript"
```

---

## Task 5: Migrate components + create ErrorBoundary

**Files:**
- Create: `src/components/ErrorBoundary.tsx`
- Delete: `src/components/Layout.jsx` → Create: `src/components/Layout.tsx`
- Delete: `src/components/MediaCard.jsx` → Create: `src/components/MediaCard.tsx`
- Delete: `src/components/SearchBar.jsx` → Create: `src/components/SearchBar.tsx`

- [ ] **Step 1: Create `src/components/ErrorBoundary.tsx`**

React class component with `getDerivedStateFromError` and `componentDidCatch`. Dark-themed fallback UI with "Try again" button.

- [ ] **Step 2: Migrate `src/components/Layout.tsx`**

Key changes:
- `navItems` typed as `NavItem[]` with `icon: LucideIcon`
- Import `useAuth` returns typed context

- [ ] **Step 3: Migrate `src/components/MediaCard.tsx`**

Key changes:
- `MediaCardProps` interface with typed callbacks
- `editStatus` state typed as `Status`
- Import `sanitizeText` for notes rendering (defense-in-depth)

- [ ] **Step 4: Migrate `src/components/SearchBar.tsx`**

Key changes:
- `SearchBarProps` interface
- `results` state as `SearchResult[]`
- `timerRef` as `ReturnType<typeof setTimeout> | null`
- `containerRef` as `HTMLDivElement`

- [ ] **Step 5: Run `npx tsc --noEmit`**

- [ ] **Step 6: Delete old `.jsx` files**

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "refactor: migrate components to TypeScript, add ErrorBoundary"
```

---

## Task 6: Migrate pages

**Files:**
- Delete: `src/pages/AuthPage.jsx` → Create: `src/pages/AuthPage.tsx`
- Delete: `src/pages/CategoryPage.jsx` → Create: `src/pages/CategoryPage.tsx`
- Delete: `src/pages/Library.jsx` → Create: `src/pages/Library.tsx`

- [ ] **Step 1: Migrate `src/pages/AuthPage.tsx`**

Key changes:
- Keep `useNavigate` from user's recent change
- Add Zod validation: validate email + password before Supabase call
- **Security:** Generic error messages — login shows "Invalid email or password." instead of raw Supabase messages (prevents user enumeration)
- `handleSubmit` typed as `(e: FormEvent<HTMLFormElement>) => Promise<void>`

- [ ] **Step 2: Migrate `src/pages/CategoryPage.tsx`**

Key changes:
- `CategoryPageProps` with `type: Category`
- `categoryInfo` typed as `Record<Category, CategoryInfo>`
- `filter` state as `Status | 'all'`
- `sortBy` state as `SortOption` (union type)

- [ ] **Step 3: Migrate `src/pages/Library.tsx`**

Key changes:
- `categoryMeta` typed as `Record<string, CategoryMeta>` with `icon: LucideIcon`
- `RecentItem` interface extends `CollectionItem` with `_type: Category`
- `Object.entries` cast as `[Category, CollectionItem[]][]`

- [ ] **Step 4: Run `npx tsc --noEmit`**

- [ ] **Step 5: Delete old `.jsx` files**

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "refactor: migrate pages to TypeScript with Zod validation"
```

---

## Task 7: Migrate app shell + security headers

**Files:**
- Delete: `src/App.jsx` → Create: `src/App.tsx`
- Delete: `src/main.jsx` → Create: `src/main.tsx`
- Modify: `vercel.json`

- [ ] **Step 1: Migrate `src/App.tsx`**

Key changes:
- `RequireAuthProps` interface with `children: ReactNode`
- Wrap entire app in `<ErrorBoundary>`
- Route `type` props stay as string literals (TypeScript infers `Category`)

- [ ] **Step 2: Migrate `src/main.tsx`**

Key changes:
- Null check on `document.getElementById('root')` — `if (!root) throw new Error(...)`

- [ ] **Step 3: Update `vercel.json` with security headers**

Preserve existing rewrites (including Deezer proxy). Add `headers` array:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy` restricting scripts to self, styles to self + Google Fonts, images to self + TMDB + iTunes + Deezer + OpenLibrary, connections to self + APIs + Supabase + Deezer

- [ ] **Step 4: Run `npx tsc --noEmit && npm run build`**

- [ ] **Step 5: Delete all remaining `.js`/`.jsx` source files**

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "refactor: complete TypeScript migration with security headers"
```

---

## Task 8: Final verification

- [ ] **Step 1: Run `npm run typecheck`** — expect 0 errors
- [ ] **Step 2: Run `npm run lint`** — expect 0 errors
- [ ] **Step 3: Run `npm run build`** — expect clean build
- [ ] **Step 4: Run `npm run preview`** — manually verify app works (login, add items, refresh)
- [ ] **Step 5: Commit if any fixes needed**

---

## Security Improvements Summary

| Improvement | Where | What it prevents |
|------------|-------|------------------|
| Zod validation | AuthPage | Invalid data reaching Supabase |
| Generic auth errors | AuthPage | User enumeration attacks |
| `res.ok` checks | api.ts | Silent failures on 4xx/5xx API responses |
| CSP headers | vercel.json | XSS, clickjacking, data exfiltration |
| DOMPurify | sanitize.ts | Stored XSS via notes field |
| ErrorBoundary | App.tsx | Full app crash on runtime errors |
| Strict TypeScript | everywhere | Type errors caught at compile time |
| `noUncheckedIndexedAccess` | tsconfig | `collection[type]` undefined access |

## What is NOT included (intentionally)

- **Supabase generated types** — manual `CollectionRow` is sufficient for this scale
- **TanStack Query** — overkill for simple CRUD
- **State management lib** — context + local state is fine
- **Unit tests** — not requested; Vitest is the natural choice later
- **Path aliases** — nice to have, can add later
