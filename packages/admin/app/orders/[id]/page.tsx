'use client'
import { useEffect, useState, useCallback, use } from 'react'
import api from '../../lib/api'
import { LuChevronLeft, LuPackage, LuTruck, LuCreditCard, LuUser, LuMapPin, LuClock, LuPrinter } from 'react-icons/lu'
import Link from 'next/link'
import NextImage from 'next/image'

interface OrderItem {
  id: number
  productId: number
  titleSnapshot: string
  priceSnapshot: number
  salePriceSnapshot: number | null
  size: string
  qty: number
  imageSnapshotUrl: string
}

interface Order {
  id: number
  userId: number
  name: string
  phone: string
  address: string
  status: string
  paymentMethod: string
  paymentStatus: string
  deliveryFee: number
  subtotal: number
  total: number
  customerName: string
  customerPhone: string
  customerAddress: string
  customerCity: string
  notes: string | null
  createdAt: string
  items: OrderItem[]
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-indigo-100 text-indigo-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

export default function OrderDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const fetchOrder = useCallback(async () => {
    try {
      const res = await api.get(`/orders/${params.id}`)
      setOrder(res.data)
    } catch {}
    setLoading(false)
  }, [params.id])

  useEffect(() => { 
    fetchOrder()
  }, [fetchOrder])

  const updateStatus = async (status: string) => {
    setUpdating(true)
    try {
      await api.put(`/orders/${params.id}/status`, { status })
      setOrder(prev => prev ? { ...prev, status } : null)
    } catch {}
    setUpdating(false)
  }

  const updatePaymentStatus = async (paymentStatus: string) => {
    setUpdating(true)
    try {
      await api.put(`/orders/${params.id}/payment`, { paymentStatus })
      setOrder(prev => prev ? { ...prev, paymentStatus } : null)
    } catch {}
    setUpdating(false)
  }

  const openWhatsApp = () => {
    if (!order) return
    const phone = (order.customerPhone || order.phone || '').replace(/\D/g, '')
    const formatted = phone.startsWith('961') ? phone : `961${phone}`
    
    const itemsList = order.items?.map(item => 
      `• ${item.titleSnapshot} - Size ${item.size} x${item.qty} - $${((item.salePriceSnapshot || item.priceSnapshot) * item.qty).toFixed(2)}`
    ).join('\n') || ''

    const message = `Hello ${order.customerName || order.name}! 👋
Your DAX order #${order.id} update.

Order details:
${itemsList}

Subtotal: $${Number(order.subtotal).toFixed(2)}
Delivery: $${Number(order.deliveryFee).toFixed(2)}
Total: $${Number(order.total).toFixed(2)}

Status: ${order.status}

Thank you for shopping with DAX! 🙏
DAX Store - +961 70 474 719`

    window.open(`https://wa.me/${formatted}?text=${encodeURIComponent(message)}`, '_blank')
  }

  if (loading) return <div className="p-8 text-center text-slate-400 animate-pulse">Loading order details...</div>
  if (!order) return <div className="p-8 text-center">Order not found. <Link href="/orders" className="text-blue-500 underline">Go back</Link></div>

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-4">
          <Link href="/orders" className="w-10 h-10 rounded-xl border border-slate-100 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors">
            <LuChevronLeft className="text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-[#0f172a] uppercase flex items-center gap-2">
              Order #{order.id}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">
              <LuClock size={12} />
              {new Date(order.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => window.print()} className="bg-white border border-slate-100 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-50">
            <LuPrinter size={16} /> Print Invoice
          </button>
          <select 
            title="Update Status"
            value={order.status}
            onChange={e => updateStatus(e.target.value)}
            disabled={updating}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider focus:outline-none border-none shadow-sm cursor-pointer ${STATUS_COLORS[order.status] || 'bg-slate-100'}`}
          >
            {['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Items Section */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2 font-black text-xs text-[#0f172a] uppercase">
              <LuPackage className="text-[#e63946]" /> Items ({order.items.length})
            </div>
            <div className="divide-y divide-slate-50">
              {order.items.map(item => (
                <div key={item.id} className="p-4 flex items-center gap-4 group">
                  <div className="relative w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-slate-50 border border-slate-100">
                    {item.imageSnapshotUrl && <NextImage src={item.imageSnapshotUrl} alt="" fill className="object-cover" sizes="64px" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate">{item.titleSnapshot}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase mt-0.5">Size: <span className="text-[#e63946]">{item.size}</span> | Qty: {item.qty}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-sm text-slate-900">{item.salePriceSnapshot || item.priceSnapshot} $</p>
                    {item.salePriceSnapshot && <p className="text-[10px] text-slate-300 line-through font-bold">{item.priceSnapshot} $</p>}
                    <p className="text-[10px] text-slate-400 font-bold mt-1">Total: {(item.salePriceSnapshot || item.priceSnapshot) * item.qty} $</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm p-6 space-y-4">
             <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-400"><LuCreditCard /> Payment Summary</div>
                <select 
                  title="Payment Status"
                  value={order.paymentStatus}
                  onChange={e => updatePaymentStatus(e.target.value)}
                  className={`text-[10px] font-black rounded px-2 py-1 uppercase ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                >
                  {['NOT_PAID', 'UNDER_REVIEW', 'PAID'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
             </div>
             <div className="space-y-3">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-bold">{order.subtotal} $</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Delivery Fee</span>
                  <span className="font-bold">{order.deliveryFee} $</span>
                </div>
                <div className="flex justify-between text-lg text-slate-900 pt-3 border-t border-dashed border-slate-100">
                  <span className="font-black">TOTAL</span>
                  <span className="font-black text-[#e63946]">{order.total} $</span>
                </div>
             </div>
             <div className="mt-4 p-3 bg-slate-50 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-slate-100 text-slate-400">
                  <LuCreditCard size={18} />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Method</p>
                   <p className="text-xs font-black text-slate-700 uppercase">{order.paymentMethod}</p>
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2 font-black text-xs text-[#0f172a] uppercase">
              <LuUser className="text-[#e63946]" /> Customer Info
            </div>
            <div className="p-5 space-y-4">
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Name</p>
                  <p className="text-sm font-bold text-slate-900">{order.customerName}</p>
               </div>
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Phone</p>
                  <p className="text-sm font-bold text-slate-900">{order.customerPhone}</p>
               </div>
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Account</p>
                  <p className="text-xs text-slate-500 italic">User ID: {order.userId} ({order.name})</p>
               </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2 font-black text-xs text-[#0f172a] uppercase">
              <LuTruck className="text-[#e63946]" /> Shipping Details
            </div>
            <div className="p-5 space-y-4">
               <div className="flex gap-3">
                 <LuMapPin className="text-slate-400 flex-shrink-0 mt-1" size={16} />
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Delivery Address</p>
                    <p className="text-sm font-bold text-slate-900">{order.customerAddress}</p>
                    <p className="text-xs text-slate-500">{order.customerCity}</p>
                 </div>
               </div>
               {order.notes && (
                 <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                    <p className="text-[10px] font-bold text-yellow-600 uppercase mb-1">Customer Notes</p>
                    <p className="text-xs text-yellow-800 leading-relaxed italic">{order.notes}</p>
                 </div>
               )}
            </div>
          </div>

          {/* WhatsApp Contact Button */}
          <button
            onClick={openWhatsApp}
            className="w-full bg-green-500 text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-green-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Contact Customer on WhatsApp
          </button>
        </div>
      </div>
    </div>
  )
}
