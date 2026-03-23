"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type MasterPasswordContextValue = {
  /** In-memory only; cleared on refresh, lock, or leaving the vault. */
  masterPassword: string | null;
  unlock: (password: string) => void;
  lock: () => void;
  isUnlocked: boolean;
};

const MasterPasswordContext = createContext<MasterPasswordContextValue | null>(
  null,
);

export function MasterPasswordProvider({ children }: { children: ReactNode }) {
  const [masterPassword, setMasterPassword] = useState<string | null>(null);

  const unlock = useCallback((password: string) => {
    setMasterPassword(password);
  }, []);

  const lock = useCallback(() => {
    setMasterPassword(null);
  }, []);

  const value = useMemo<MasterPasswordContextValue>(
    () => ({
      masterPassword,
      unlock,
      lock,
      isUnlocked:
        masterPassword !== null && masterPassword.length > 0,
    }),
    [masterPassword, unlock, lock],
  );

  return (
    <MasterPasswordContext.Provider value={value}>
      {children}
    </MasterPasswordContext.Provider>
  );
}

export function useMasterPassword(): MasterPasswordContextValue {
  const ctx = useContext(MasterPasswordContext);
  if (!ctx) {
    throw new Error(
      "useMasterPassword must be used within MasterPasswordProvider",
    );
  }
  return ctx;
}
