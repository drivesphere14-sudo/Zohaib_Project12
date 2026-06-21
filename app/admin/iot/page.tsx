import { createClient } from "@/lib/supabase/server"
import { VehicleTracker } from "@/components/iot/vehicle-tracker"

export default async function IoTPage() {
  const supabase = await createClient()

  // Vehicles that have a Firebase location set -> show a live tracker for each.
  const { data: trackedVehicles } = await supabase
    .from("vehicles")
    .select("id, name, firebase_url")
    .not("firebase_url", "is", null)
    .order("name")

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">
          IoT Control Panel
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Remote lock, unlock, and immobilize vehicles via MQTT
        </p>
      </div>

      {/* Live Firebase tracking + engine control (one card per vehicle) */}
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="font-serif text-lg font-bold text-foreground">
            Live tracking &amp; engine control
          </h2>
          <p className="text-sm text-muted-foreground">
            Real-time GPS and relay state read directly from Firebase.
          </p>
        </div>

        {!trackedVehicles || trackedVehicles.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No vehicle has a Firebase URL yet. Add one in the vehicle form to control it here.
          </p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {trackedVehicles.map((v: any) => (
              <VehicleTracker key={v.id} name={v.name} firebaseUrl={v.firebase_url} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}