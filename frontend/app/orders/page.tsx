'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import api from '../lib/api'
import NextImage from 'next/image'
import LockIcon from '@mui/icons-material/Lock'
import InventoryIcon from '@mui/icons-material/Inventory'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import ManageSearchIcon from '@mui/icons-material/ManageSearch'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import SettingsIcon from '@mui/icons-material/Settings'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import CancelIcon from '@mui/icons-material/Cancel'

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  REVIEW: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  PENDING: <AccessTimeIcon fontSize="inherit" />,
  REVIEW: <ManageSearchIcon fontSize="inherit" />,
  CONFIRMED: <CheckCircleIcon fontSize="inherit" />,
  PROCESSING: <SettingsIcon fontSize="inherit" />,
  SHIPPED: <LocalShippingIcon fontSize="inherit" />,
  DELIVERED: <InventoryIcon fontSize="inherit" />,
  CANCELLED: <CancelIcon fontSize="inherit" />,
}

interface OrderItem {
  productId: number
  titleSnapshot: string
  priceSnapshot: number
  salePriceSnapshot: number | null
  imageSnapshotUrl: string
  size: string
  qty: number
}

interface Order {
  id: number
  status: string
  paymentStatus: string
  paymentMethod: string
  total: number
  createdAt: string
  items: OrderItem[]
}

const CANCEL_REASONS = [
  'Changed my mind',
  'Ordered wrong size',
  'Found better price',
  'Taking too long',
  'Other',
]

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Cancel modal
  const [cancelOrderId, setCancelOrderId] = useState<number | null>(null)
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0])
  const [customReason, setCustomReason] = useState('')
  const [cancelling, setCancelling] = useState(false)

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get('/orders/my')
      setOrders(res.data)
    } catch {
      setError('Please login to view your orders')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    if (active) fetchOrders()
    return () => { active = false }
  }, [fetchOrders])

  const handleCancel = async () => {
    if (!cancelOrderId) return
    setCancelling(true)
    try {
      const reason = cancelReason === 'Other' ? customReason || 'Other' : cancelReason
      await api.put(`/orders/${cancelOrderId}/cancel`, { reason })
      setOrders(prev => prev.map(o => 
        o.id === cancelOrderId ? { ...o, status: 'CANCELLED' } : o
      ))
      setCancelOrderId(null)
      setCancelReason(CANCEL_REASONS[0])
      setCustomReason('')
    } catch {
      // Error handling
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-2xl skeleton" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl text-gray-300 mb-4"><LockIcon fontSize="inherit" /></p>
        <h2 className="text-2xl font-black mb-4">{error}</h2>
        <Link 
          href="/login" 
          className="bg-[#0f0f0f] text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-[#e63946] transition-colors inline-block"
        >
          Login
        </Link>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl text-gray-300 mb-4"><InventoryIcon fontSize="inherit" /></p>
        <h2 className="text-2xl font-black mb-3">No Orders Yet</h2>
        <p className="text-gray-500 mb-6">Start shopping to see your orders here.</p>
        <Link 
          href="/shop" 
          className="bg-[#0f0f0f] text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-[#e63946] transition-colors inline-block"
        >
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-10">
      <h1 className="text-3xl md:text-4xl font-black mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="px-4 md:px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-50">
              <div>
                <Link href={`/orders/${order.id}`} className="font-bold text-sm hover:text-[#e63946] transition-colors">
                  Order #{order.id}
                </Link>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(order.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', month: 'long', day: 'numeric' 
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${STATUS_COLORS[order.status] || 'bg-gray-100'}`}>
                  {STATUS_ICONS[order.status]} {order.status}
                </span>
              </div>
            </div>

            <div className="px-4 md:px-5 py-4">
              {order.items?.map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <div className="w-12 h-14 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 relative">
                    {item.imageSnapshotUrl ? (
                      <NextImage 
                        src={item.imageSnapshotUrl} 
                        alt={item.titleSnapshot} 
                        fill 
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300"><CheckroomIcon /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.titleSnapshot}</p>
                    <p className="text-xs text-gray-400">Size: {item.size} × {item.qty}</p>
                  </div>
                  <span className="text-sm font-bold">
                    ${((item.salePriceSnapshot ?? item.priceSnapshot) * item.qty).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 md:px-5 py-3 bg-gray-50 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Payment: <strong>{order.paymentMethod}</strong></span>
                <span>Status: <strong className={
                  order.paymentStatus === 'PAID' ? 'text-green-600' : 
                  order.paymentStatus === 'UNDER_REVIEW' ? 'text-yellow-600' : 'text-gray-600'
                }>{order.paymentStatus}</strong></span>
              </div>
              <div className="flex items-center gap-3">
                {order.status === 'PENDING' && (
                  <button
                    onClick={() => setCancelOrderId(order.id)}
                    className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
                  >
                    Cancel Order
                  </button>
                )}
                <p className="text-base font-black">${Number(order.total).toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cancel Modal */}
      {cancelOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setCancelOrderId(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-black text-lg mb-1">Cancel Order #{cancelOrderId}</h3>
            <p className="text-sm text-gray-500 mb-5">Please tell us why you want to cancel</p>
            
            <div className="space-y-3 mb-5">
              <select
                title="Cancel reason"
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#0f0f0f] transition-colors"
              >
                {CANCEL_REASONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              {cancelReason === 'Other' && (
                <textarea
                  placeholder="Please specify..."
                  value={customReason}
                  onChange={e => setCustomReason(e.target.value)}
                  rows={3}
                  className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#0f0f0f] transition-colors resize-none"
                />
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCancelOrderId(null)}
                className="flex-1 border-2 border-gray-100 text-gray-700 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
