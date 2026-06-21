'use client'

import { useEffect, useState, useCallback } from 'react'
import { ref, onValue, set } from 'firebase/database'
import { getFirebaseDatabase, isFirebaseAvailable } from '@/lib/firebase/client'

interface VehicleData {
  button: string
  lat: string
  lng: string
}

interface UseVehicleReturn {
  data: VehicleData | null
  isLoading: boolean
  error: string | null
  updateEngineStatus: (status: '0' | '1') => Promise<void>
}

export function useVehicleData(): UseVehicleReturn {
  const [data, setData] = useState<VehicleData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isFirebaseAvailable()) {
      setError('Firebase not configured')
      setIsLoading(false)
      return
    }

    const db = getFirebaseDatabase()
    if (!db) {
      setError('Failed to initialize Firebase database')
      setIsLoading(false)
      return
    }

    try {
      const rootRef = ref(db, '/')
      const unsubscribe = onValue(
        rootRef,
        (snapshot) => {
          const value = snapshot.val()
          if (value) {
            setData({
              button: value.button || '0',
              lat: value.lat || '0',
              lng: value.lng || '0',
            })
            setError(null)
          }
          setIsLoading(false)
        },
        (err) => {
          console.error('Firebase listener error:', err)
          setError('Failed to connect to Firebase')
          setIsLoading(false)
        }
      )

      return () => unsubscribe()
    } catch (err) {
      console.error('Firebase setup error:', err)
      setError('Failed to setup Firebase listener')
      setIsLoading(false)
    }
  }, [])

  const updateEngineStatus = useCallback(
    async (status: '0' | '1') => {
      if (!isFirebaseAvailable()) {
        throw new Error('Firebase not configured')
      }

      const db = getFirebaseDatabase()
      if (!db) {
        throw new Error('Firebase database unavailable')
      }

      try {
        const buttonRef = ref(db, '/button')
        await set(buttonRef, status)
      } catch (err) {
        console.error('Failed to update engine status:', err)
        throw err
      }
    },
    []
  )

  return {
    data,
    isLoading,
    error,
    updateEngineStatus,
  }
}
