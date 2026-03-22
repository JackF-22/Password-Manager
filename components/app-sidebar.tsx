"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { KeyRound, Shield, Star, Trash2 } from "lucide-react";

const navItems = [
  { href: "/", label: "All Passwords", icon: KeyRound },
  { href: "/favorites", label: "Favorites", icon: Star },
  { href: "/trash", label: "Trash", icon: Trash2 },
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-zinc-200 bg-zinc-50/90 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="flex h-14 items-center gap-2 border-b border-zinc-200 px-4 dark:border-zinc-800">
        <Shield
          className="size-5 text-zinc-700 dark:text-zinc-300"
          aria-hidden
        />
        <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Password Vault
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-2" aria-label="Main">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={
                active
                  ? "flex items-center gap-2 rounded-md bg-zinc-200/90 px-3 py-2 text-sm font-medium text-zinc-900 dark:bg-zinc-800/90 dark:text-zinc-50"
                  : "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
              }
            >
              <Icon className="size-4 shrink-0 opacity-80" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
