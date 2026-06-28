/**
 * Send an OTP using Melipayamak's console OTP service.
 *
 * Endpoint: POST https://console.melipayamak.com/api/send/otp/{key}  body: { to }
 * Melipayamak generates the code itself and returns it in the response, e.g.
 *   { "code": "12345", "status": "ارسال موفق بود" }
 *
 * Configure with env `MELIPAYAMAK_OTP_KEY`. If it isn't set (or, in development,
 * the request fails — e.g. no internet) a local code is generated and logged so
 * the OTP flow stays testable.
 *
 * Returns the code to store for verification, or null on failure (in production).
 */
function devCode(phone: string): string {
  const code = String(Math.floor(10000 + Math.random() * 90000));
  console.log(`[OTP][dev] کد ورود برای ${phone}: ${code}`);
  return code;
}

export async function sendOtp(phone: string): Promise<string | null> {
  const key = process.env.MELIPAYAMAK_OTP_KEY;
  if (!key) return devCode(phone);

  try {
    const res = await fetch(`https://console.melipayamak.com/api/send/otp/${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: phone }),
    });
    const data = (await res.json().catch(() => null)) as { code?: string | number; Code?: string | number } | null;
    const code = data?.code ?? data?.Code;
    if (code != null && String(code).trim()) return String(code).trim();

    console.error("Melipayamak OTP unexpected response:", data);
    return process.env.NODE_ENV !== "production" ? devCode(phone) : null;
  } catch (e) {
    console.error("Melipayamak OTP error:", e);
    return process.env.NODE_ENV !== "production" ? devCode(phone) : null;
  }
}
