"use client";

import { useMemo } from "react";
import {
  scorePasswordStrength,
  strengthBarColor,
  strengthLabel,
} from "@/lib/vault/password-strength";

type Props = {
  password: string;
  id?: string;
};

export function PasswordStrengthMeter({ password, id }: Props) {
  const score = useMemo(() => scorePasswordStrength(password), [password]);
  const label = strengthLabel(score);
  const activeColor = strengthBarColor(score);

  return (
    <div className="space-y-2" aria-live="polite">
      <div className="flex items-center justify-between gap-2">
        <span id={id} className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Password strength
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-500">{label}</span>
      </div>
      <div
        className="flex h-1.5 gap-1"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={score}
        aria-valuetext={label}
        aria-labelledby={id}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-full flex-1 rounded-full transition-colors ${
              i < score ? activeColor : "bg-zinc-200 dark:bg-zinc-700"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
