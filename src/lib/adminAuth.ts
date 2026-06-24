import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session?.user || role !== "ADMIN") {
    return { error: NextResponse.json({ error: "forbidden" }, { status: 403 }), session: null };
  }
  return { error: null, session };
}
