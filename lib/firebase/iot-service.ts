/**
 * Firebase IoT Service
 *
 * Matches the exact Firebase DB structure written by the ESP32:
 *   /lat    → string  (latitude,  e.g. "31.5204000")
 *   /lng    → string  (longitude, e.g. "74.3587000")
 *   /button → string  ("1" = relay ON, "0" = relay OFF)
 *
 * No structural changes to Firebase — only reads and writes to these paths.
 */

import { database } from "./client";
import { ref, onValue, set, get, off, type DatabaseReference } from "firebase/database";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GPSCoordinates {
  lat: number;
  lng: number;
  updatedAt: number; // epoch ms from local time when data arrived
}

export type RelayState = "1" | "0";

export interface VehicleIoTState {
  gps: GPSCoordinates | null;
  relay: RelayState;
  isOnline: boolean; // true if last GPS update < 30 s ago
}

// ─── GPS ──────────────────────────────────────────────────────────────────────

/**
 * Subscribe to live GPS updates.
 * The ESP32 writes /lat and /lng every ~10 seconds as strings.
 * We listen to both paths and merge them into one GPSCoordinates object.
 *
 * Returns an unsubscribe function — call it in your useEffect cleanup.
 */
export function subscribeToGPS(
  callback: (coords: GPSCoordinates | null) => void
): () => void {
  let latValue: string | null = null;
  let lngValue: string | null = null;

  const latRef: DatabaseReference = ref(database, "/lat");
  const lngRef: DatabaseReference = ref(database, "/lng");

  const tryEmit = () => {
    if (latValue === null || lngValue === null) return;
    const lat = parseFloat(latValue);
    const lng = parseFloat(lngValue);
    if (isNaN(lat) || isNaN(lng)) {
      callback(null);
      return;
    }
    callback({ lat, lng, updatedAt: Date.now() });
  };

  onValue(latRef, (snap) => {
    latValue = snap.val() ?? null;
    tryEmit();
  });

  onValue(lngRef, (snap) => {
    lngValue = snap.val() ?? null;
    tryEmit();
  });

  // Cleanup: detach both listeners
  return () => {
    off(latRef);
    off(lngRef);
  };
}

/**
 * One-shot read of current GPS position (no realtime subscription).
 */
export async function getGPSOnce(): Promise<GPSCoordinates | null> {
  const [latSnap, lngSnap] = await Promise.all([
    get(ref(database, "/lat")),
    get(ref(database, "/lng")),
  ]);

  const lat = parseFloat(latSnap.val() ?? "");
  const lng = parseFloat(lngSnap.val() ?? "");

  if (isNaN(lat) || isNaN(lng)) return null;
  return { lat, lng, updatedAt: Date.now() };
}

// ─── Relay ────────────────────────────────────────────────────────────────────

/**
 * Write relay state to /button.
 * Hardware reads this every 100 ms and sets GPIO accordingly.
 *   "1" → relay ON  (engine enabled)
 *   "0" → relay OFF (engine disabled / immobilised)
 */
export async function setRelay(state: RelayState): Promise<void> {
  await set(ref(database, "/button"), state);
}

export async function getRelayState(): Promise<RelayState> {
  const snap = await get(ref(database, "/button"));
  const val = snap.val();
  return val === "1" ? "1" : "0";
}

/**
 * Subscribe to relay state changes in realtime.
 * Returns an unsubscribe function.
 */
export function subscribeToRelay(
  callback: (state: RelayState) => void
): () => void {
  const relayRef = ref(database, "/button");
  onValue(relayRef, (snap) => {
    callback(snap.val() === "1" ? "1" : "0");
  });
  return () => off(relayRef);
}

// ─── Combined vehicle state ───────────────────────────────────────────────────

const ONLINE_THRESHOLD_MS = 30_000; // 30 s — ESP32 sends every 10 s

export function subscribeToVehicleState(
  callback: (state: VehicleIoTState) => void
): () => void {
  let gps: GPSCoordinates | null = null;
  let relay: RelayState = "0";

  const emit = () =>
    callback({
      gps,
      relay,
      isOnline: gps !== null && Date.now() - gps.updatedAt < ONLINE_THRESHOLD_MS,
    });

  const unsubGPS = subscribeToGPS((coords) => {
    gps = coords;
    emit();
  });

  const unsubRelay = subscribeToRelay((state) => {
    relay = state;
    emit();
  });

  return () => {
    unsubGPS();
    unsubRelay();
  };
}