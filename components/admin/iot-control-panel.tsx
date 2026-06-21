"use client";

/**
 * components/admin/iot-control-panel.tsx
 *
 * Admin component that:
 *  1. Subscribes to /lat and /lng from Firebase RTDB (live, every ~10 s)
 *  2. Subscribes to /button (relay state) from Firebase RTDB
 *  3. Lets admin toggle relay by writing "1" or "0" to /button via API route
 *
 * No changes to Firebase DB structure — matches ESP32 paths exactly.
 */

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  subscribeToVehicleState,
  type VehicleIoTState,
  type RelayState,
} from "@/lib/firebase/iot-service";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCoord(n: number, decimals = 6) {
  return n.toFixed(decimals);
}

function timeSince(ms: number): string {
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 60) return `${s}s ago`;
  return `${Math.floor(s / 60)}m ${s % 60}s ago`;
}

// ─── Map embed (OpenStreetMap iframe — no API key needed) ──────────────────────

function LiveMap({ lat, lng }: { lat: number; lng: number }) {
  const zoom = 15;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.005},${lat - 0.005},${lng + 0.005},${lat + 0.005}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <div className="w-full rounded-lg overflow-hidden border border-border shadow-inner">
      <iframe
        title="Vehicle Location"
        src={src}
        width="100%"
        height="320"
        style={{ border: 0 }}
        loading="lazy"
      />
      <div className="flex items-center justify-between px-3 py-2 bg-muted text-xs text-muted-foreground">
        <span>
          {formatCoord(lat)}°N, {formatCoord(lng)}°E
        </span>
        <a
          href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          Open in Maps ↗
        </a>
      </div>
    </div>
  );
}

// ─── Relay toggle ─────────────────────────────────────────────────────────────

function RelayControl({
  current,
  onToggle,
  loading,
}: {
  current: RelayState;
  onToggle: (next: RelayState) => void;
  loading: boolean;
}) {
  const isOn = current === "1";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Engine Relay</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Controls vehicle immobiliser via GPIO relay
          </p>
        </div>
        <Badge
          variant={isOn ? "default" : "secondary"}
          className={isOn ? "bg-green-600 text-white" : "bg-red-100 text-red-700"}
        >
          {isOn ? "ON — Enabled" : "OFF — Immobilised"}
        </Badge>
      </div>

      <div className="flex gap-3">
        <Button
          variant={isOn ? "outline" : "default"}
          className="flex-1"
          disabled={isOn || loading}
          onClick={() => onToggle("1")}
        >
          {loading && !isOn ? "Updating…" : "Enable Engine"}
        </Button>
        <Button
          variant={!isOn ? "outline" : "destructive"}
          className="flex-1"
          disabled={!isOn || loading}
          onClick={() => onToggle("0")}
        >
          {loading && isOn ? "Updating…" : "Immobilise Vehicle"}
        </Button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function IoTControlPanel() {
  const [state, setState] = useState<VehicleIoTState>({
    gps: null,
    relay: "0",
    isOnline: false,
  });
  const [relayLoading, setRelayLoading] = useState(false);
  const [relayError, setRelayError] = useState<string | null>(null);
  const [tick, setTick] = useState(0); // forces "X ago" re-render every second

  // Subscribe to Firebase RTDB directly from the browser
  useEffect(() => {
    const unsub = subscribeToVehicleState(setState);
    return unsub;
  }, []);

  // Tick every second so "last updated X ago" stays fresh
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const handleRelayToggle = useCallback(async (next: RelayState) => {
    setRelayLoading(true);
    setRelayError(null);
    try {
      const res = await fetch("/api/iot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ relay: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Request failed");
      }
    } catch (err: unknown) {
      setRelayError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setRelayLoading(false);
    }
  }, []);

  const { gps, relay, isOnline } = state;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* ── GPS Card ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Live GPS Tracking</CardTitle>
            <Badge
              variant="outline"
              className={
                isOnline
                  ? "border-green-500 text-green-600"
                  : "border-muted text-muted-foreground"
              }
            >
              <span
                className={`mr-1.5 inline-block h-2 w-2 rounded-full ${
                  isOnline ? "bg-green-500 animate-pulse" : "bg-gray-400"
                }`}
              />
              {isOnline ? "Online" : "Offline"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {gps ? (
            <>
              <LiveMap lat={gps.lat} lng={gps.lng} />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md bg-muted px-3 py-2">
                  <p className="text-xs text-muted-foreground mb-0.5">Latitude</p>
                  <p className="font-mono font-medium">{formatCoord(gps.lat)}</p>
                </div>
                <div className="rounded-md bg-muted px-3 py-2">
                  <p className="text-xs text-muted-foreground mb-0.5">Longitude</p>
                  <p className="font-mono font-medium">{formatCoord(gps.lng)}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-right">
                Last update: {timeSince(gps.updatedAt)}
              </p>
            </>
          ) : (
            <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed text-center text-muted-foreground">
              <svg
                className="mb-2 h-8 w-8 opacity-40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"
                />
              </svg>
              <p className="text-sm">Waiting for GPS signal…</p>
              <p className="text-xs mt-1 opacity-60">
                ESP32 sends updates every 10 seconds
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Relay / Control Card ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Vehicle Control</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <RelayControl
            current={relay}
            onToggle={handleRelayToggle}
            loading={relayLoading}
          />

          {relayError && (
            <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">
              {relayError}
            </p>
          )}

          <Separator />

          {/* Status summary */}
          <div className="space-y-2 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Firebase Paths
            </p>
            <div className="rounded-md border divide-y text-xs font-mono">
              {[
                { path: "/lat", value: gps ? formatCoord(gps.lat) : "—" },
                { path: "/lng", value: gps ? formatCoord(gps.lng) : "—" },
                {
                  path: "/button",
                  value: relay,
                  highlight: relay === "1" ? "text-green-600" : "text-red-600",
                },
              ].map(({ path, value, highlight }) => (
                <div
                  key={path}
                  className="flex items-center justify-between px-3 py-1.5"
                >
                  <span className="text-muted-foreground">{path}</span>
                  <span className={highlight ?? ""}>{value}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              These match the exact paths written and read by the ESP32 firmware.
              No structural changes were made.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}