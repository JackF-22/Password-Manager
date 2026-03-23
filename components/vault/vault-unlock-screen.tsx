"use client";

import { useState } from "react";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMasterPassword } from "@/components/vault/master-password-context";

export function VaultUnlockScreen() {
  const { unlock } = useMasterPassword();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!password.trim()) {
      setError("Enter your master password.");
      return;
    }
    unlock(password);
  }

  return (
    <div className="flex min-h-dvh flex-1 flex-col items-center justify-center bg-zinc-50/80 px-4 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))] dark:bg-zinc-950/80 sm:py-12">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
            <Shield className="size-7" aria-hidden />
          </div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Unlock your vault
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Your master password stays in memory only for this session. It is
            never sent to the server.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vault-master">Master password</Label>
            <Input
              id="vault-master"
              type="password"
              autoComplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter master password"
              className="w-full"
            />
          </div>
          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : null}
          <Button type="submit" className="w-full">
            Unlock vault
          </Button>
        </form>
      </div>
    </div>
  );
}
