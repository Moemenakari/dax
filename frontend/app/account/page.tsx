'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { logout } from '../store/authSlice'
import api from '../lib/api'
import LocalMallIcon from '@mui/icons-material/LocalMall'
import FavoriteIcon from '@mui/icons-material/Favorite'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'

interface Notification {
  id: number
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

interface AuthState {
  user: {
    id: number
    name: string
    email: string
    phone: string
    role: string
  } | null
  isAuthenticated: boolean
}

export default function AccountPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth) as AuthState
  const [notifications, setNotifications] = useState<Notification[]>([])

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data)
    } catch {}
  }, [])

  useEffect(() => {
    let active = true
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    if (active) fetchNotifications()
    return () => { active = false }
  }, [isAuthenticated, router, fetchNotifications])

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {}
    dispatch(logout())
    router.push('/')
  }

  if (!isAuthenticated || !user) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-10">
      <h1 className="text-3xl md:text-4xl font-black mb-8">My Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
          <div className="w-20 h-20 bg-[#0f0f0f] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-black">{user.name?.charAt(0).toUpperCase()}</span>
          </div>
          <h2 className="font-black text-lg">{user.name}</h2>
          <p className="text-gray-400 text-sm mt-1">{user.phone}</p>
          <p className="text-xs text-gray-300 mt-1 capitalize">{user.role}</p>
          <button
            onClick={handleLogout}
            className="w-full mt-6 border-2 border-red-100 text-red-500 py-2.5 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Quick Links */}
        <div className="md:col-span-2 space-y-3">
          <Link href="/orders" className="block bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-2xl text-gray-500"><LocalMallIcon fontSize="inherit"/></span>
                <div>
                  <p className="font-bold">My Orders</p>
                  <p className="text-xs text-gray-400">Track and manage your orders</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-300 group-hover:text-[#e63946] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
          
          <Link href="/wishlist" className="block bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-2xl text-red-500"><FavoriteIcon fontSize="inherit"/></span>
                <div>
                  <p className="font-bold">Wishlist</p>
                  <p className="text-xs text-gray-400">Products you saved for later</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-300 group-hover:text-[#e63946] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
          
          <Link href="/cart" className="block bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-2xl text-gray-500"><ShoppingCartIcon fontSize="inherit"/></span>
                <div>
                  <p className="font-bold">Shopping Cart</p>
                  <p className="text-xs text-gray-400">Review items in your cart</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-300 group-hover:text-[#e63946] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-black mb-4">Recent Notifications</h2>
          <div className="space-y-2">
            {notifications.slice(0, 10).map((n) => (
              <div key={n.id} className={`rounded-xl p-4 border text-sm ${n.isRead ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-100'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold">{n.title}</p>
                    <p className="text-gray-500 text-xs mt-1">{n.message}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
