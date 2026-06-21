"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { getDatabase, ref, onValue } from "firebase/database"
import { getFirebaseApp } from "@/lib/firebase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation } from "lucide-react"

type TrackedVehicle = { id: string; name: string; firebase_url: string }

// firebase_url -> DB path ("" = root; ".../vehicle2" -> "vehicle2")
function resolvePath(url: string): string {
  if (!url) return ""
  try {
    return new URL(url).pathname.replace(/^\/+|\/+$/g, "")
  } catch {
    return url.replace(/^\/+|\/+$/g, "")
  }
}

export function FirebaseLiveTracker() {
  const supabase = createClient()
  const [vehicles, setVehicles] = useState<TrackedVehicle[]>([])
  const [selected, setSelected] = useState<TrackedVehicle | null>(null)
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [connected, setConnected] = useState(false)

  // 1) Load vehicles that have a Firebase URL.
  useEffect(() => {
    supabase
      .from("vehicles")
      .select("id, name, firebase_url")
      .not("firebase_url", "is", null)
      .then(({ data }) => {
        if (data && data.length) {
          setVehicles(data as TrackedVehicle[])
          setSelected(data[0] as TrackedVehicle)
        }
      })
  }, [supabase])

  // 2) Subscribe to the selected vehicle's live location in Firebase.
  useEffect(() => {
    if (!selected) return
    const db = getDatabase(getFirebaseApp())
    const path = resolvePath(selected.firebase_url)
    const baseRef = path ? ref(db, path) : ref(db)
    const unsub = onValue(
      baseRef,
      (snap) => {
        const v = snap.val() || {}
        const la = v.lat != null ? parseFloat(String(v.lat)) : null
        const ln = v.lng != null ? parseFloat(String(v.lng)) : null
        setLat(Number.isFinite(la as number) ? (la as number) : null)
        setLng(Number.isFinite(ln as number) ? (ln as number) : null)
        setConnected(true)
      },
      () => setConnected(false)
    )
    return () => unsub()
  }, [selected])

  const hasFix = lat != null && lng != null && lat !== 0 && lng !== 0
  const mapSrc = hasFix
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${lng! - 0.02}%2C${lat! - 0.02}%2C${lng! + 0.02}%2C${lat! + 0.02}&layer=mapnik&marker=${lat}%2C${lng}`
    : null

  if (vehicles.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="font-serif text-lg font-bold text-foreground">
          Live IoT Tracking (Firebase)
        </h2>
        <p className="text-sm text-muted-foreground">
          Real-time location from the vehicle&apos;s GPS device.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Vehicle picker */}
        <div className="flex flex-col gap-3 lg:col-span-1">
          {vehicles.map((v) => (
            <Card
              key={v.id}
              className={`cursor-pointer transition-all hover:border-primary/50 ${selected?.id === v.id ? "border-primary" : ""}`}
              onClick={() => setSelected(v)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <p className="font-semibold text-sm text-card-foreground">{v.name}</p>
                  <Badge variant={connected && selected?.id === v.id ? "default" : "secondary"} className="text-xs">
                    {selected?.id === v.id ? (connected ? "Connected" : "Connecting") : "—"}
                  </Badge>
                </div>
                {selected?.id === v.id && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground font-mono">
                    <Navigation className="h-3 w-3" />
                    {hasFix ? `${lat!.toFixed(5)}, ${lng!.toFixed(5)}` : "waiting for GPS fix…"}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Map */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {selected?.name || "Select a vehicle"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mapSrc ? (
                <>
                  <div className="h-96 rounded-lg overflow-hidden border border-border">
                    <iframe key={mapSrc} title="IoT GPS Map" width="100%" height="100%" style={{ border: 0 }} src={mapSrc} />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-secondary p-3">
                      <p className="text-xs text-muted-foreground">Latitude</p>
                      <p className="text-sm font-mono font-semibold">{lat!.toFixed(6)}</p>
                    </div>
                    <div className="rounded-lg bg-secondary p-3">
                      <p className="text-xs text-muted-foreground">Longitude</p>
                      <p className="text-sm font-mono font-semibold">{lng!.toFixed(6)}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex h-96 items-center justify-center text-center text-muted-foreground text-sm">
                  Waiting for a GPS fix. Coordinates are 0 until the device locks onto satellites
                  (try it outdoors), or set test lat/lng in Firebase.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}