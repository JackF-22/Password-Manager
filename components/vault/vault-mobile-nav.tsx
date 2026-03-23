"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { VaultNavLinks } from "@/components/vault/vault-nav-links";
import { useLockVault } from "@/hooks/use-lock-vault";
import { useSignOutVault } from "@/hooks/use-sign-out-vault";

export function VaultMobileNav() {
  const [open, setOpen] = useState(false);
  const lockVault = useLockVault();
  const signOutVault = useSignOutVault();

  function handleLock() {
    setOpen(false);
    lockVault();
  }

  async function handleSignOut() {
    setOpen(false);
    await signOutVault();
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex min-h-[3.5rem] shrink-0 items-center gap-3 border-b border-slate-300/80 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 lg:hidden">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-10 text-slate-800 dark:text-slate-200"
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="vault-mobile-menu"
          onClick={() => setOpen(true)}
        >
          <Menu className="size-5" aria-hidden />
        </Button>
        <span className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">
          Password Vault
        </span>
      </header>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          id="vault-mobile-menu"
          side="left"
          className="flex w-[min(100vw,300px)] flex-col border-slate-300/80 bg-gradient-to-b from-slate-200 via-slate-100 to-slate-200 p-0 dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
          showCloseButton
        >
          <SheetHeader className="border-b border-slate-300/80 px-5 py-4 text-left dark:border-slate-800">
            <SheetTitle className="text-lg text-slate-900 dark:text-slate-100">
              Menu
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-1 flex-col overflow-y-auto px-3 py-4">
            <VaultNavLinks onNavigate={() => setOpen(false)} />
          </div>
          <div className="mt-auto flex flex-col gap-2 border-t border-slate-300/80 px-4 py-4 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full justify-start border-slate-400/80 text-base text-slate-900 dark:border-slate-600 dark:text-slate-100"
              onClick={() => handleLock()}
            >
              Lock vault
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-11 w-full justify-start text-base text-slate-600 dark:text-slate-400"
              onClick={() => void handleSignOut()}
            >
              Sign out
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
