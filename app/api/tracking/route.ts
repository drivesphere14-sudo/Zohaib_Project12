/**
 * app/api/tracking/route.ts
 *
 * GET /api/tracking — returns latest GPS coordinates from Firebase RTDB
 *
 * Used as a server-side fallback; the admin UI also subscribes directly
 * to Firebase from the browser for realtime updates.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getGPSOnce } from "@/lib/firebase/iot-service";

export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const gps = await getGPSOnce();

  if (!gps) {
    return NextResponse.json(
      { error: "No GPS data available" },
      { status: 404 }
    );
  }

  return NextResponse.json(gps);
}