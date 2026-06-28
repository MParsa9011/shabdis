import { toEnglishDigits } from "@/lib/utils";

/**
 * Normalize an Iranian mobile number to the canonical 09XXXXXXXXX form.
 * Accepts Persian/Arabic digits and +98 / 0098 / 98 / 9... prefixes.
 * Returns null if it isn't a valid Iranian mobile number.
 */
export function normalizePhone(input: string): string | null {
  let d = toEnglishDigits(String(input || "")).replace(/[^\d+]/g, "");
  if (d.startsWith("+98")) d = "0" + d.slice(3);
  else if (d.startsWith("0098")) d = "0" + d.slice(4);
  else if (d.startsWith("98") && d.length === 12) d = "0" + d.slice(2);
  else if (/^9\d{9}$/.test(d)) d = "0" + d;
  return /^09\d{9}$/.test(d) ? d : null;
}

// 5-digit numeric OTP.
export function generateOtp(): string {
  return String(Math.floor(10000 + Math.random() * 90000));
}
