# Firebase GPS/IoT Integration - Simplified URL Approach

## Quick Setup

### Step 1: Add Vehicle with Firebase URL

When adding a vehicle in **Admin Panel → Vehicles → Add Vehicle**:

1. Fill in standard vehicle details (Name, Type, Plate, Price, etc.)
2. **Firebase URL** field: Enter the complete Firebase Realtime Database path for this vehicle

**Example:**
```
https://gsptracker-57beb-default-rtdb.firebaseio.com/vehicle1
```

Each vehicle has its own unique Firebase path/URL.

### Step 2: View Live Data

Click **"View Firebase GPS/IoT"** link under the vehicle name to open a modal showing:
- ✅ Live GPS coordinates (Latitude, Longitude)
- ✅ Engine status (ON/OFF)
- ✅ Direct Google Maps link
- ✅ Engine control buttons (Turn ON/OFF)

## Firebase Data Structure

Your Firebase database for each vehicle should contain:

```json
{
  "vehicle1": {
    "button": "1",      // Engine: "1" = ON, "0" = OFF
    "lat": "31.5629",   // Latitude
    "lng": "74.3180"    // Longitude
  },
  "vehicle2": {
    "button": "0",
    "lat": "31.5630",
    "lng": "74.3181"
  }
}
```

**Supported fields:**
- `button` - Engine status (string "0" or "1", or number 0 or 1)
- `lat` / `latitude` - GPS latitude coordinate
- `lng` / `longitude` - GPS longitude coordinate
- Any other custom fields

## How It Works

1. **Vehicle Page** → Click "View Firebase GPS/IoT" button
2. **Modal Opens** → Shows real-time data from the Firebase URL stored for that vehicle
3. **Live Updates** → Automatically updates whenever data changes in Firebase
4. **Engine Control** → Send ON/OFF commands directly to Firebase
5. **GPS Link** → Click "Open in Google Maps" to view exact location

## Different URLs per Vehicle

Each vehicle can have a completely different Firebase path:

```
Vehicle 1: https://gsptracker-57beb-default-rtdb.firebaseio.com/car-001
Vehicle 2: https://gsptracker-57beb-default-rtdb.firebaseio.com/suv-002
Vehicle 3: https://tracker-other-database.firebaseio.com/vehicle-xyz
```

You can even use different Firebase projects/databases!

## Example Use Cases

**Scenario 1: Individual GPS Trackers**
- Each vehicle has different GPS module
- Each writes to unique Firebase path
- Store path in vehicle's Firebase URL field

**Scenario 2: IoT Relay Per Vehicle**
- Each IoT relay has unique control path
- Admin can turn engine ON/OFF for specific vehicle
- Data goes to vehicle-specific Firebase path

**Scenario 3: Mixed Setup**
```
Vehicle 1 (Tesla): https://gsptracker-57beb-default-rtdb.firebaseio.com/tesla-v1
Vehicle 2 (Honda): https://another-project-rtdb.firebaseio.com/honda-x2
Vehicle 3 (BMW): https://gsptracker-57beb-default-rtdb.firebaseio.com/bmw-series
```

## No Extra Pages

✅ Removed: Separate tracker page  
✅ Removed: Extra Firebase monitoring pages  
✅ Kept: Simple click-to-view modal in Vehicle Management  

Everything is integrated into the existing admin dashboard.

## Components Created

1. **VehicleFirebaseViewer** - Button that opens modal
2. **FirebaseVehicleMonitor** - Real-time data display + controls

Both are embedded in the Vehicle Management page.

## Firebase Configuration

Already set in `.env.local`:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- etc.

## Testing

1. Add vehicle with Firebase URL pointing to your test data
2. Go to Admin → Vehicles
3. Find vehicle → Click "View Firebase GPS/IoT"
4. See live updates as data changes
5. Test ON/OFF buttons to control engine

## Troubleshooting

**"No data available"** error:
- Check Firebase URL is correct
- Verify database path exists in Firebase
- Ensure Firebase rules allow reads

**Connection failed:**
- Check internet connection
- Verify Firebase credentials in `.env.local`
- Check browser console for detailed errors

**Changes not showing:**
- Firebase listener updates in real-time
- May take 1-2 seconds for realtime updates
- Refresh if needed

