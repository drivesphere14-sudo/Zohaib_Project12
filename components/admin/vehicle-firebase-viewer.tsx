'use client'

import { useState } from 'react'
import { MapPin } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { FirebaseVehicleMonitor } from './firebase-vehicle-monitor'

interface VehicleFirebaseViewerProps {
  vehicleId: string
  vehicleName: string
  firebaseUrl: string
}

export function VehicleFirebaseViewer({
  vehicleId,
  vehicleName,
  firebaseUrl,
}: VehicleFirebaseViewerProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 hover:underline">
          <MapPin className="h-3 w-3" />
          View Firebase GPS/IoT
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">
            {vehicleName} - Live GPS & IoT
          </DialogTitle>
        </DialogHeader>
        <FirebaseVehicleMonitor
          firebaseUrl={firebaseUrl}
          vehicleId={vehicleId}
        />
      </DialogContent>
    </Dialog>
  )
}
