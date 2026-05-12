# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run lint      # Run Biome linter
npm run format    # Format with Biome (writes in place)
npx tsx prisma/seed.ts    # Seed database with admin user
npx prisma migrate dev    # Run pending migrations
npx prisma studio         # Open Prisma Studio GUI
```

No test suite is configured.

## Architecture

**ProCard** (brand: Antic Tech) is a Next.js 15 App Router application where users create shareable public link profiles similar to Linktree. Users collect social/contact links on a dashboard and share a public page at `/u/[username]`.

**Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, NextAuth v5 (beta), Prisma ORM, PostgreSQL (Neon), Cloudinary, Biome.

### Route Groups & Key Pages

- `app/(auth)/login/` — public login page
- `app/(user)/dashboard/` — authenticated user dashboard (link management + avatar upload)
- `app/(admin)/admin/` — admin-only user management panel
- `app/u/[username]/` — public profile page with vCard export

### API Routes

- `POST /api/register` — public user registration
- `/api/auth/[...nextauth]` — NextAuth handler
- `GET|POST /api/links`, `PATCH|DELETE /api/links/[id]` — authenticated CRUD for current user's links (ownership enforced)
- `GET|POST /api/user/avatar` — fetch/upload avatar via Cloudinary (200×200, face crop, 2MB max)
- `GET|POST /api/admin/users`, `PATCH|DELETE /api/admin/users/[id]` — admin-only user management

### Auth

NextAuth v5 with Credentials provider only. JWT strategy — token carries `id`, `role`, `username`. Two helpers in `lib/require-auth.ts`:
- `requireAuth()` — redirects unauthenticated users to `/login`
- `requireAdmin()` — redirects non-admins to `/dashboard`

Passwords hashed with `bcryptjs` (12 rounds).

### Database Schema

Two models:

```
User  id(uuid), username(unique), email(unique), password(hash), role(USER|ADMIN), avatarUrl?, createdAt
Link  id(uuid), platform(string), url(string), userId(FK→User, cascade delete)
```

Platform values: `PHONE`, `EMAIL`, `MAPS`, `INSTAGRAM`, `FACEBOOK`, `SNAPCHAT`, `TIKTOK`, `WHATSAPP`, `WEBSITE`, `REVIEWS`, `AUTRE` (custom).

### Required Environment Variables

```
DATABASE_URL=          # Neon PostgreSQL connection string
AUTH_SECRET=           # NextAuth JWT signing key
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Key Files

- `lib/auth.ts` — NextAuth config, JWT/session callbacks
- `lib/prisma.ts` — Prisma singleton (global instance pattern)
- `lib/session.ts` — extracts session token from cookies for use in API routes
- `next.config.ts` — image remote patterns (Cloudinary + Vercel Blob)
- `types/nextauth.d.ts` — session type augmentation adding `id`, `role`, `username`

### UI Notes

Parts of the UI use French strings (e.g., "Ce connecter", "Ajouter"). Platform icons are served from `public/` as PNG files named after each platform.
