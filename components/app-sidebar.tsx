"use client";

import { KeyRound, Lock, LogOut, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { VaultNavLinks } from "@/components/vault/vault-nav-links";
import { useLockVault } from "@/hooks/use-lock-vault";
import { useSignOutVault } from "@/hooks/use-sign-out-vault";

export function AppSidebar() {
  const router = useRouter();
  const lockVault = useLockVault();
  const signOutVault = useSignOutVault();

  return (
    <aside className="hidden min-h-dvh w-64 shrink-0 flex-col border-r border-slate-300/80 bg-gradient-to-b from-slate-200 via-slate-100 to-slate-200/95 backdrop-blur-sm dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 lg:flex">
      <div className="flex min-h-[3.75rem] items-center gap-3 border-b border-slate-300/80 px-5 py-4 dark:border-slate-800">
        <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-md dark:from-slate-800 dark:to-black">
          <Shield className="size-5" aria-hidden />
        </div>
        <span className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Password Vault
        </span>
      </div>
      <div className="flex flex-1 flex-col px-3 py-4">
        <VaultNavLinks />
      </div>
      <div className="flex flex-col gap-2 border-t border-slate-300/80 px-3 py-4 dark:border-slate-800">
        <Button
          type="button"
          variant="ghost"
          className="h-11 w-full justify-start gap-2 text-base text-slate-800 hover:bg-slate-300/50 dark:text-slate-200 dark:hover:bg-slate-800/80"
          onClick={() => lockVault()}
        >
          <Lock className="size-5 shrink-0" aria-hidden />
          Lock vault
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-11 w-full justify-start gap-2 text-base text-slate-600 hover:bg-slate-300/50 dark:text-slate-400 dark:hover:bg-slate-800/80"
          onClick={() => void signOutVault()}
        >
          <LogOut className="size-5 shrink-0" aria-hidden />
          Sign out
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-11 w-full justify-start gap-2 text-base text-slate-600 hover:bg-slate-300/50 dark:text-slate-400 dark:hover:bg-slate-800/80"
          onClick={() => router.push("/change-password")}
        >
          <KeyRound className="size-5 shrink-0" aria-hidden />
          Change password
        </Button>
      </div>
    </aside>
  );
}
