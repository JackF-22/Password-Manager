"use client";

import { useEffect, useState } from "react";
import { Copy, Loader2, Lock, RefreshCw, Save } from "lucide-react";
import { createClient } from "@/lib/supabase";
import {
  deriveKeyWithSaltBytes,
  encryptData,
  randomSaltBytes,
  toBase64,
} from "@/lib/crypto";
import {
  generateStrongPassword,
  type PasswordGenerationOptions,
} from "@/lib/vault/password-generator";
import { scheduleClipboardClear } from "@/lib/vault/clipboard-clear";
import { useMasterPassword } from "@/components/vault/master-password-context";
import { PasswordStrengthMeter } from "@/components/vault/password-strength-meter";
import { SiteFaviconImg } from "@/components/vault/site-favicon-img";
import { useLockVault } from "@/hooks/use-lock-vault";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const strengthMeterDescId = "generated-password-strength-desc";
const defaultOptions: Required<PasswordGenerationOptions> = {
  length: 24,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSpecial: true,
};

export function VaultGenerator() {
  const { masterPassword, isUnlocked } = useMasterPassword();
  const lockVault = useLockVault();

  const [site, setSite] = useState("");
  const [username, setUsername] = useState("");
  const [options, setOptions] =
    useState<Required<PasswordGenerationOptions>>(defaultOptions);
  const [password, setPassword] = useState(generateStrongPassword(options));
  const [copying, setCopying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    setPassword(generateStrongPassword(options));
  }, [options]);

  function regenerate() {
    setPassword(generateStrongPassword(options));
    setSavedMessage(null);
    setError(null);
  }

  function setOption(
    key: "includeUppercase" | "includeLowercase" | "includeNumbers" | "includeSpecial",
    value: boolean,
  ) {
    setOptions((prev) => {
      const next = { ...prev, [key]: value };
      const selectedCount = [
        next.includeUppercase,
        next.includeLowercase,
        next.includeNumbers,
        next.includeSpecial,
      ].filter(Boolean).length;
      return selectedCount === 0 ? prev : next;
    });
    setSavedMessage(null);
    setError(null);
  }

  async function copyGeneratedPassword() {
    setError(null);
    setCopying(true);
    try {
      await navigator.clipboard.writeText(password);
      scheduleClipboardClear(30_000);
      setSavedMessage("Password copied. Clipboard will clear in 30 seconds.");
    } catch {
      setError("Could not copy generated password.");
    } finally {
      setCopying(false);
    }
  }

  async function saveGeneratedPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!masterPassword) return;

    setError(null);
    setSavedMessage(null);
    setSaving(true);
    try {
      const salt = randomSaltBytes();
      const saltB64 = toBase64(salt);
      const key = await deriveKeyWithSaltBytes(masterPassword, salt);
      const { encrypted, iv } = await encryptData(password, key);

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Not signed in.");
        setSaving(false);
        return;
      }

      const { error: insertError } = await supabase.from("passwords").insert({
        user_id: user.id,
        site_name: site.trim(),
        username: username.trim(),
        encrypted_value: encrypted,
        iv,
        salt: saltB64,
        is_favorite: false,
      });

      if (insertError) {
        setError(insertError.message);
        setSaving(false);
        return;
      }

      setSavedMessage("Generated password saved.");
      setSite("");
      setUsername("");
      setPassword(generateStrongPassword(options));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save password.");
    } finally {
      setSaving(false);
    }
  }

  if (!isUnlocked) {
    return null;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-gradient-to-b from-slate-200/90 via-slate-100 to-slate-200/80 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <header className="border-b border-slate-300/80 bg-slate-100/95 px-3 py-4 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-100">
              Generate
            </h1>
            <p className="mt-1.5 text-base text-slate-600 dark:text-slate-400">
              Create a high-entropy password, then encrypt and store it in your
              vault.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-slate-400/70 bg-white/90 text-slate-800 hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={() => lockVault()}
          >
            <Lock className="size-4" aria-hidden />
            Lock vault
          </Button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-3 py-5 sm:px-6 sm:py-6 lg:px-8">
        <form
          onSubmit={(e) => void saveGeneratedPassword(e)}
          className="rounded-xl border border-slate-300/70 bg-white/95 p-4 shadow-md shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-900/90 sm:p-5"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="generate-site">Site or URL</Label>
              <div className="flex items-center gap-3">
                <SiteFaviconImg siteLabel={site} />
                <Input
                  id="generate-site"
                  value={site}
                  onChange={(e) => setSite(e.target.value)}
                  placeholder="e.g. github.com or https://…"
                  required
                  autoComplete="off"
                  className="min-w-0 flex-1 border-slate-300/80 text-base dark:border-slate-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="generate-username">Username</Label>
              <Input
                id="generate-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username or email"
                required
                autoComplete="off"
                className="border-slate-300/80 text-base dark:border-slate-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="generate-password">Generated password</Label>
              <Input
                id="generate-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                aria-describedby={strengthMeterDescId}
                className="border-slate-300/80 font-mono text-sm dark:border-slate-600 sm:text-base"
              />
              <PasswordStrengthMeter
                password={password}
                id={strengthMeterDescId}
              />
            </div>

            <div className="space-y-3 rounded-lg border border-slate-300/80 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-950/60">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="generate-length">Length</Label>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {options.length} chars
                  </span>
                </div>
                <Input
                  id="generate-length"
                  type="range"
                  min={8}
                  max={24}
                  value={options.length}
                  onChange={(e) =>
                    setOptions((prev) => ({
                      ...prev,
                      length: Number(e.target.value),
                    }))
                  }
                  className="h-2 cursor-pointer border-0 bg-transparent p-0"
                />
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={options.includeUppercase}
                    onChange={(e) =>
                      setOption("includeUppercase", e.target.checked)
                    }
                  />
                  Uppercase letters
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={options.includeLowercase}
                    onChange={(e) =>
                      setOption("includeLowercase", e.target.checked)
                    }
                  />
                  Lowercase letters
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={options.includeNumbers}
                    onChange={(e) =>
                      setOption("includeNumbers", e.target.checked)
                    }
                  />
                  Numbers
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={options.includeSpecial}
                    onChange={(e) =>
                      setOption("includeSpecial", e.target.checked)
                    }
                  />
                  Special characters
                </label>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => void copyGeneratedPassword()}
                disabled={copying}
                className="bg-slate-200/90 text-slate-900 hover:bg-slate-300/90 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                {copying ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Copy className="size-4" aria-hidden />
                )}
                Copy
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => regenerate()}
                className="border-slate-300/80 bg-white/90 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900/90 dark:hover:bg-slate-800"
              >
                <RefreshCw className="size-4" aria-hidden />
                Regenerate
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-slate-800 to-slate-950 text-white shadow-md hover:from-slate-700 hover:to-slate-900 dark:from-slate-700 dark:to-black"
              >
                {saving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="size-4" aria-hidden />
                    Save to vault
                  </>
                )}
              </Button>
            </div>

            {error ? (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            ) : null}
            {savedMessage ? (
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                {savedMessage}
              </p>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}
