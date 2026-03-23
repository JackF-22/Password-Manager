"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ChangePasswordPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

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
        setError(err instanceof Error ? err.message : "Could not check session.");
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
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        setError(userError.message);
        return;
      }

      if (!user?.email) {
        setError("Could not determine your account email from the current session.");
        return;
      }

      const { error: reauthError } = await supabase.auth.signInWithPassword(
        {
          email: user.email,
          password: currentPassword,
        },
      );

      if (reauthError) {
        setError("Current password is incorrect.");
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setStatusMessage("Password updated.");
      setNewPassword("");
      setCurrentPassword("");
      router.refresh();
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
              Change password
            </CardTitle>
            <CardDescription className="text-slate-400">
              Update your Supabase account password. This does not change your
              vault master password.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {checking ? (
              <p className="text-sm text-slate-400">Loading…</p>
            ) : hasSession ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="change-password-current"
                    className="text-slate-300"
                  >
                    Current password
                  </Label>
                  <Input
                    id="change-password-current"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="border-slate-600/60 bg-slate-800/60 text-slate-100 shadow-inner shadow-black/20 placeholder:text-slate-500 focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500/40 dark:bg-slate-800/60"
                    minLength={8}
                  />
                  <div className="mt-2 text-right text-sm">
                    <Link
                      href="/reset-password"
                      className="text-cyan-300/90 hover:text-cyan-200 underline underline-offset-4"
                    >
                      Forgot current password?
                    </Link>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="change-password-new" className="text-slate-300">
                    New password
                  </Label>
                  <Input
                    id="change-password-new"
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
                  You must be signed in to change your password.
                </p>
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 text-cyan-300/90 hover:text-cyan-200 underline underline-offset-4"
                  onClick={() => router.push("/login")}
                >
                  Go to sign in
                </Button>
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

