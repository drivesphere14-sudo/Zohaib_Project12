/**
 * app/api/iot/route.ts
 *
 * POST /api/iot   — set relay state
 * GET  /api/iot   — read current relay + GPS snapshot
 *
 * Body (POST): { "relay": "1" | "0" }
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { setRelay, getRelayState, getGPSOnce } from "@/lib/firebase/iot-service";

// ── GET — read current IoT state snapshot ────────────────────────────────────
export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const [relay, gps] = await Promise.all([getRelayState(), getGPSOnce()]);

  return NextResponse.json({ relay, gps });
}

// ── POST — set relay ──────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const body = await req.json().catch(() => null);
  const relay = body?.relay;

  if (relay !== "1" && relay !== "0") {
    return NextResponse.json(
      { error: 'relay must be "1" or "0"' },
      { status: 400 }
    );
  }

  await setRelay(relay);

  return NextResponse.json({ success: true, relay });
}