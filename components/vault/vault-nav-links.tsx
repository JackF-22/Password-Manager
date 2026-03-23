"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { KeyRound, Sparkles, Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/vault", label: "All Passwords", icon: KeyRound },
  { href: "/vault/generate", label: "Generate", icon: Sparkles },
  { href: "/vault/favorites", label: "Favorites", icon: Star },
  { href: "/vault/trash", label: "Trash", icon: Trash2 },
] as const;

export function VaultNavLinks({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <nav
      className={cn("flex flex-col gap-1", className)}
      aria-label="Vault navigation"
    >
      {navItems.map(({ href, label, icon: Icon }) => {
        const active =
          pathname === href ||
          (href !== "/vault" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            onClick={() => onNavigate?.()}
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-3 text-base transition-colors",
              active
                ? "bg-slate-800 font-medium text-white shadow-sm dark:bg-slate-950 dark:ring-1 dark:ring-slate-700"
                : "text-slate-700 hover:bg-slate-300/60 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/90 dark:hover:text-white",
            )}
          >
            <Icon
              className={cn(
                "size-5 shrink-0",
                active ? "text-slate-200" : "opacity-85",
              )}
              aria-hidden
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
