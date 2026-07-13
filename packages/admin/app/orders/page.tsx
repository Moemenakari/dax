'use client'
import { useEffect, useState, useCallback } from 'react'
import api from '../lib/api'
import NextImage from 'next/image'
import Link from 'next/link'

const STATUSES = ['PENDING', 'REVIEW', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  REVIEW: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
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
  name: string
  phone: string
  status: string
  paymentStatus: string
  paymentMethod: string
  total: number
  subtotal: number
  deliveryFee: number
  customerName: string
  customerPhone: string
  customerAddress: string | null
  customerCity: string | null
  items: OrderItem[]
  createdAt: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null)

  const fetchOrders = useCallback(async () => {
    try {
      const params: Record<string, string> = {}
      if (filterStatus) params.status = filterStatus
      const res = await api.get('/orders', { params })
      setOrders(res.data)
    } catch {}
    setLoading(false)
  }, [filterStatus])

  useEffect(() => { 
    let active = true
    if (active) fetchOrders()
    return () => { active = false }
  }, [fetchOrders])

  const updateStatus = async (orderId: number, status: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status })
      fetchOrders()
    } catch {}
  }

  const updatePayment = async (orderId: number, paymentStatus: string) => {
    try {
      await api.put(`/orders/${orderId}/payment`, { paymentStatus })
      fetchOrders()
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black">Orders</h1>
        <p className="text-sm text-slate-400 mt-1">{orders.length} orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFilterStatus('')}
          className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${!filterStatus ? 'bg-[#0f172a] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          All
        </button>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${filterStatus === s ? 'bg-[#0f172a] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Orders */}
      <div className="space-y-3">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="w-full px-5 py-4 flex flex-wrap items-center justify-between gap-3 text-left hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  className="font-black text-sm"
                >
                  #{order.id}
                </button>
                <div>
                  <p className="font-bold text-sm">{order.customerName || order.name}</p>
                  <p className="text-xs text-slate-400">{order.customerPhone || order.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* WhatsApp button */}
                <button
                  onClick={() => openWhatsApp(order)}
                  className="w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors"
                  title="Contact via WhatsApp"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </button>
                <Link
                  href={`/orders/${order.id}`}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  View
                </Link>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${STATUS_COLORS[order.status]}`}>
                  {order.status}
                </span>
                <span className="font-bold text-sm">${Number(order.total).toFixed(2)}</span>
                <button onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)} title="Toggle order details">
                  <svg className={`w-4 h-4 text-slate-400 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Expanded */}
            {expandedOrder === order.id && (
              <div className="border-t border-slate-50 px-5 py-5 space-y-4">
                {/* Items */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">Items</p>
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 py-1.5 text-sm">
                      <div className="w-8 h-10 rounded bg-slate-50 overflow-hidden flex-shrink-0 relative">
                        {item.imageSnapshotUrl && <NextImage src={item.imageSnapshotUrl} alt="" fill className="object-cover" sizes="32px" />}
                      </div>
                      <span className="flex-1">{item.titleSnapshot}</span>
                      <span className="text-slate-500">Size: {item.size}</span>
                      <span className="text-slate-500">×{item.qty}</span>
                      <span className="font-bold">${((item.salePriceSnapshot ?? item.priceSnapshot) * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <p className="text-slate-400 mb-0.5">Payment</p>
                    <p className="font-bold">{order.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-0.5">Payment Status</p>
                    <p className={`font-bold ${order.paymentStatus === 'PAID' ? 'text-green-600' : order.paymentStatus === 'UNDER_REVIEW' ? 'text-yellow-600' : 'text-slate-600'}`}>
                      {order.paymentStatus}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-0.5">Subtotal</p>
                    <p className="font-bold">${Number(order.subtotal).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-0.5">Delivery Fee</p>
                    <p className="font-bold">${Number(order.deliveryFee).toFixed(2)}</p>
                  </div>
                </div>

                {/* Address */}
                {order.customerAddress && (
                  <div className="text-xs">
                    <p className="text-slate-400 mb-0.5">Address</p>
                    <p className="font-medium">{order.customerAddress}{order.customerCity ? `, ${order.customerCity}` : ''}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-50">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1.5">Order Status</p>
                    <select
                      title="Order Status"
                      value={order.status}
                      onChange={e => updateStatus(order.id, e.target.value)}
                      className="border-2 border-slate-100 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:border-slate-900"
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1.5">Payment Status</p>
                    <select
                      title="Payment Status"
                      value={order.paymentStatus}
                      onChange={e => updatePayment(order.id, e.target.value)}
                      className="border-2 border-slate-100 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:border-slate-900"
                    >
                      {['NOT_PAID', 'UNDER_REVIEW', 'PAID'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => openWhatsApp(order)}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-green-600 transition-colors"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Contact Customer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {orders.length === 0 && !loading && (
          <div className="text-center py-12 text-slate-400">
            <p className="text-4xl mb-2">📦</p>
            <p className="font-medium">No orders yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
