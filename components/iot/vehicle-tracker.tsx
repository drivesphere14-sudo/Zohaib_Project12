// components/iot/vehicle-tracker.tsx
"use client"

import { useEffect, useState } from "react"
import { onValue, ref, set } from "firebase/database"
import { db } from "@/lib/firebase"

// SAFETY: "Lock" writes button = 0, which should only stop the engine from
// STARTING. Wire the relay into the start-enable / immobilizer line so this can
// never cut a running engine.

function toNum(v: unknown): number | null {
  if (v === null || v === undefined) return null
  const n = typeof v === "string" ? parseFloat(v) : Number(v)
  return Number.isFinite(n) ? n : null
}

// Turn a stored firebase_url into a base path inside the database.
//   ""  or root URL                       -> ""        (reads /button, /lat, /lng)
//   ".../vehicle2" or "vehicle2"          -> "vehicle2" (reads /vehicle2/button, ...)
function basePathFrom(firebaseUrl?: string | null): string {
  if (!firebaseUrl) return ""
  try {
    return new URL(firebaseUrl).pathname.replace(/^\/+|\/+$/g, "")
  } catch {
    return firebaseUrl.replace(/^\/+|\/+$/g, "")
  }
}

export function VehicleTracker({
  name = "Vehicle",
  firebaseUrl,
}: {
  name?: string
  firebaseUrl?: string | null
}) {
  const base = basePathFrom(firebaseUrl)
  const path = (key: string) => (base ? `${base}/${key}` : key)

  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [relay, setRelay] = useState<number | null>(null)
  const [working, setWorking] = useState(false)

  // Subscribe to Firebase immediately — no login required.
  useEffect(() => {
    const unsubLat = onValue(ref(db, path("lat")), (s) => setLat(toNum(s.val())))
    const unsubLng = onValue(ref(db, path("lng")), (s) => setLng(toNum(s.val())))
    const unsubBtn = onValue(ref(db, path("button")), (s) => setRelay(toNum(s.val())))
    return () => { unsubLat(); unsubLng(); unsubBtn() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base])

  async function setRelayValue(state: 0 | 1) {
    setWorking(true)
    try {
      await set(ref(db, path("button")), state)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to send command")
    } finally {
      setWorking(false)
    }
  }

  const isOn = relay === 1
  const hasFix = lat != null && lng != null && lat !== 0 && lng !== 0

  return (
    <div className="max-w-md space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{name} (live)</h3>
      </div>

      <div className="text-sm">
        Engine relay:{" "}
        <span className={isOn ? "text-green-700 font-medium" : "text-red-700 font-medium"}>
          {relay === null ? "unknown" : isOn ? "UNLOCKED (1)" : "LOCKED (0)"}
        </span>
      </div>

      <div className="text-sm text-muted-foreground">
        Lat: {lat ?? "—"} · Lng: {lng ?? "—"}
        {!hasFix && " (waiting for GPS fix…)"}
      </div>

      {hasFix && (
        <iframe
          title={`map-${name}`}
          className="h-56 w-full rounded border"
          loading="lazy"
          src={`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
        />
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setRelayValue(1)}
          disabled={working || isOn}
          className="rounded bg-green-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
        >
          Unlock
        </button>
        <button
          onClick={() => setRelayValue(0)}
          disabled={working || relay === 0}
          className="rounded bg-red-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
        >
          Lock
        </button>
      </div>
    </div>
  )
}