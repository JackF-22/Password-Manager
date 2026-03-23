/**
 * Google hosted favicon service (public, no API key).
 * @see https://www.google.com/s2/favicons
 */
export function googleFaviconUrl(hostname: string, sizePx = 64): string {
  const host = hostname.trim().toLowerCase().replace(/^www\./, "");
  if (!host) return "";
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=${sizePx}`;
}

/**
 * Accepts "example.com", "https://app.example.com/path", "www.bank.com", etc.
 */
export function hostnameFromSiteInput(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  try {
    const withProto = /^https?:\/\//i.test(s) ? s : `https://${s}`;
    const u = new URL(withProto);
    const h = u.hostname.toLowerCase();
    if (h && (h.includes(".") || h === "localhost")) {
      return h;
    }
  } catch {
    return null;
  }
  return null;
}
