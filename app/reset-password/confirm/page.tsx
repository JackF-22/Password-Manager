"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordConfirmPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;
        setHasSession(Boolean(data.session));
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Could not verify reset link.");
      } finally {
        if (cancelled) return;
        setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatusMessage(null);
    setSaving(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setStatusMessage("Password updated. You can now sign in.");
      setNewPassword("");
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative flex min-h-dvh w-full min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto bg-slate-950">
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col px-4 py-10 sm:px-8">
        <Card className="border border-white/10 bg-slate-900/55 shadow-2xl shadow-blue-950/50 backdrop-blur-2xl ring-1 ring-blue-500/20">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-xl font-semibold text-white">
              Choose a new password
            </CardTitle>
            <CardDescription className="text-slate-400">
              This page is for password reset links from your email.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {checking ? (
              <p className="text-sm text-slate-400">Loading…</p>
            ) : hasSession ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-slate-300">
                    New password
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="border-slate-600/60 bg-slate-800/60 text-slate-100 shadow-inner shadow-black/20 placeholder:text-slate-500 focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500/40 dark:bg-slate-800/60"
                    minLength={8}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={saving}
                  className="h-10 w-full border-0 bg-gradient-to-r from-blue-600 to-cyan-600 font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:from-blue-500 hover:to-cyan-500 hover:shadow-blue-800/50"
                >
                  {saving ? "Updating…" : "Update password"}
                </Button>
              </form>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-300">
                  This reset link is missing or expired. Send yourself a new
                  reset email to continue.
                </p>
                <Link
                  href="/reset-password"
                  className="text-sm text-cyan-300/90 hover:text-cyan-200 underline underline-offset-4"
                >
                  Request a new reset link
                </Link>
              </div>
            )}

            {error ? (
              <p className="mt-4 rounded-lg border border-red-500/25 bg-red-950/40 px-3 py-2.5 text-sm text-red-200/90">
                {error}
              </p>
            ) : null}
            {statusMessage ? (
              <p className="mt-4 rounded-lg border border-cyan-500/20 bg-cyan-950/30 px-3 py-2.5 text-sm text-cyan-100/90">
                {statusMessage}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

