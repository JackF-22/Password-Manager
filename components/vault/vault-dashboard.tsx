"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ClipboardPaste,
  Copy,
  Loader2,
  Lock,
  Plus,
  RotateCcw,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import {
  decryptData,
  deriveKeyWithSaltBase64,
  deriveKeyWithSaltBytes,
  encryptData,
  randomSaltBytes,
  toBase64,
} from "@/lib/crypto";
import { scheduleClipboardClear } from "@/lib/vault/clipboard-clear";
import type { PasswordRow } from "@/lib/types/password";
import { useMasterPassword } from "@/components/vault/master-password-context";
import { PasswordStrengthMeter } from "@/components/vault/password-strength-meter";
import { SiteFaviconImg } from "@/components/vault/site-favicon-img";
import { useLockVault } from "@/hooks/use-lock-vault";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const strengthMeterDescId = "add-password-strength-desc";

export type VaultViewMode = "all" | "favorites" | "trash";

const VIEW_COPY: Record<
  VaultViewMode,
  { title: string; description: string; empty: string; emptySearch: string }
> = {
  all: {
    title: "All passwords",
    description:
      "Encrypted on your device before they reach the database.",
    empty: "No passwords yet. Add one to get started.",
    emptySearch: "No matches for your search.",
  },
  favorites: {
    title: "Favorites",
    description: "Quick access to starred logins.",
    empty: "Star entries from All passwords to see them here.",
    emptySearch: "No starred matches for your search.",
  },
  trash: {
    title: "Trash",
    description: "Restore a login or delete it forever.",
    empty: "Trash is empty.",
    emptySearch: "No matches in trash.",
  },
};

function isFavorite(row: PasswordRow): boolean {
  return Boolean(row.is_favorite);
}

type Props = { mode?: VaultViewMode };

