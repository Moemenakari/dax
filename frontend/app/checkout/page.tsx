'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { clearCart } from '../store/cartSlice'
import { addToast } from '../store/toastSlice'
import { useRouter } from 'next/navigation'
import api from '../lib/api'
import NextImage from 'next/image'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import LocalAtmIcon from '@mui/icons-material/LocalAtm'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'

interface DeliveryArea {
  id: number
  areaName: string
  price: number
  estimatedTime: string
}

const PAYMENT_OPTIONS = [
  {
    label: 'Cash on Delivery',
    value: 'COD',
    icon: <LocalAtmIcon fontSize="inherit" />,
    description: 'Pay when you receive your order',
  },
  {
    label: 'Order via WhatsApp',
    value: 'WHATSAPP',
    icon: <WhatsAppIcon fontSize="inherit" />,
    description: 'Place order and contact via WhatsApp',
  },
  {
    label: 'Wish / Visa Card',
    value: 'WISH',
    icon: <CreditCardIcon fontSize="inherit" />,
    description: 'Pay via Wish app and upload proof',
  },
]

export default function CheckoutPage() {
  const dispatch  = useDispatch()
  const router    = useRouter()
  const items     = useSelector((state: RootState) => state.cart.items)
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)

  const [deliveryAreas, setDeliveryAreas] = useState<DeliveryArea[]>([])
  const [selectedArea, setSelectedArea] = useState<DeliveryArea | null>(null)
  const [payment, setPayment]   = useState('COD')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [summaryOpen, setSummaryOpen] = useState(false)

  // Coupon
  const [couponInput, setCouponInput] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null)
  const [couponError, setCouponError] = useState('')

  // Wish proof upload
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string | null>(null)
  const proofInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', notes: '' })

  const fetchAreas = useCallback(async () => {
    try {
      const res = await api.get('/delivery/areas')
      setDeliveryAreas(res.data)
      if (res.data.length > 0) setSelectedArea(res.data[0])
    } catch {
      const fallback = [
        { id: 1, areaName: 'Tripoli', price: 2, estimatedTime: '24 hours' },
        { id: 2, areaName: 'Beirut', price: 3, estimatedTime: '1–2 days' },
        { id: 3, areaName: 'North Lebanon', price: 3, estimatedTime: '1–2 days' },
        { id: 4, areaName: 'Mount Lebanon', price: 3.5, estimatedTime: '2–3 days' },
        { id: 5, areaName: 'South Lebanon', price: 4, estimatedTime: '3–5 days' },
      ]
      setDeliveryAreas(fallback)
      setSelectedArea(fallback[0])
    }
  }, [])

  useEffect(() => { fetchAreas() }, [fetchAreas])

  useEffect(() => {
    if (!isAuthenticated && !loading) router.push('/login')
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    if (user) setForm(f => ({ ...f, name: f.name || user.name, phone: f.phone || user.phone }))
  }, [user])

  const subtotal = items.reduce((sum, i) => sum + Number(i.salePrice ?? i.price) * i.quantity, 0)
  const isFreeDelivery = subtotal >= 50
  const deliveryFee = isFreeDelivery ? 0 : (Number(selectedArea?.price) || 0)
  const discount = appliedCoupon?.discount || 0
  const total = Math.max(0, subtotal + deliveryFee - discount)

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return
    setCouponLoading(true)
    setCouponError('')
    setAppliedCoupon(null)
    try {
      const res = await api.post('/coupons/apply', { code: couponInput, orderTotal: subtotal + deliveryFee })
      setAppliedCoupon({ code: res.data.code, discount: res.data.discount })
      dispatch(addToast({ message: `Coupon applied! −$${res.data.discount.toFixed(2)}`, type: 'success' }))
    } catch (err: any) {
      setCouponError(err.response?.data?.message || 'Invalid coupon')
    }
    setCouponLoading(false)
  }

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setProofFile(file)
    setProofPreview(URL.createObjectURL(file))
  }

  const placeOrder = async () => {
    let wishProofUrl: string | undefined

    // Upload wish proof if provided
    if (payment === 'WISH' && proofFile) {
      const formData = new FormData()
      formData.append('image', proofFile)
      try {
        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        wishProofUrl = uploadRes.data.url
      } catch {
        // Proof upload failed — proceed without it, can upload later
      }
    }

    const res = await api.post('/orders', {
      items: items.map(i => ({
        productId: i.productId,
        title:     i.title,
        price:     i.price,
        salePrice: i.salePrice,
        size:      i.size,
        qty:       i.quantity,
        image:     i.image,
      })),
      deliveryAreaId:  selectedArea?.id,
      deliveryFee,
      paymentMethod:   payment === 'WHATSAPP' ? 'COD' : payment,
      subtotal,
      total,
      couponCode:      appliedCoupon?.code || null,
      discountAmount:  discount,
      wishProofUrl:    wishProofUrl || null,
      customerName:    form.name,
      customerPhone:   form.phone,
      customerAddress: form.address,
      customerCity:    form.city,
      notes:           form.notes,
    })
    return res.data.orderId
  }

  const handleOrder = async () => {
    if (!form.name || !form.phone || !form.address) {
      setError('Please fill in all required fields')
      return
    }
    if (!isAuthenticated) { setError('Please login to place an order'); return }

    setLoading(true)
    setError('')
    try {
      const orderId = await placeOrder()

      if (payment === 'WHATSAPP') {
        const itemsList = items.map(i =>
          `• ${i.title} (${i.size}) x${i.quantity} - $${((i.salePrice ?? i.price) * i.quantity).toFixed(2)}`
        ).join('\n')
        const message = `New order from DAX!\n\nItems:\n${itemsList}\n\nSubtotal: $${subtotal.toFixed(2)}${discount > 0 ? `\nDiscount: -$${discount.toFixed(2)}` : ''}\nDelivery: $${deliveryFee.toFixed(2)}\nTotal: $${total.toFixed(2)}\nDelivery to: ${selectedArea?.areaName || 'Standard'}\n\nCustomer: ${form.name}\nPhone: ${form.phone}\nAddress: ${form.address}`
        window.open(`https://wa.me/96170474719?text=${encodeURIComponent(message)}`, '_blank')
      }

      dispatch(clearCart())
      dispatch(addToast({ message: 'Order placed successfully! 🎉', type: 'success' }))
      router.push(`/orders/${orderId}`)
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to place order. Please try again.'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center px-4">
        <div className="text-gray-300 mb-4 flex justify-center"><ShoppingCartIcon sx={{ fontSize: 72 }} /></div>
        <h2 className="text-2xl font-black mb-3">No items to checkout</h2>
        <p className="text-gray-500 mb-6">Add some products to your cart first.</p>
        <button type="button" onClick={() => router.push('/shop')} className="bg-[#0f0f0f] text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-[#e63946] transition-colors">
          Go to Shop
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
      <h1 className="text-3xl md:text-4xl font-black mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

        {/* Left: Forms */}
        <div className="lg:col-span-2 space-y-5 md:space-y-6">

          {/* Contact Info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6">
            <h2 className="font-black text-lg mb-4 md:mb-5 flex items-center gap-2">
              <span className="w-7 h-7 bg-[#0f0f0f] text-white text-xs rounded-full flex items-center justify-center font-bold">1</span>
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <input placeholder="Full Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 md:py-3.5 text-sm font-medium focus:outline-none focus:border-[#0f0f0f] transition-colors" />
              <input placeholder="Phone Number *" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 md:py-3.5 text-sm font-medium focus:outline-none focus:border-[#0f0f0f] transition-colors" />
              <input placeholder="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 md:py-3.5 text-sm font-medium focus:outline-none focus:border-[#0f0f0f] transition-colors md:col-span-2" />
              <textarea placeholder="Delivery Address *" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                rows={2} className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 md:py-3.5 text-sm font-medium focus:outline-none focus:border-[#0f0f0f] transition-colors md:col-span-2 resize-none" />
              <textarea placeholder="Notes (optional)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                rows={2} className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 md:py-3.5 text-sm font-medium focus:outline-none focus:border-[#0f0f0f] transition-colors md:col-span-2 resize-none" />
            </div>
          </div>

          {/* Delivery */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6">
            <h2 className="font-black text-lg mb-4 md:mb-5 flex items-center gap-2">
              <span className="w-7 h-7 bg-[#0f0f0f] text-white text-xs rounded-full flex items-center justify-center font-bold">2</span>
              Delivery Area
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
              {deliveryAreas.map(area => (
                <button type="button" key={area.id} onClick={() => setSelectedArea(area)}
                  className={`flex items-center justify-between px-3 md:px-4 py-2 md:py-3.5 rounded-xl border-2 font-medium text-sm transition-all
                    ${selectedArea?.id === area.id ? 'border-[#0f0f0f] bg-[#0f0f0f] text-white' : 'border-gray-100 hover:border-gray-300'}`}>
                  <div className="text-left flex items-center gap-2">
                    <LocalShippingIcon sx={{ fontSize: 18 }} />
                    <div>
                      <span className="block font-bold text-xs md:text-sm">{area.areaName}</span>
                      <span className={`text-[10px] md:text-xs ${selectedArea?.id === area.id ? 'text-gray-300' : 'text-gray-400'}`}>{area.estimatedTime}</span>
                    </div>
                  </div>
                  <span className="font-bold text-sm">${area.price}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6">
            <h2 className="font-black text-lg mb-4 md:mb-5 flex items-center gap-2">
              <span className="w-7 h-7 bg-[#0f0f0f] text-white text-xs rounded-full flex items-center justify-center font-bold">3</span>
              Payment Method
            </h2>
            <div className="flex flex-col gap-2 md:gap-3">
              {PAYMENT_OPTIONS.map(opt => (
                <button type="button" key={opt.value} onClick={() => setPayment(opt.value)}
                  className={`w-full flex items-center gap-3 md:gap-4 px-3 md:px-4 py-3 md:py-4 rounded-xl border-2 text-left transition-all
                    ${payment === opt.value ? 'border-[#0f0f0f] bg-[#0f0f0f] text-white' : 'border-gray-100 hover:border-gray-300'}`}>
                  <span className="text-xl md:text-2xl">{opt.icon}</span>
                  <div>
                    <span className="block font-bold text-sm">{opt.label}</span>
                    <span className={`text-xs ${payment === opt.value ? 'text-gray-300' : 'text-gray-400'}`}>{opt.description}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Wish payment proof upload */}
            {payment === 'WISH' && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="font-bold text-sm text-blue-800 mb-2">How to pay with Wish</p>
                <ol className="text-xs text-blue-700 space-y-1 mb-4 list-decimal list-inside">
                  <li>Open your Wish app and send the payment to our account</li>
                  <li>Take a screenshot of your payment confirmation</li>
                  <li>Upload the screenshot below (optional — you can also upload from the order page)</li>
                </ol>
                <div
                  onClick={() => proofInputRef.current?.click()}
                  className="border-2 border-dashed border-blue-300 rounded-xl p-4 text-center cursor-pointer hover:bg-blue-100 transition-colors"
                >
                  {proofPreview ? (
                    <div className="relative w-full max-w-xs mx-auto">
                      <NextImage src={proofPreview} alt="Proof" width={200} height={120} className="rounded-lg mx-auto object-cover" />
                      <p className="text-xs text-blue-600 mt-2 font-medium">✓ Screenshot selected</p>
                    </div>
                  ) : (
                    <>
                      <CloudUploadIcon sx={{ fontSize: 32, color: '#3b82f6' }} />
                      <p className="text-sm text-blue-700 font-medium mt-1">Upload payment screenshot</p>
                      <p className="text-xs text-blue-500">JPG, PNG up to 5MB</p>
                    </>
                  )}
                </div>
                <input ref={proofInputRef} type="file" accept="image/*" onChange={handleProofChange} className="hidden" title="Upload payment screenshot" />
              </div>
            )}

            {/* WhatsApp info */}
            {payment === 'WHATSAPP' && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <WhatsAppIcon sx={{ fontSize: 24, color: '#166534', flexShrink: 0 }} />
                  <div>
                    <p className="font-bold text-sm text-green-800 mb-1">Order via WhatsApp</p>
                    <p className="text-xs text-green-600 leading-relaxed">
                      Your order will be saved and you&apos;ll be redirected to WhatsApp to confirm with our team.
                      Payment will be arranged on delivery.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Coupon Code */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6">
            <h2 className="font-black text-lg mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-[#0f0f0f] text-white text-xs rounded-full flex items-center justify-center font-bold">4</span>
              Coupon Code
            </h2>
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <LocalOfferIcon sx={{ fontSize: 18, color: '#16a34a' }} />
                  <span className="text-sm font-bold text-green-800">{appliedCoupon.code}</span>
                  <span className="text-sm text-green-700">−${appliedCoupon.discount.toFixed(2)}</span>
                </div>
                <button type="button" onClick={() => { setAppliedCoupon(null); setCouponInput('') }}
                  className="text-xs text-red-500 font-bold hover:underline">Remove</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  placeholder="Enter coupon code"
                  value={couponInput}
                  onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError('') }}
                  className="flex-1 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#0f0f0f] transition-colors uppercase"
                />
                <button type="button" onClick={handleApplyCoupon} disabled={couponLoading || !couponInput.trim()}
                  className="bg-[#0f0f0f] text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-[#e63946] transition-colors disabled:opacity-50">
                  {couponLoading ? '...' : 'Apply'}
                </button>
              </div>
            )}
            {couponError && <p className="text-red-500 text-xs mt-2 font-medium">{couponError}</p>}
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-2xl p-4 md:p-6 sticky top-28">
            <button type="button" className="w-full flex items-center justify-between lg:pointer-events-none"
              onClick={() => setSummaryOpen(!summaryOpen)}>
              <h2 className="font-black text-lg">Order Summary</h2>
              <ExpandMoreIcon className={`lg:hidden transition-transform ${summaryOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className={`${summaryOpen ? 'block' : 'hidden'} lg:block mt-4 lg:mt-5`}>
              <div className="space-y-3 mb-5">
                {items.map(item => (
                  <div key={`${item.productId}-${item.size}`} className="flex items-center gap-3">
                    <div className="w-12 h-14 md:w-14 md:h-16 rounded-lg overflow-hidden bg-white flex-shrink-0 relative">
                      {item.image ? (
                        <NextImage src={item.image} alt={item.title} fill className="object-cover" sizes="60px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300"><CheckroomIcon sx={{ fontSize: 24 }} /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-gray-400">Size: {item.size} × {item.quantity}</p>
                    </div>
                    <span className="font-bold text-sm">${((item.salePrice ?? item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2.5 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-bold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery ({selectedArea?.areaName})</span>
                  <div className="text-right">
                    {isFreeDelivery && <span className="text-xs text-gray-400 line-through mr-2">${(Number(selectedArea?.price) || 0).toFixed(2)}</span>}
                    <span className={`font-bold ${isFreeDelivery ? 'text-green-600' : ''}`}>
                      {isFreeDelivery ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Coupon ({appliedCoupon?.code})</span>
                    <span className="font-bold">−${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-xl pt-2 border-t">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {error && <p className="text-red-600 text-sm font-medium text-center mb-4 bg-red-50 rounded-xl p-3">{error}</p>}

            {!isAuthenticated && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 text-center">
                <p className="text-xs text-yellow-700 mb-2">Please login to place your order</p>
                <button type="button" onClick={() => router.push('/login')} className="text-xs font-bold text-yellow-800 hover:underline">
                  Login / Sign Up →
                </button>
              </div>
            )}

            {payment === 'WHATSAPP' ? (
              <button type="button" onClick={handleOrder} disabled={loading || !isAuthenticated}
                className="w-full bg-green-500 text-white py-4 rounded-full font-bold text-sm hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <WhatsAppIcon fontSize="small" />
                {loading ? 'Placing...' : `Order via WhatsApp — $${total.toFixed(2)}`}
              </button>
            ) : (
              <button type="button" onClick={handleOrder} disabled={loading || !isAuthenticated}
                className="w-full bg-[#0f0f0f] text-white py-4 rounded-full font-bold text-sm hover:bg-[#e63946] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Placing Order...' : payment === 'WISH' ? `Pay $${total.toFixed(2)}` : `Place Order — $${total.toFixed(2)}`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
