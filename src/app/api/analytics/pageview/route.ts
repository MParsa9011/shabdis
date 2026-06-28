import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import {
  parseDevice,
  parseBrowser,
  parseOS,
  classifySource,
  geoLookup,
  getClientIp,
} from "@/lib/analytics";

const VISITOR_COOKIE = "vid";
const ONE_YEAR = 60 * 60 * 24 * 365;

export async function POST(req: NextRequest) {
  try {
    const { path, referrer } = await req.json();
    if (!path || typeof path !== "string") {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // Anonymous visitor id (cookie) used to count unique visitors.
    let visitorId = req.cookies.get(VISITOR_COOKIE)?.value;
    let isNewVisitor = false;
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      isNewVisitor = true;
    }

    const ua = req.headers.get("user-agent") ?? "";
    const host = req.headers.get("host") ?? "";
    const ip = getClientIp(req.headers);

    const { referrer: refHost, source } = classifySource(referrer, host);
    const { country, city } = await geoLookup(ip);

    await prisma.pageView.create({
      data: {
        path,
        visitorId,
        referrer: refHost,
        source,
        device: parseDevice(ua),
        browser: parseBrowser(ua),
        os: parseOS(ua),
        country,
        city,
      },
    });

    const res = NextResponse.json({ ok: true });
    if (isNewVisitor) {
      res.cookies.set(VISITOR_COOKIE, visitorId, {
        maxAge: ONE_YEAR,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
    }
    return res;
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
