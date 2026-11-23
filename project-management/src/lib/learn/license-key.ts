/*
 * Teaching copy of MENO's license-key format (docs/architecture/LICENSING.md §3).
 * MENO-XXXXX-XXXXX-XXXXX-XXXXX: 19 random Crockford Base32 characters + 1 Luhn mod-32 check character.
 * The real generator lives in the backend (SecureRandom); this one exists so developers can see it work.
 */
export const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford: no I, L, O, U
const N = ALPHABET.length; // 32
const BODY = 19;

/** Luhn mod-N check character for `body` (classic Luhn, generalised to a 32-symbol alphabet). */
export function checkChar(body: string): string {
  let factor = 2;
  let sum = 0;
  for (let i = body.length - 1; i >= 0; i--) {
    let addend = factor * ALPHABET.indexOf(body[i]);
    factor = factor === 2 ? 1 : 2;
    addend = Math.floor(addend / N) + (addend % N);
    sum += addend;
  }
  return ALPHABET[(N - (sum % N)) % N];
}

/** 95 random bits from the browser CSPRNG (256 is a multiple of 32, so `& 31` stays uniform). */
export function generateKey(): string {
  const bytes = new Uint8Array(BODY);
  crypto.getRandomValues(bytes);
  const body = Array.from(bytes, (b) => ALPHABET[b & 31]).join("");
  return format(body + checkChar(body));
}

export function format(chars20: string): string {
  return `MENO-${chars20.match(/.{1,5}/g)!.join("-")}`;
}

/** Upper-case, drop spaces/hyphens and the MENO prefix, read I/L as 1 and O as 0. */
export function normalise(input: string): string {
  return input
    .toUpperCase()
    .replace(/[\s-]/g, "")
    .replace(/^MENO/, "")
    .replace(/[IL]/g, "1")
    .replace(/O/g, "0");
}

export type KeyCheck = { ok: true; normalised: string; last4: string } | { ok: false; reason: string };

/** What the activation form checks before any network call. */
export function checkKey(input: string): KeyCheck {
  const k = normalise(input);
  if (!k) return { ok: false, reason: "Enter a license key." };
  if (k.length !== BODY + 1) return { ok: false, reason: `A key has 20 characters after MENO; this one has ${k.length}.` };
  const bad = [...k].find((c) => !ALPHABET.includes(c));
  if (bad) return { ok: false, reason: `“${bad}” can’t appear in a key.` };
  if (checkChar(k.slice(0, BODY)) !== k[BODY]) return { ok: false, reason: "That key has a typing mistake (the check character doesn’t match)." };
  return { ok: true, normalised: format(k), last4: k.slice(-4) };
}
