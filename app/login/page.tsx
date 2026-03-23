import { Suspense } from "react";
import { Shield } from "lucide-react";
import { LoginForm } from "@/components/login-form";

function LoginFallback() {
  return (
    <div className="flex h-[26rem] w-full items-center justify-center rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl lg:h-[28rem]">
      <p className="text-sm text-slate-400">Loading…</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-dvh w-full min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto bg-slate-950">
      <div
        className="pointer-events-none absolute inset-0 bg-size-[72px_72px] bg-[linear-gradient(rgba(59,130,246,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.06)_1px,transparent_1px)] sm:bg-size-[80px_80px] lg:bg-size-[96px_96px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-blue-600/35 blur-[120px] lg:h-[36rem] lg:w-[36rem]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-48 -right-40 h-[32rem] w-[32rem] rounded-full bg-cyan-500/25 blur-[120px] lg:bottom-0 lg:h-[40rem] lg:w-[40rem]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-[12%] h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[100px] lg:left-[28%] lg:top-1/3 lg:h-96 lg:w-96"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-dvh w-full min-w-0 flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 py-10 sm:px-8 md:px-10 lg:flex-row lg:items-center lg:justify-between lg:gap-x-14 lg:px-12 lg:py-16 xl:max-w-[1280px] xl:gap-x-20 xl:px-16 2xl:max-w-[1400px] 2xl:px-20">
          <header className="mb-10 text-center lg:mb-0 lg:flex-1 lg:max-w-xl lg:py-4 lg:text-left xl:max-w-2xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-400 shadow-xl shadow-blue-600/35 ring-1 ring-white/20 lg:mx-0 lg:mb-6 lg:h-20 lg:w-20 xl:h-24 xl:w-24">
              <Shield
                className="size-8 text-white drop-shadow-sm lg:size-10 xl:size-11"
                aria-hidden
              />
            </div>
            <h1 className="text-balance bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-4xl lg:text-5xl lg:leading-tight xl:text-6xl">
              Password Vault
            </h1>
            <p className="mx-auto mt-3 max-w-md text-pretty text-sm leading-relaxed text-slate-400 sm:mt-4 sm:text-base lg:mx-0 lg:mt-5 lg:max-w-lg lg:text-lg xl:text-xl xl:leading-relaxed">
              Zero-knowledge encryption — your master password and decrypted
              secrets never leave your device.
            </p>
            <ul className="mx-auto mt-6 hidden max-w-md list-none space-y-2 text-left text-sm text-slate-500 lg:mx-0 lg:block xl:mt-8 xl:text-base">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-cyan-400" />
                Client-side AES-256-GCM encryption before anything hits the
                network
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-blue-400" />
                Keys derived with PBKDF2 — we never see your master password
              </li>
            </ul>
          </header>

          <div className="flex w-full shrink-0 justify-center lg:w-auto lg:max-w-none lg:justify-end xl:pr-2">
            <div className="w-full max-w-md lg:w-[min(100%,28rem)] xl:w-[30rem]">
              <Suspense fallback={<LoginFallback />}>
                <LoginForm />
              </Suspense>
            </div>
          </div>
        </div>

        <p className="shrink-0 px-4 pb-8 pt-2 text-center text-xs text-slate-600 sm:text-sm lg:pb-10">
          Protected with AES-256-GCM · PBKDF2 key derivation
        </p>
      </div>
    </div>
  );
}
