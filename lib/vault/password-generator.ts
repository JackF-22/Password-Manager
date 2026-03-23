const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWER = "abcdefghijkmnopqrstuvwxyz";
const DIGITS = "23456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.?";

export type PasswordGenerationOptions = {
  length?: number;
  includeUppercase?: boolean;
  includeLowercase?: boolean;
  includeNumbers?: boolean;
  includeSpecial?: boolean;
};

function randomIndex(max: number): number {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return values[0] % max;
}

function pick(chars: string): string {
  return chars[randomIndex(chars.length)];
}

function shuffle(parts: string[]): string[] {
  const out = [...parts];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = randomIndex(i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function generateStrongPassword(
  options: PasswordGenerationOptions = {},
): string {
  const {
    length = 24,
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSpecial = true,
  } = options;
  const safeLength = Math.max(8, Math.min(24, length));
  const pools: string[] = [];
  if (includeUppercase) pools.push(UPPER);
  if (includeLowercase) pools.push(LOWER);
  if (includeNumbers) pools.push(DIGITS);
  if (includeSpecial) pools.push(SYMBOLS);

  const activePools = pools.length > 0 ? pools : [LOWER];
  const all = activePools.join("");
  const chars: string[] = activePools.map((pool) => pick(pool));

  while (chars.length < safeLength) {
    chars.push(pick(all));
  }

  return shuffle(chars).join("");
}
