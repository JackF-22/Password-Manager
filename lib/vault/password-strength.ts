/** Heuristic strength 0 (weak) – 4 (strong). Not a substitute for breach checks. */
export function scorePasswordStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  const len = password.length;
  if (len >= 8) score++;
  if (len >= 12) score++;
  if (len >= 16) score++;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);
  const classes = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean)
    .length;
  if (classes >= 2) score++;
  if (classes >= 4 && len >= 10) score++;
  return Math.min(4, score);
}

export function strengthLabel(score: number): string {
  switch (score) {
    case 0:
      return "Very weak";
    case 1:
      return "Weak";
    case 2:
      return "Fair";
    case 3:
      return "Good";
    case 4:
      return "Strong";
    default:
      return "";
  }
}

export function strengthBarColor(score: number): string {
  switch (score) {
    case 0:
      return "bg-red-500";
    case 1:
      return "bg-orange-500";
    case 2:
      return "bg-amber-500";
    case 3:
      return "bg-lime-500";
    case 4:
      return "bg-emerald-500";
    default:
      return "bg-zinc-300 dark:bg-zinc-600";
  }
}
