-- Add firebase_url column to vehicles table
ALTER TABLE vehicles ADD COLUMN firebase_url TEXT;

-- Optional: Add comment
COMMENT ON COLUMN vehicles.firebase_url IS 'Firebase Realtime Database URL for this vehicle GPS/IoT tracking (e.g., https://db.firebaseio.com/vehicle1)';

-- Verify the column was added
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name='vehicles' ORDER BY ordinal_position;
