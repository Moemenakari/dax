'use client'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setCartState } from './cartSlice'

export default function CartHydration({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch()
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    try {
      const serializedState = window.localStorage.getItem('dax_cart_state')
      if (serializedState !== null) {
        dispatch(setCartState(JSON.parse(serializedState)))
      }
    } catch (e) {
      console.error("Could not load cart state", e)
    }
    setTimeout(() => setIsHydrated(true), 0)
  }, [dispatch])

  if (!isHydrated) return null

  return <>{children}</>
}
