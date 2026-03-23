"use client";

import type { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  MasterPasswordProvider,
  useMasterPassword,
} from "@/components/vault/master-password-context";
import { VaultUnlockScreen } from "@/components/vault/vault-unlock-screen";
import { VaultMobileNav } from "@/components/vault/vault-mobile-nav";

function VaultUnlockGate({ children }: { children: ReactNode }) {
  const { isUnlocked } = useMasterPassword();
  if (!isUnlocked) {
    return <VaultUnlockScreen />;
  }
  return (
    <div className="flex min-h-dvh w-full min-w-0 flex-1 flex-col lg:flex-row">
      <AppSidebar />
      <div className="flex min-h-dvh min-w-0 flex-1 flex-col overflow-x-hidden">
        <VaultMobileNav />
        {children}
      </div>
    </div>
  );
}

export function VaultShell({ children }: { children: ReactNode }) {
  return (
    <MasterPasswordProvider>
      <div className="flex min-h-dvh w-full min-w-0 flex-1 flex-col">
        <VaultUnlockGate>{children}</VaultUnlockGate>
      </div>
    </MasterPasswordProvider>
  );
}
