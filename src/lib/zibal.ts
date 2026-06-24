const MERCHANT = process.env.ZIBAL_MERCHANT ?? "zibal";
const BASE = "https://gateway.zibal.ir/v1";

export async function requestPayment(
  amount: number,
  orderId: string,
  callbackUrl: string,
  description?: string
) {
  const res = await fetch(`${BASE}/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      merchant: MERCHANT,
      amount: amount * 10,
      orderId,
      callbackUrl,
      description: description ?? "پرداخت سفارش تبرجین",
    }),
  });
  const data = await res.json();
  return data as { result: number; trackId?: string; message?: string };
}

export function getPaymentUrl(trackId: string) {
  return `https://gateway.zibal.ir/start/${trackId}`;
}

export async function verifyPayment(trackId: string) {
  const res = await fetch(`${BASE}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ merchant: MERCHANT, trackId }),
  });
  const data = await res.json();
  return data as {
    result: number;
    refNumber?: string;
    paidAt?: string;
    amount?: number;
    message?: string;
  };
}
