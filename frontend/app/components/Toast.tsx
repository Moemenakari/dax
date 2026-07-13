'use client'
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { removeToast } from '../store/toastSlice'

export default function Toast() {
  const toasts = useSelector((state: RootState) => state.toast.toasts)
  const dispatch = useDispatch()

  useEffect(() => {
    const timers = toasts.map(toast => {
      return setTimeout(() => {
        dispatch(removeToast(toast.id))
      }, 3000)
    })
    return () => timers.forEach(clearTimeout)
  }, [toasts, dispatch])

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`toast-enter pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border backdrop-blur-sm cursor-pointer transition-all
            ${toast.type === 'success' ? 'bg-white/95 border-green-200 text-green-800' : 
              toast.type === 'error' ? 'bg-white/95 border-red-200 text-red-800' :
              'bg-white/95 border-blue-200 text-blue-800'}`}
          onClick={() => dispatch(removeToast(toast.id))}
        >
          <span className="text-lg">
            {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
          </span>
          <p className="text-sm font-medium flex-1">{toast.message}</p>
        </div>
      ))}
    </div>
  )
}
