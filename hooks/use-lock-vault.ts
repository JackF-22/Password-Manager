"use client";

import { useCallback } from "react";
import { useMasterPassword } from "@/components/vault/master-password-context";

/** Clears master password only — shows unlock screen, stays signed in. */
export function useLockVault() {
  const { lock } = useMasterPassword();

  return useCallback(() => {
    lock();
  }, [lock]);
}
