// Lightweight, dependency-free user-agent + referrer parsing for analytics.

export function parseDevice(ua: string): string {
  const s = ua.toLowerCase();
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/.test(s)) return "تبلت";
  if (/mobi|iphone|ipod|android.*mobile|windows phone|blackberry/.test(s)) return "موبایل";
  if (!s) return "نامشخص";
  return "دسکتاپ";
}

export function parseBrowser(ua: string): string {
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\/|Opera/.test(ua)) return "Opera";
  if (/SamsungBrowser/.test(ua)) return "Samsung";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) return "Chrome";
  if (/Chromium/.test(ua)) return "Chromium";
  if (/Safari\//.test(ua) && /Version\//.test(ua)) return "Safari";
  if (/MSIE|Trident/.test(ua)) return "Internet Explorer";
  if (!ua) return "نامشخص";
  return "سایر";
}

export function parseOS(ua: string): string {
  if (/Windows NT/.test(ua)) return "Windows";
  if (/Android/.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
  if (/Mac OS X/.test(ua)) return "macOS";
  if (/Linux/.test(ua)) return "Linux";
  if (!ua) return "نامشخص";
  return "سایر";
}

// Classify a referrer URL into a friendly traffic source.
export function classifySource(referrer: string | null | undefined, host: string): { referrer: string | null; source: string } {
  if (!referrer) return { referrer: null, source: "مستقیم" };
  let refHost = "";
  try {
    refHost = new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return { referrer, source: "نامشخص" };
  }
  // Internal navigation
  if (host && refHost && refHost === host.replace(/^www\./, "")) {
    return { referrer: null, source: "مستقیم" };
  }
  const map: Record<string, string> = {
    "google.com": "گوگل",
    "google.ir": "گوگل",
    "bing.com": "بینگ",
    "duckduckgo.com": "DuckDuckGo",
    "yahoo.com": "یاهو",
    "instagram.com": "اینستاگرام",
    "l.instagram.com": "اینستاگرام",
    "t.co": "توییتر / X",
    "x.com": "توییتر / X",
    "twitter.com": "توییتر / X",
    "t.me": "تلگرام",
    "telegram.org": "تلگرام",
    "facebook.com": "فیسبوک",
    "l.facebook.com": "فیسبوک",
    "youtube.com": "یوتیوب",
    "linkedin.com": "لینکدین",
    "pinterest.com": "پینترست",
    "aparat.com": "آپارات",
  };
  for (const key of Object.keys(map)) {
    if (refHost === key || refHost.endsWith("." + key)) return { referrer: refHost, source: map[key] };
  }
  return { referrer: refHost, source: refHost };
}

type GeoResult = { country: string | null; city: string | null };

// Best-effort IP geolocation via ip-api.com (free, no key). Returns nulls on failure.
export async function geoLookup(ip: string | null): Promise<GeoResult> {
  if (!ip) return { country: null, city: null };
  // Skip private / local addresses
  if (
    ip === "::1" ||
    ip.startsWith("127.") ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip)
  ) {
    return { country: "محلی", city: "localhost" };
  }
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,city&lang=fa`,
      { signal: controller.signal }
    );
    clearTimeout(timer);
    if (!res.ok) return { country: null, city: null };
    const data = (await res.json()) as { status: string; country?: string; city?: string };
    if (data.status !== "success") return { country: null, city: null };
    return { country: data.country ?? null, city: data.city ?? null };
  } catch {
    return { country: null, city: null };
  }
}

export function getClientIp(headers: Headers): string | null {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return headers.get("x-real-ip");
}
