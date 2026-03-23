"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import { googleFaviconUrl, hostnameFromSiteInput } from "@/lib/vault/site-favicon";
import { cn } from "@/lib/utils";

type Props = {
  siteLabel: string;
  className?: string;
};

const FETCH_SZ = 64;

export function SiteFaviconImg({ siteLabel, className }: Props) {
  const host = hostnameFromSiteInput(siteLabel);
  const src = host ? googleFaviconUrl(host, FETCH_SZ) : "";
  const [failed, setFailed] = useState(!src);

  if (!src || failed) {
    return (
      <span
        className={cn(
          "inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
          className,
        )}
        aria-hidden
      >
        <Globe className="size-5" />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      width={40}
      height={40}
      className={cn(
        "size-10 shrink-0 rounded-lg bg-white object-contain ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-700",
        className,
      )}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
