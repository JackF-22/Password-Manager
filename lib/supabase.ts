import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for Client Components and browser-only code.
 * Session is stored in cookies (refreshed via middleware).
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Add them to .env.local.",
    );
  }

  return createBrowserClient(url, anonKey);
}
