"use client";

import { useState } from "react";
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

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createClient();
      const origin = window.location.origin;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${origin}/reset-password/confirm`,
        },
      );

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setMessage("If that email exists, we sent a reset link.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start reset.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-dvh w-full min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto bg-slate-950">
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col px-4 py-10 sm:px-8">
        <Card className="border border-white/10 bg-slate-900/55 shadow-2xl shadow-blue-950/50 backdrop-blur-2xl ring-1 ring-blue-500/20">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-xl font-semibold text-white">
              Reset your password
            </CardTitle>
            <CardDescription className="text-slate-400">
              Enter your email and we will send a reset link.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-slate-300">
                  Email
                </Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="border-slate-600/60 bg-slate-800/60 text-slate-100 shadow-inner shadow-black/20 placeholder:text-slate-500 focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500/40 dark:bg-slate-800/60"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="h-10 w-full border-0 bg-gradient-to-r from-blue-600 to-cyan-600 font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:from-blue-500 hover:to-cyan-500 hover:shadow-blue-800/50"
              >
                {loading ? "Sending…" : "Send reset link"}
              </Button>
            </form>

            {error ? (
              <p className="mt-4 rounded-lg border border-red-500/25 bg-red-950/40 px-3 py-2.5 text-sm text-red-200/90">
                {error}
              </p>
            ) : null}
            {message ? (
              <p className="mt-4 rounded-lg border border-cyan-500/20 bg-cyan-950/30 px-3 py-2.5 text-sm text-cyan-100/90">
                {message}
              </p>
            ) : null}

            <div className="mt-4 text-center text-sm text-slate-300">
              <Link
                href="/login"
                className="text-cyan-300/90 hover:text-cyan-200 underline underline-offset-4"
              >
                Back to sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

