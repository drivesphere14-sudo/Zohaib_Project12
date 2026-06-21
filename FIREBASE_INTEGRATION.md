# Firebase Real-time GPS & IoT Integration Guide

## Overview
The admin dashboard now integrates Firebase Realtime Database for real-time GPS tracking and IoT engine control. This guide explains how the system works and how to use it.

## Database URL
**Firebase Realtime Database URL:**
```
https://gsptracker-57beb-default-rtdb.firebaseio.com
```

## Database Structure
```json
{
  "button": "1",      // Engine status: "1" = ON, "0" = OFF
  "lat": "31.5629044", // Vehicle latitude
  "lng": "74.3180313"  // Vehicle longitude
}
```

## Updated Admin Pages

### 1. **IoT Control Panel** (`/admin/iot`)
Integrated Firebase real-time monitoring with existing IoT controls.

**Features:**
- **Firebase Real-time Monitor Section**: Displays live GPS and engine data
  - Current Engine Status (ON/OFF)
  - Latitude & Longitude coordinates
  - Firebase connection status
  - **Engine Control Buttons**: Turn engine ON/OFF remotely via Firebase

- **Existing IoT Controls**: Lock, Unlock, Immobilize, Reactivate vehicles
- **Recent Commands**: History of all IoT commands sent

**Components Used:**
- `FirebaseIoTMonitor` - Real-time Firebase data display and engine control

### 2. **Fleet Tracking** (`/admin/tracking`)
Enhanced with Firebase real-time GPS data at the top.

**Features:**
- **Firebase GPS Tracker Section**: Shows live location from Firebase
  - Latitude & Longitude
  - Engine Status
  - Direct link to Google Maps
  - Firebase connection status

- **Existing Tracking**: Supabase-based vehicle location tracking
  - Vehicle list with status
  - Interactive map
  - Live monitoring toggle
  - Refresh capability

**Components Used:**
- `FirebaseGPSTracker` - Real-time GPS monitoring from Firebase

### 3. **Vehicle Management** (`/admin/vehicles`)
Updated to display GPS and IoT device information.

**Features:**
- Shows GPS Device ID for each vehicle
- Shows IoT Device ID for each vehicle
- Quick link to Firebase tracking capabilities
- Vehicle status and pricing information

## How to Add GPS/IoT Tracking to Vehicles

When adding a vehicle in the **Add Vehicle Dialog**:

1. **GPS Device ID** (optional)
   - Unique identifier for the GPS tracking device
   - Example: `GPS-001`, `tracker-vehicle-1`
   - Used to link vehicle to Firebase GPS data

2. **IoT Device ID** (optional)
   - Unique identifier for IoT/engine control device
   - Example: `IOT-001`, `engine-control-1`
   - Used for remote lock, unlock, immobilize commands

## Firebase Data Flow

### Reading GPS Location
1. Admin accesses IoT Control or Tracking page
2. Component connects to Firebase Realtime Database
3. Listens on root path `/` for real-time updates
4. Extracts `lat` and `lng` values
5. Updates UI in real-time as values change

### Sending Engine Commands
1. Admin clicks "Turn ON" or "Turn OFF" button
2. Component sends command to Firebase path `/button`
3. Device receives command and updates engine status
4. Device updates `button` value to `"1"` (ON) or `"0"` (OFF)
5. Admin dashboard updates in real-time

## Components Created

### 1. `FirebaseIoTMonitor` 
**Location:** `components/admin/firebase-iot-monitor.tsx`
- Displays real-time engine status and GPS coordinates
- Provides ON/OFF buttons for engine control
- Shows Firebase connection status
- Handles errors gracefully

**Props:** None (connects directly to Firebase)

### 2. `FirebaseGPSTracker`
**Location:** `components/admin/firebase-gps-tracker.tsx`
- Shows live GPS coordinates from Firebase
- Displays engine status
- Provides link to Google Maps
- Shows connection status

**Props:** None (connects directly to Firebase)

### 3. `FirebaseTrackingMap` (Optional)
**Location:** `components/admin/firebase-tracking-map.tsx`
- Interactive map using Leaflet
- Shows vehicle marker on map
- Displays popup with coordinates

**Props:**
```typescript
{
  latitude: number
  longitude: number
}
```

## Firebase Configuration

Environment variables (already set in `.env.local`):
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCOTpk7sDHx5Fhqa1-HUe8wnN_n5cVy7p8
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=gsptracker-57beb.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://gsptracker-57beb-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=gsptracker-57beb
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=gsptracker-57beb.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1031074796276
NEXT_PUBLIC_FIREBASE_APP_ID=1:1031074796276:web:4f1d48521fcd3ca84ec4a1
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-HWVDSKVBX5
```

## Using the Hook

For custom implementations, use the `useVehicleData` hook:

```typescript
import { useVehicleData } from '@/hooks/useVehicleData'

export default function MyComponent() {
  const { data, isLoading, error, updateEngineStatus } = useVehicleData()
  
  const latitude = data?.lat ? parseFloat(data.lat) : null
  const longitude = data?.lng ? parseFloat(data.lng) : null
  const isEngineOn = data?.button === '1'
  
  return (
    <div>
      <p>Location: {latitude}, {longitude}</p>
      <button onClick={() => updateEngineStatus('1')}>Turn ON</button>
      <button onClick={() => updateEngineStatus('0')}>Turn OFF</button>
    </div>
  )
}
```

## Data Update Frequency

- Real-time updates via Firebase `onValue()` listener
- Updates immediately when GPS device sends new coordinates
- Engine status changes reflected instantly
- No polling - uses Firebase push notifications

## Error Handling

All Firebase components include:
- Connection error messages
- Fallback states when Firebase is unavailable
- Graceful degradation if database connection fails
- Logging for debugging

## Testing the Integration

1. **Admin Dashboard Access**
   - Login to admin panel
   - Navigate to `/admin/iot` or `/admin/tracking`
   - View Firebase real-time data

2. **Engine Control**
   - Click "Turn ON" button to set `button` = "1"
   - Click "Turn OFF" button to set `button` = "0"
   - Device receives command via Firebase

3. **GPS Tracking**
   - Watch latitude/longitude update in real-time
   - Links directly to Google Maps for quick viewing
   - Coordinates update as device sends new positions

## Integration with Existing Features

- ✅ Works alongside existing IoT control (MQTT-based)
- ✅ Complements Supabase tracking system
- ✅ No conflicts with existing database structures
- ✅ Vehicle management seamlessly integrated

## Next Steps

1. Connect physical GPS device to Firebase
2. Have device update `/lat` and `/lng` regularly
3. Connect engine control system to Firebase
4. Have system read `/button` value and control engine
5. Monitor live in admin dashboard

