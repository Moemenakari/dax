'use client'
import { useEffect, useState, useCallback } from 'react'
import api from '../lib/api'

interface Order {
  id: number
  name: string
  phone: string
  paymentMethod: string
  paymentStatus: string
  total: number
}

export default function PaymentsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    try {
      const params: Record<string, string> = {}
      if (filter) params.paymentStatus = filter
      const res = await api.get('/orders', { params })
      setOrders(res.data)
    } catch {}
    setLoading(false)
  }, [filter])

  useEffect(() => { 
    let active = true
    if (active) fetchOrders()
    return () => { active = false }
  }, [fetchOrders])

  const updatePayment = async (orderId: number, paymentStatus: string) => {
    try {
      await api.put(`/orders/${orderId}/payment`, { paymentStatus })
      fetchOrders()
    } catch {}
  }

  const paidCount = orders.filter(o => o.paymentStatus === 'PAID').length
  const reviewCount = orders.filter(o => o.paymentStatus === 'UNDER_REVIEW').length
  const unpaidCount = orders.filter(o => o.paymentStatus === 'NOT_PAID').length
  const totalPaid = orders.filter(o => o.paymentStatus === 'PAID').reduce((s, o) => s + Number(o.total), 0)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black">Payments</h1>
        <p className="text-sm text-slate-400 mt-1">Monitor and verify payments</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-green-50 text-green-700 rounded-2xl p-5">
          <p className="text-2xl font-black">{paidCount}</p>
          <p className="text-xs font-medium">Paid</p>
        </div>
        <div className="bg-yellow-50 text-yellow-700 rounded-2xl p-5">
          <p className="text-2xl font-black">{reviewCount}</p>
          <p className="text-xs font-medium">Under Review</p>
        </div>
        <div className="bg-red-50 text-red-700 rounded-2xl p-5">
          <p className="text-2xl font-black">{unpaidCount}</p>
          <p className="text-xs font-medium">Not Paid</p>
        </div>
        <div className="bg-[#0f172a] text-white rounded-2xl p-5">
          <p className="text-2xl font-black">${totalPaid.toFixed(2)}</p>
          <p className="text-xs font-medium text-slate-300">Total Received</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['', 'NOT_PAID', 'UNDER_REVIEW', 'PAID'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${filter === f ? 'bg-[#0f172a] text-white' : 'bg-slate-100 hover:bg-slate-200'}`}>
            {f || 'All'}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Order</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Method</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Total</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-bold">#{o.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{o.name}</p>
                    <p className="text-xs text-slate-400">{o.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                      o.paymentMethod === 'COD' ? 'bg-green-100 text-green-700' : 
                      o.paymentMethod === 'WISH' ? 'bg-blue-100 text-blue-700' : 
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {o.paymentMethod}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                      o.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 
                      o.paymentStatus === 'UNDER_REVIEW' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold">${Number(o.total).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    <select
                      title="Update Payment Status"
                      value={o.paymentStatus}
                      onChange={e => updatePayment(o.id, e.target.value)}
                      className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none"
                    >
                      <option value="NOT_PAID">NOT_PAID</option>
                      <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                      <option value="PAID">PAID</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && !loading && (
          <div className="text-center py-12 text-slate-400">
            <p className="text-4xl mb-2">💳</p>
            <p className="font-medium">No orders found</p>
          </div>
        )}
      </div>
    </div>
  )
}
