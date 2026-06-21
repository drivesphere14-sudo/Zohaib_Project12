import { logEvent } from "firebase/analytics"
import { getFirebaseAnalytics, isFirebaseAvailable } from "./client"

export function trackIoTEvent(
  eventName: string,
  eventData: Record<string, any> = {}
) {
  if (!isFirebaseAvailable()) return

  const analytics = getFirebaseAnalytics()
  if (!analytics) return

  try {
    logEvent(analytics, eventName, {
      timestamp: new Date().toISOString(),
      ...eventData,
    })
  } catch (err) {
    console.error("Failed to log event:", err)
  }
}

export function trackCommandSent(vehicleId: string, command: string) {
  trackIoTEvent("iot_command_sent", { vehicleId, command })
}

export function trackCommandExecuted(
  vehicleId: string,
  command: string,
  status: string
) {
  trackIoTEvent("iot_command_executed", { vehicleId, command, status })
}

export function trackGPSUpdate(vehicleId: string, lat: number, lng: number) {
  trackIoTEvent("gps_update", { vehicleId, latitude: lat, longitude: lng })
}

export function trackDeviceOnline(vehicleId: string, isOnline: boolean) {
  trackIoTEvent("device_status", { vehicleId, isOnline })
}
