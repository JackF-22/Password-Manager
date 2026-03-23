"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useMasterPassword } from "@/components/vault/master-password-context";

/** Signs out of Supabase and redirects to login. Also clears master password from memory. */
export function useSignOutVault() {
  const { lock } = useMasterPassword();
  const router = useRouter();

  return useCallback(async () => {
    lock();
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }, [lock, router]);
}
