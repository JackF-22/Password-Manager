"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Feedback = { text: string; tone: "error" | "info" };

const inputClass =
  "border-slate-600/60 bg-slate-800/60 text-slate-100 shadow-inner shadow-black/20 placeholder:text-slate-500 focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500/40 dark:bg-slate-800/60";

const labelClass = "text-slate-300";

const tabListClass =
  "grid w-full grid-cols-2 gap-1 rounded-xl bg-slate-800/70 p-1 ring-1 ring-white/10";

const tabTriggerClass =
  "rounded-lg text-slate-400 transition-all data-[active]:bg-gradient-to-r data-[active]:from-blue-600 data-[active]:to-cyan-600 data-[active]:text-white data-[active]:shadow-md data-[active]:shadow-blue-900/40";

const submitButtonClass =
  "h-10 w-full border-0 bg-gradient-to-r from-blue-600 to-cyan-600 font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:from-blue-500 hover:to-cyan-500 hover:shadow-blue-800/50";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(() => {
    if (authError === "config") {
      return {
        text: "Supabase environment variables are missing. Copy .env.example to .env.local and add your project URL and anon key.",
        tone: "error",
      };
    }
    if (authError) {
      return {
        text: "Authentication failed. Try signing in again.",
        tone: "error",
      };
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setFeedback({ text: error.message, tone: "error" });
      return;
    }
    router.push("/vault");
    router.refresh();
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    const supabase = createClient();
    const origin = window.location.origin;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) {
      setFeedback({ text: error.message, tone: "error" });
      return;
    }
    setFeedback({
      text: "Check your email to confirm your account, or sign in if confirmations are disabled.",
      tone: "info",
    });
  }

  return (
    <Card className="mx-auto w-full max-w-md border border-white/10 bg-slate-900/55 shadow-2xl shadow-blue-950/50 backdrop-blur-2xl ring-1 ring-blue-500/20">
      <CardHeader className="space-y-1 pb-2">
        <div className="flex items-center gap-2 text-blue-400/90">
          <Lock className="size-4" aria-hidden />
          <span className="text-xs font-medium uppercase tracking-widest">
            Secure access
          </span>
        </div>
        <CardTitle className="text-xl font-semibold text-white">
          Sign in to your vault
        </CardTitle>
        <CardDescription className="text-slate-400">
          Use your email and account password. Vault encryption uses a separate
          master password in the app.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className={tabListClass}>
            <TabsTrigger value="signin" className={tabTriggerClass}>
              Sign in
            </TabsTrigger>
            <TabsTrigger value="signup" className={tabTriggerClass}>
              Sign up
            </TabsTrigger>
          </TabsList>
          <TabsContent value="signin" className="mt-5 space-y-4 outline-none">
            <form onSubmit={signIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email" className={labelClass}>
                  Email
                </Label>
                <Input
                  id="signin-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password" className={labelClass}>
                  Password
                </Label>
                <Input
                  id="signin-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
              </div>
              <Button
                type="submit"
                className={submitButtonClass}
                disabled={loading}
              >
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="signup" className="mt-5 space-y-4 outline-none">
            <form onSubmit={signUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email" className={labelClass}>
                  Email
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password" className={labelClass}>
                  Password
                </Label>
                <Input
                  id="signup-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
              </div>
              <Button
                type="submit"
                className={submitButtonClass}
                disabled={loading}
              >
                {loading ? "Creating account…" : "Create account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        {feedback ? (
          <p
            className={
              feedback.tone === "error"
                ? "mt-4 rounded-lg border border-red-500/25 bg-red-950/40 px-3 py-2.5 text-sm text-red-200/90"
                : "mt-4 rounded-lg border border-cyan-500/20 bg-cyan-950/30 px-3 py-2.5 text-sm text-cyan-100/90"
            }
            role="status"
            aria-live="polite"
          >
            {feedback.text}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
