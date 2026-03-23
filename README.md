# Password Vault

A modern password manager built with Next.js and Supabase.

Live site: [https://mypasswordvault.netlify.app](https://mypasswordvault.netlify.app)

## Highlights

- Authenticated vault experience powered by Supabase Auth
- Client-side encryption workflow before secrets are persisted
- Vault organization with All Passwords, Favorites, Trash, and Generate tabs
- Strong password generation with configurable options:
  - Length slider (8-24)
  - Uppercase, lowercase, numbers, and special character toggles
- Search and filtering by site, username, or email
- Responsive UI optimized for desktop sidebar and mobile navigation

## Tech Stack

- [Next.js](https://nextjs.org) (App Router)
- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Supabase](https://supabase.com) (Auth + Postgres)
- [Tailwind CSS](https://tailwindcss.com)

## Local Development

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3) Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm run start
```

## Netlify Deployment

This project is configured to deploy on Netlify.

### Required Netlify environment variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Required Supabase Auth URL settings

In Supabase Dashboard -> Authentication -> URL Configuration:

- **Site URL**: `https://mypasswordvault.netlify.app`
- **Additional Redirect URLs**:
  - `https://mypasswordvault.netlify.app/auth/callback`

These settings are required for production sign-in and sign-up callback flows.

## Project Structure

```text
app/                  # App Router pages and routes
components/           # UI and feature components
lib/                  # Supabase, crypto, and shared utilities
hooks/                # Vault interaction hooks
supabase/             # SQL setup and migrations
```

## Security Notes

- Vault entries are encrypted client-side before being saved.
- Do not commit `.env.local` or any secret values.
- Use HTTPS in production (Netlify provides this by default).