export function VaultDashboard({ mode = "all" }: Props) {
  const copy = VIEW_COPY[mode];
  const { masterPassword, isUnlocked } = useMasterPassword();
  const lockVault = useLockVault();
  const [rows, setRows] = useState<PasswordRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [site, setSite] = useState("");
  const [username, setUsername] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [actionError, setActionError] = useState<string | null>(null);
  const [clipboardActive, setClipboardActive] = useState(false);
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const [manualCopyOpen, setManualCopyOpen] = useState(false);
  const [manualCopyValue, setManualCopyValue] = useState("");
  const [manualCopyLabel, setManualCopyLabel] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const clipboardUiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const loadRows = useCallback(async () => {
    setListError(null);
    setLoading(true);
    const supabase = createClient();
    let query = supabase.from("passwords").select("*");

    if (mode === "trash") {
      query = query.not("deleted_at", "is", null);
    } else {
      query = query.is("deleted_at", null);
      if (mode === "favorites") {
        query = query.eq("is_favorite", true);
      }
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    setLoading(false);
    if (error) {
      setListError(error.message);
      setRows([]);
      return;
    }
    setRows((data as PasswordRow[]) ?? []);
  }, [mode]);

  useEffect(() => {
    if (!isUnlocked) {
      setRows([]);
      return;
    }
    void loadRows();
  }, [isUnlocked, loadRows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const site = r.site_name.toLowerCase();
      const username = r.username.toLowerCase();
      return site.includes(q) || username.includes(q);
    });
  }, [rows, search]);

  function resetAddForm() {
    setSite("");
    setUsername("");
    setAccountPassword("");
    setSaveError(null);
  }

  async function handleAddPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!masterPassword) return;
    setSaveError(null);
    setSaving(true);
    try {
      const salt = randomSaltBytes();
      const saltB64 = toBase64(salt);
      const key = await deriveKeyWithSaltBytes(masterPassword, salt);
      const { encrypted, iv } = await encryptData(accountPassword, key);

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setSaveError("Not signed in.");
        setSaving(false);
        return;
      }

      const { error } = await supabase.from("passwords").insert({
        user_id: user.id,
        site_name: site.trim(),
        username: username.trim(),
        encrypted_value: encrypted,
        iv,
        salt: saltB64,
        is_favorite: false,
      });

      if (error) {
        setSaveError(error.message);
        setSaving(false);
        return;
      }

      resetAddForm();
      setAddOpen(false);
      await loadRows();
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Could not encrypt or save.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleCopyPassword(row: PasswordRow) {
    if (!masterPassword) return;
    setActionError(null);
    setCopyingId(row.id);
    try {
      const key = await deriveKeyWithSaltBase64(masterPassword, row.salt);
      const plain = await decryptData(
        row.encrypted_value,
        row.iv,
        key,
      );
      let copied = false;
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(plain);
          copied = true;
        } catch {
          copied = false;
        }
      }

      if (!copied) {
        const textarea = document.createElement("textarea");
        textarea.value = plain;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        copied = document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      if (!copied) {
        setManualCopyValue(plain);
        setManualCopyLabel(row.site_name);
        setManualCopyOpen(true);
        setActionError(
          "Password decrypted, but this browser blocked clipboard access. Use the manual copy sheet.",
        );
        return;
      }

      scheduleClipboardClear(30_000);

      if (clipboardUiTimerRef.current) {
        clearTimeout(clipboardUiTimerRef.current);
      }
      setClipboardActive(true);
      clipboardUiTimerRef.current = setTimeout(() => {
        setClipboardActive(false);
        clipboardUiTimerRef.current = null;
      }, 30_000);
    } catch {
      setActionError(
        "Could not decrypt this password. Your master password may be wrong for this entry.",
      );
    } finally {
      setCopyingId(null);
    }
  }

  async function handleManualCopy() {
    if (!manualCopyValue) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(manualCopyValue);
      } else {
        throw new Error("Clipboard API unavailable");
      }
      scheduleClipboardClear(30_000);
      setClipboardActive(true);
      if (clipboardUiTimerRef.current) {
        clearTimeout(clipboardUiTimerRef.current);
      }
      clipboardUiTimerRef.current = setTimeout(() => {
        setClipboardActive(false);
        clipboardUiTimerRef.current = null;
      }, 30_000);
      setActionError(null);
      setManualCopyOpen(false);
    } catch {
      setActionError(
        "This device still blocked clipboard access. Press and hold the password text, then copy manually.",
      );
    }
  }

  async function handleToggleFavorite(row: PasswordRow) {
    setPendingId(row.id);
    setActionError(null);
    const supabase = createClient();
    const next = !isFavorite(row);
    const { error } = await supabase
      .from("passwords")
      .update({ is_favorite: next })
      .eq("id", row.id);
    setPendingId(null);
    if (error) {
      setActionError(error.message);
      return;
    }
    await loadRows();
  }

  async function handleMoveToTrash(row: PasswordRow) {
    setPendingId(row.id);
    setActionError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("passwords")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", row.id);
    setPendingId(null);
    if (error) {
      setActionError(error.message);
      return;
    }
    await loadRows();
  }

  async function handleRestore(row: PasswordRow) {
    setPendingId(row.id);
    setActionError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("passwords")
      .update({ deleted_at: null })
      .eq("id", row.id);
    setPendingId(null);
    if (error) {
      setActionError(error.message);
      return;
    }
    await loadRows();
  }

  async function handlePermanentDelete(row: PasswordRow) {
    if (
      !confirm(
        `Permanently delete “${row.site_name}”? This cannot be undone.`,
      )
    ) {
      return;
    }
    setPendingId(row.id);
    setActionError(null);
    const supabase = createClient();
    const { error } = await supabase.from("passwords").delete().eq("id", row.id);
    setPendingId(null);
    if (error) {
      setActionError(error.message);
      return;
    }
    await loadRows();
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
              {copy.title}
            </h1>
            <p className="mt-1.5 text-base text-slate-600 dark:text-slate-400">
              {copy.description}
            </p>
          </div>
          <div className="flex flex-wrap items-stretch gap-2 sm:items-center sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 border-slate-400/70 bg-white/90 text-slate-800 hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-800 sm:flex-initial"
              onClick={() => lockVault()}
            >
              <Lock className="size-4" aria-hidden />
              Lock vault
            </Button>
            {mode === "all" ? (
              <Button
                type="button"
                size="sm"
                className="flex-1 bg-gradient-to-r from-slate-800 to-slate-950 text-white shadow-md hover:from-slate-700 hover:to-slate-900 dark:from-slate-700 dark:to-black dark:hover:from-slate-600 sm:flex-initial"
                onClick={() => setAddOpen(true)}
              >
                <Plus className="size-4" aria-hidden />
                Add password
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-3 py-5 sm:px-6 sm:py-6 lg:px-8">
        {clipboardActive ? (
          <div
            className="flex items-start gap-2 rounded-lg border border-amber-300/80 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-800/50 dark:bg-amber-950/50 dark:text-amber-100"
            role="status"
          >
            <ClipboardPaste className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              Clipboard will be cleared automatically in 30 seconds for safety.
            </span>
          </div>
        ) : null}

        {actionError ? (
          <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-200">
            {actionError}
          </p>
        ) : null}

        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search by site, username, or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border-slate-300/80 bg-white/95 pl-10 text-base dark:border-slate-700 dark:bg-slate-900/90"
            aria-label="Filter by site, username, or email"
          />
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center gap-2 py-16 text-slate-600 sm:py-20 dark:text-slate-400">
            <Loader2 className="size-5 animate-spin" aria-hidden />
            Loading…
          </div>
        ) : listError ? (
          <p className="text-sm text-red-600 dark:text-red-400">{listError}</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-400/50 bg-white/80 py-12 text-center sm:py-16 dark:border-slate-700 dark:bg-slate-900/60">
            <p className="text-base text-slate-600 dark:text-slate-400">
              {rows.length === 0 ? copy.empty : copy.emptySearch}
            </p>
          </div>
        ) : (
          <ul className="space-y-3 pb-8">
            {filtered.map((row) => (
              <li
                key={row.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-300/70 bg-white/95 p-4 shadow-md shadow-slate-900/5 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/90 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <div className="flex min-w-0 flex-1 items-start gap-2 sm:items-center sm:gap-3">
                  {mode !== "trash" ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-10 shrink-0 text-amber-500 hover:bg-amber-100 hover:text-amber-600 dark:hover:bg-amber-950/50"
                      disabled={pendingId === row.id}
                      aria-label={
                        isFavorite(row)
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                      aria-pressed={isFavorite(row)}
                      onClick={() => void handleToggleFavorite(row)}
                    >
                      {pendingId === row.id ? (
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                      ) : (
                        <Star
                          className={cn(
                            "size-4",
                            isFavorite(row)
                              ? "fill-amber-400 text-amber-500"
                              : "text-slate-400 dark:text-slate-500",
                          )}
                          aria-hidden
                        />
                      )}
                    </Button>
                  ) : (
                    <span className="size-10 shrink-0" aria-hidden />
                  )}
                  <SiteFaviconImg siteLabel={row.site_name} />
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-medium text-slate-900 dark:text-slate-50">
                      {row.site_name}
                    </p>
                    <p className="truncate text-base text-slate-600 dark:text-slate-400">
                      {row.username}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  {mode === "trash" ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-emerald-300 text-emerald-800 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                        disabled={pendingId === row.id}
                        onClick={() => void handleRestore(row)}
                      >
                        <RotateCcw className="size-4" aria-hidden />
                        Restore
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
                        disabled={pendingId === row.id}
                        onClick={() => void handlePermanentDelete(row)}
                      >
                        <Trash2 className="size-4" aria-hidden />
                        Delete forever
                      </Button>
                    </>
                  ) : null}
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="bg-slate-200/90 text-slate-900 hover:bg-slate-300/90 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                    disabled={copyingId === row.id}
                    onClick={() => void handleCopyPassword(row)}
                  >
                    {copyingId === row.id ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                    ) : (
                      <Copy className="size-4" aria-hidden />
                    )}
                    Copy password
                  </Button>
                  {mode !== "trash" ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-10 shrink-0 text-slate-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                      disabled={pendingId === row.id}
                      aria-label={`Move ${row.site_name} to trash`}
                      onClick={() => void handleMoveToTrash(row)}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open);
          if (!open) resetAddForm();
        }}
      >
        <DialogContent
          className="flex max-h-[min(90dvh,640px)] max-w-md flex-col gap-0 overflow-hidden border-slate-300/80 p-0 sm:max-w-md dark:border-slate-700"
          showCloseButton
        >
          <div className="overflow-y-auto bg-gradient-to-b from-slate-50 to-slate-200/40 p-4 sm:p-6 dark:from-slate-950 dark:to-slate-900">
            <DialogHeader className="text-left">
              <DialogTitle className="text-slate-900 dark:text-slate-100">
                Add password
              </DialogTitle>
              <DialogDescription>
                The account password is encrypted locally with your master
                password before it is saved. Site icons use Google&apos;s public
                favicon service from the URL you enter.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => void handleAddPassword(e)}
              className="mt-4 space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="add-site">Site or URL</Label>
                <div className="flex items-center gap-3">
                  <SiteFaviconImg siteLabel={site} />
                  <Input
                    id="add-site"
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
                <Label htmlFor="add-username">Username</Label>
                <Input
                  id="add-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username or email"
                  required
                  autoComplete="off"
                  className="border-slate-300/80 text-base dark:border-slate-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-password">Password</Label>
                <Input
                  id="add-password"
                  type="password"
                  value={accountPassword}
                  onChange={(e) => setAccountPassword(e.target.value)}
                  placeholder="Account password"
                  required
                  autoComplete="new-password"
                  aria-describedby={strengthMeterDescId}
                  className="border-slate-300/80 text-base dark:border-slate-600"
                />
                <PasswordStrengthMeter
                  password={accountPassword}
                  id={strengthMeterDescId}
                />
              </div>
              {saveError ? (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {saveError}
                </p>
              ) : null}
              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="gap-2 bg-gradient-to-r from-slate-800 to-slate-950 text-white shadow-md hover:from-slate-700 hover:to-slate-900 dark:from-slate-700 dark:to-black"
                >
                  {saving ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                      Saving…
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={manualCopyOpen}
        onOpenChange={(open) => {
          setManualCopyOpen(open);
          if (!open) {
            setManualCopyValue("");
            setManualCopyLabel("");
          }
        }}
      >
        <DialogContent
          className="max-w-md border-slate-300/80 p-0 dark:border-slate-700"
          showCloseButton
        >
          <div className="space-y-4 bg-gradient-to-b from-slate-50 to-slate-200/40 p-4 sm:p-6 dark:from-slate-950 dark:to-slate-900">
            <DialogHeader className="text-left">
              <DialogTitle className="text-slate-900 dark:text-slate-100">
                Manual copy
              </DialogTitle>
              <DialogDescription>
                Clipboard is blocked on this device. Press and hold the password
                text to copy it manually.
                {manualCopyLabel ? ` (${manualCopyLabel})` : ""}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="manual-copy-password">Password</Label>
              <textarea
                id="manual-copy-password"
                value={manualCopyValue}
                readOnly
                rows={3}
                onFocus={(e) => e.currentTarget.select()}
                className="w-full rounded-lg border border-slate-300/80 bg-white/95 p-3 font-mono text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900/90 dark:text-slate-100"
              />
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setManualCopyOpen(false)}
              >
                Close
              </Button>
              <Button
                type="button"
                className="bg-gradient-to-r from-slate-800 to-slate-950 text-white hover:from-slate-700 hover:to-slate-900"
                onClick={() => void handleManualCopy()}
              >
                Try copy again
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
