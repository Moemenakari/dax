'use client'
import { useEffect, useState, useCallback } from 'react'
import api from '../lib/api'
import NextImage from 'next/image'
import { LuClipboardCheck, LuTruck, LuPhone } from 'react-icons/lu'

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
  name: string
  phone: string
  status: string
  subtotal: number
  deliveryFee: number
  total: number
  customerName: string
  customerPhone: string
  customerAddress: string
  customerCity: string
  items: OrderItem[]
  createdAt: string
}

export default function TodoPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get('/orders', { params: { status: 'CONFIRMED' } })
      setOrders(res.data)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const markAsShipped = async (orderId: number) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: 'SHIPPED' })
      setOrders(prev => prev.filter(o => o.id !== orderId))
    } catch {}
  }

  const buildWhatsAppMessage = (order: Order) => {
    const itemsList = order.items?.map(item => 
      `• ${item.titleSnapshot} - Size ${item.size} x${item.qty} - $${((item.salePriceSnapshot ?? item.priceSnapshot) * item.qty).toFixed(2)}`
    ).join('\n') || ''

    return `Hello ${order.customerName || order.name}! 👋
Your DAX order #${order.id} is confirmed and being prepared.

Order details:
${itemsList}

Subtotal: $${Number(order.subtotal).toFixed(2)}
Delivery: $${Number(order.deliveryFee).toFixed(2)}
Total: $${Number(order.total).toFixed(2)}

We will contact you soon for delivery. Thank you! 🙏
DAX Store - +961 70 474 719`
  }

  const openWhatsApp = (order: Order) => {
    const phone = (order.customerPhone || order.phone || '').replace(/\D/g, '')
    const formatted = phone.startsWith('961') ? phone : `961${phone}`
    const message = buildWhatsAppMessage(order)
    window.open(`https://wa.me/${formatted}?text=${encodeURIComponent(message)}`, '_blank')
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-black">To-Do Orders</h1>
          <p className="text-sm text-slate-400 mt-1">Loading...</p>
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-slate-100 rounded-2xl skeleton" />
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black flex items-center gap-2">
          <LuClipboardCheck className="text-[#e63946]" /> To-Do Orders
        </h1>
        <p className="text-sm text-slate-400 mt-1">Confirmed orders ready to process • {orders.length} orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <p className="text-4xl mb-3">✅</p>
          <h3 className="font-black text-lg mb-1">All caught up!</h3>
          <p className="text-sm text-slate-400">No confirmed orders to process right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-50 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-black text-sm">Order #{order.id}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span className="font-medium text-slate-700">{order.customerName || order.name}</span>
                    <span className="flex items-center gap-1"><LuPhone size={12} /> {order.customerPhone || order.phone}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-lg text-[#e63946]">${Number(order.total).toFixed(2)}</p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div className="px-5 py-3 space-y-2">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-1">
                    <div className="w-10 h-12 rounded-lg overflow-hidden bg-slate-50 flex-shrink-0 relative">
                      {item.imageSnapshotUrl && (
                        <NextImage src={item.imageSnapshotUrl} alt="" fill className="object-cover" sizes="40px" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.titleSnapshot}</p>
                      <p className="text-xs text-slate-400">Size: {item.size} × {item.qty}</p>
                    </div>
                    <span className="text-sm font-bold">${((item.salePriceSnapshot ?? item.priceSnapshot) * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Address */}
              {(order.customerAddress || order.customerCity) && (
                <div className="px-5 py-2 text-xs text-slate-500 border-t border-slate-50">
                  📍 {order.customerAddress}{order.customerCity ? `, ${order.customerCity}` : ''}
                </div>
              )}

              {/* Actions */}
              <div className="px-5 py-3 bg-slate-50 flex flex-wrap gap-2">
                <button
                  onClick={() => markAsShipped(order.id)}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <LuTruck size={16} /> Mark as Shipped
                </button>
                <button
                  onClick={() => openWhatsApp(order)}
                  className="flex-1 bg-green-500 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Send WhatsApp
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
