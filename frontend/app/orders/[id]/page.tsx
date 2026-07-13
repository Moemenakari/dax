'use client'
import { useEffect, useState, useCallback, use, useRef } from 'react'
import Link from 'next/link'
import api from '../../lib/api'
import NextImage from 'next/image'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'

const STATUS_COLORS: Record<string, string> = {
  PENDING:   'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  SHIPPED:   'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
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
  status: string
  paymentMethod: string
  paymentStatus: string
  subtotal: number
  deliveryFee: number
  total: number
  discountAmount: number
  couponCode: string | null
  wishProofUrl: string | null
  customerName: string
  customerPhone: string
  customerAddress: string
  customerCity: string
  createdAt: string
  items: OrderItem[]
}

export default function OrderDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [proofUploading, setProofUploading] = useState(false)
  const [proofMsg, setProofMsg] = useState('')
  const proofInputRef = useRef<HTMLInputElement>(null)

  const fetchOrder = useCallback(async () => {
    try {
      const res = await api.get(`/orders/${params.id}`)
      setOrder(res.data)
    } catch {}
    setLoading(false)
  }, [params.id])

  useEffect(() => { fetchOrder() }, [fetchOrder])

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !order) return
    setProofUploading(true)
    setProofMsg('')
    try {
      const formData = new FormData()
      formData.append('proof', file)
      await api.post(`/orders/${order.id}/proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setProofMsg('Payment proof uploaded successfully!')
      fetchOrder()
    } catch {
      setProofMsg('Upload failed. Please try again.')
    }
    setProofUploading(false)
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4" />
          <div className="h-6 w-48 bg-gray-200 rounded mx-auto mb-2" />
          <div className="h-4 w-32 bg-gray-200 rounded mx-auto" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-black mb-4">Order Not Found</h2>
        <Link href="/orders" className="text-[#e63946] font-bold hover:underline">View All Orders</Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <div className="text-center mb-8 md:mb-10">
        <div className="text-green-500 mb-3">
          <CheckCircleIcon sx={{ fontSize: 72 }} />
        </div>
        <h1 className="text-2xl md:text-3xl font-black mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-500">
          Order #{order.id} &bull; {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
        <span className={`inline-block mt-3 text-xs font-bold px-4 py-2 rounded-lg ${STATUS_COLORS[order.status] || 'bg-gray-100'}`}>
          {order.status}
        </span>
      </div>

      {/* Wish proof upload banner */}
      {order.paymentMethod === 'WISH' && order.paymentStatus !== 'PAID' && (
        <div className={`rounded-2xl border p-5 mb-6 ${order.wishProofUrl ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
          {order.wishProofUrl ? (
            <div>
              <p className="font-bold text-green-800 text-sm mb-2">✓ Payment proof submitted — under review</p>
              <div className="relative w-40 h-28 rounded-xl overflow-hidden border border-green-200">
                <NextImage src={order.wishProofUrl} alt="Payment proof" fill className="object-cover" sizes="160px" />
              </div>
            </div>
          ) : (
            <div>
              <p className="font-bold text-blue-800 text-sm mb-1">Upload Payment Proof</p>
              <p className="text-xs text-blue-600 mb-3">Upload your Wish payment screenshot so we can confirm your payment.</p>
              <button
                type="button"
                onClick={() => proofInputRef.current?.click()}
                disabled={proofUploading}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <CloudUploadIcon fontSize="small" />
                {proofUploading ? 'Uploading...' : 'Upload Screenshot'}
              </button>
              <input
                ref={proofInputRef}
                type="file"
                accept="image/*"
                onChange={handleProofUpload}
                className="hidden"
                title="Upload Wish payment screenshot"
              />
              {proofMsg && (
                <p className={`text-xs mt-2 font-medium ${proofMsg.includes('success') ? 'text-green-600' : 'text-red-500'}`}>
                  {proofMsg}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Items */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="font-black text-sm uppercase tracking-wider text-gray-500">Items</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {order.items?.map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3">
              <div className="w-14 h-16 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 relative">
                {item.imageSnapshotUrl ? (
                  <NextImage src={item.imageSnapshotUrl} alt={item.titleSnapshot} fill className="object-cover" sizes="56px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300"><CheckroomIcon /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{item.titleSnapshot}</p>
                <p className="text-xs text-gray-400">Size: {item.size} × {item.qty}</p>
              </div>
              <span className="font-bold text-sm">
                ${((item.salePriceSnapshot ?? item.priceSnapshot) * item.qty).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <h2 className="font-black text-sm uppercase tracking-wider text-gray-500 mb-4">Price Breakdown</h2>
        <div className="space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-bold">${Number(order.subtotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Delivery Fee</span>
            <span className={`font-bold ${Number(order.deliveryFee) === 0 ? 'text-green-600' : ''}`}>
              {Number(order.deliveryFee) === 0 ? 'FREE' : `$${Number(order.deliveryFee).toFixed(2)}`}
            </span>
          </div>
          {Number(order.discountAmount) > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Coupon {order.couponCode ? `(${order.couponCode})` : ''}</span>
              <span className="font-bold">−${Number(order.discountAmount).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-black pt-2 border-t">
            <span>Total</span>
            <span>${Number(order.total).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <h2 className="font-black text-sm uppercase tracking-wider text-gray-500 mb-4">Order Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Payment Method</p>
            <p className="font-bold">{order.paymentMethod}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Payment Status</p>
            <p className={`font-bold ${order.paymentStatus === 'PAID' ? 'text-green-600' : order.paymentStatus === 'UNDER_REVIEW' ? 'text-yellow-600' : ''}`}>
              {order.paymentStatus}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Delivery Address</p>
            <p className="font-medium">{order.customerAddress}{order.customerCity ? `, ${order.customerCity}` : ''}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Contact</p>
            <p className="font-medium">{order.customerPhone}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/shop"
          className="flex-1 bg-[#0f0f0f] text-white py-3.5 rounded-full font-bold text-sm text-center hover:bg-[#e63946] transition-colors">
          Continue Shopping
        </Link>
        <Link href="/orders"
          className="flex-1 border-2 border-gray-200 text-gray-700 py-3.5 rounded-full font-bold text-sm text-center hover:bg-gray-50 transition-colors">
          View All Orders
        </Link>
        <a href="https://wa.me/96170474719" target="_blank" rel="noopener noreferrer"
          className="flex-1 bg-green-500 text-white py-3.5 rounded-full font-bold text-sm text-center hover:bg-green-600 transition-colors inline-flex items-center justify-center gap-2">
          <WhatsAppIcon fontSize="small" /> Contact Us
        </a>
      </div>
    </div>
  )
}
