'use client'

import { useEffect, useState } from 'react'
import { getDatabase, ref, onValue, set } from 'firebase/database'
import { getFirebaseApp } from '@/lib/firebase/client'
import { AlertCircle, CheckCircle2, MapPin, Power } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface VehicleData {
  button?: string | number
  lat?: string | number
  lng?: string | number
  [key: string]: any
}

interface FirebaseVehicleMonitorProps {
  firebaseUrl: string
  vehicleId: string
}

// A firebase_url is a full URL, but ref() needs a PATH inside the database.
//   root URL (no sub-path)        -> ""        -> use the database root
//   ".../vehicle2" or "vehicle2"  -> "vehicle2" -> use that node
function resolvePath(firebaseUrl: string): string {
  if (!firebaseUrl) return ''
  try {
    return new URL(firebaseUrl).pathname.replace(/^\/+|\/+$/g, '')
  } catch {
    return firebaseUrl.replace(/^\/+|\/+$/g, '')
  }
}

export function FirebaseVehicleMonitor({
  firebaseUrl,
  vehicleId,
}: FirebaseVehicleMonitorProps) {
  const [data, setData] = useState<VehicleData | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    const app = getFirebaseApp()
    if (!app) {
      setError('Firebase not initialized')
      return
    }

    try {
      const db = getDatabase(app)
      const path = resolvePath(firebaseUrl)
      // ref(db) with no path = database root; ref(db, path) = a sub-node.
      const dbRef = path ? ref(db, path) : ref(db)

      const unsubscribe = onValue(
        dbRef,
        (snapshot) => {
          const value = snapshot.val()
          if (value) {
            setData(value)
            setError(null)
            setIsConnected(true)
          } else {
            setData(null)
            setError('No data available')
            setIsConnected(false)
          }
        },
        (err) => {
          console.error('Firebase error:', err)
          setError('Connection failed')
          setIsConnected(false)
        }
      )

      return () => unsubscribe()
    } catch (err) {
      console.error('Firebase setup error:', err)
      setError('Setup failed')
    }
  }, [firebaseUrl])

  // SAFETY: '0' should only prevent the engine from STARTING (immobilizer wiring),
  // never cut a running engine. Writes a STRING to match the ESP32 firmware.
  const handleEngineCommand = async (status: '1' | '0') => {
    setIsSending(true)
    try {
      const app = getFirebaseApp()
      if (!app) throw new Error('Firebase not initialized')

      const db = getDatabase(app)
      const path = resolvePath(firebaseUrl)
      const buttonRef = path ? ref(db, `${path}/button`) : ref(db, 'button')
      await set(buttonRef, status)
    } catch (err) {
      console.error('Command failed:', err)
      setError('Failed to send command')
    } finally {
      setIsSending(false)
    }
  }

  const latitude = data?.lat ? parseFloat(String(data.lat)) : null
  const longitude = data?.lng ? parseFloat(String(data.lng)) : null
  const hasFix =
    latitude !== null && longitude !== null && latitude !== 0 && longitude !== 0
  const isEngineOn = String(data?.button) === '1'

  return (
    <div className="space-y-4">
      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-2">
        {/* Engine Status */}
        <div className="border rounded-lg p-3 bg-muted/30">
          <p className="text-xs font-medium text-muted-foreground mb-1">Engine</p>
          <div className="flex items-center gap-1">
            {isEngineOn ? (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-gray-400" />
            )}
            <p className={`text-sm font-bold ${isEngineOn ? 'text-green-600' : 'text-gray-400'}`}>
              {isEngineOn ? 'ON' : 'OFF'}
            </p>
          </div>
        </div>

        {/* Connection Status */}
        <div className="border rounded-lg p-3 bg-muted/30">
          <p className="text-xs font-medium text-muted-foreground mb-1">Status</p>
          <Badge variant={isConnected ? 'default' : error ? 'destructive' : 'secondary'}>
            {isConnected ? 'Connected' : error ? 'Error' : 'Connecting'}
          </Badge>
        </div>
      </div>

      {/* Coordinates */}
      {hasFix && (
        <div className="space-y-2">
          <div className="border rounded-lg p-3 bg-muted/30">
            <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Location
            </p>
            <p className="text-xs font-mono font-bold text-blue-600">
              {latitude!.toFixed(6)}, {longitude!.toFixed(6)}
            </p>
            <a
              href={`https://maps.google.com/?q=${latitude},${longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline block mt-1"
            >
              Open in Google Maps →
            </a>
          </div>
        </div>
      )}

      {/* Engine Control */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Engine Control</p>
        <div className="flex gap-2">
          <Button
            onClick={() => handleEngineCommand('1')}
            disabled={isSending || isEngineOn}
            size="sm"
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Power className="w-3 h-3 mr-1" />
            ON
          </Button>
          <Button
            onClick={() => handleEngineCommand('0')}
            disabled={isSending || !isEngineOn}
            size="sm"
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            <Power className="w-3 h-3 mr-1" />
            OFF
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && !isConnected && (
        <div className="flex items-start gap-2 p-2 bg-destructive/10 rounded border border-destructive/20">
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      {/* Firebase URL Info */}
      <div className="text-xs text-muted-foreground pt-2 border-t space-y-1 bg-muted/20 p-2 rounded">
        <p>
          <strong>Firebase Path:</strong> {resolvePath(firebaseUrl) || '(root)'}
        </p>
        <code className="block break-all text-[10px] bg-black text-green-400 p-1 rounded">
          {firebaseUrl}
        </code>
      </div>
    </div>
  )
}