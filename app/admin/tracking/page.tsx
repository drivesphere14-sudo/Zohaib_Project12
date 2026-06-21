"use client"

import { Button } from "@/components/ui/button"
import { Wifi, WifiOff, RefreshCw } from "lucide-react"
import { useState } from "react"
import { FirebaseLiveTracker } from "@/components/admin/firebase-live-tracker"

export default function AdminTrackingPage() {
  const [live, setLive] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  // Go Live / Refresh now just drive the visible timestamp + indicator.
  // The Firebase tracker streams its own real-time data independently.
  const handleRefresh = () => setLastRefresh(new Date())

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Fleet GPS Tracking</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live location monitoring for all GPS-equipped vehicles
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {lastRefresh && <span className="text-xs text-muted-foreground">Updated: {lastRefresh.toLocaleTimeString()}</span>}
          <Button size="sm" variant="outline" onClick={handleRefresh} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button size="sm" variant={live ? "destructive" : "default"} onClick={() => setLive(!live)} className="flex items-center gap-2">
            {live ? <><WifiOff className="h-4 w-4" /> Stop Live</> : <><Wifi className="h-4 w-4" /> Go Live</>}
          </Button>
          {live && (
            <span className="flex items-center gap-1.5 text-xs text-green-400">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" /> Live
            </span>
          )}
        </div>
      </div>

      {/* Live IoT tracking straight from Firebase (the hardware device) */}
      <FirebaseLiveTracker />
    </div>
  )
}