'use client'
import { useEffect, useState, useCallback } from 'react'
import api from '../lib/api'
import { LuPlus, LuTrash2, LuToggleLeft, LuToggleRight, LuCopy } from 'react-icons/lu'

interface Coupon {
  id: number
  code: string
  discountType: 'PERCENTAGE' | 'FIXED'
  discountValue: number
  minOrderAmount: number
  maxUses: number | null
  usedCount: number
  expiresAt: string | null
  isActive: boolean
  createdAt: string
}

const EMPTY_FORM = {
  code: '',
  discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
  discountValue: '',
  minOrderAmount: '',
  maxUses: '',
  expiresAt: '',
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const fetchCoupons = useCallback(async () => {
    try {
      const res = await api.get('/coupons')
      setCoupons(res.data)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { fetchCoupons() }, [fetchCoupons])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    try {
      await api.post('/coupons', {
        code: form.code,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderAmount: Number(form.minOrderAmount) || 0,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        expiresAt: form.expiresAt || null,
      })
      setMsg('Coupon created!')
      setForm(EMPTY_FORM)
      setShowForm(false)
      fetchCoupons()
    } catch (err: any) {
      setMsg(err.response?.data?.message || 'Error creating coupon')
    }
    setSaving(false)
  }

  const handleToggle = async (coupon: Coupon) => {
    try {
      await api.put(`/coupons/${coupon.id}`, { ...coupon, isActive: !coupon.isActive })
      fetchCoupons()
    } catch {}
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this coupon?')) return
    try {
      await api.delete(`/coupons/${id}`)
      fetchCoupons()
    } catch {}
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  if (loading) return <div className="animate-pulse h-64 bg-white rounded-2xl" />

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black">Coupons</h1>
          <p className="text-sm text-slate-400 mt-1">Create and manage discount codes</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#0f172a] text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-[#e63946] transition-colors"
        >
          <LuPlus /> New Coupon
        </button>
      </div>

      {msg && (
        <div className={`rounded-xl p-3 text-sm font-medium mb-4 ${msg.includes('Error') || msg.includes('error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {msg}
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-slate-100 p-6 mb-6">
          <h2 className="font-black mb-4">New Coupon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">Code *</label>
              <input
                placeholder="e.g. SUMMER20"
                value={form.code}
                onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                required
                className="w-full border-2 border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold tracking-wider focus:outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">Discount Type</label>
              <select
                value={form.discountType}
                onChange={e => setForm({ ...form, discountType: e.target.value as 'PERCENTAGE' | 'FIXED' })}
                className="w-full border-2 border-slate-100 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-slate-900"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount ($)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">
                Discount Value * {form.discountType === 'PERCENTAGE' ? '(%)' : '($)'}
              </label>
              <input
                type="number"
                placeholder={form.discountType === 'PERCENTAGE' ? '20' : '5.00'}
                value={form.discountValue}
                onChange={e => setForm({ ...form, discountValue: e.target.value })}
                required min="0"
                className="w-full border-2 border-slate-100 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">Min Order Amount ($)</label>
              <input
                type="number"
                placeholder="0"
                value={form.minOrderAmount}
                onChange={e => setForm({ ...form, minOrderAmount: e.target.value })}
                min="0"
                className="w-full border-2 border-slate-100 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">Max Uses (leave empty = unlimited)</label>
              <input
                type="number"
                placeholder="Unlimited"
                value={form.maxUses}
                onChange={e => setForm({ ...form, maxUses: e.target.value })}
                min="1"
                className="w-full border-2 border-slate-100 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">Expires At (leave empty = no expiry)</label>
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={e => setForm({ ...form, expiresAt: e.target.value })}
                className="w-full border-2 border-slate-100 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" disabled={saving}
              className="bg-[#0f172a] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#e63946] transition-colors disabled:opacity-50">
              {saving ? 'Creating...' : 'Create Coupon'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="border-2 border-slate-100 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {coupons.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <p className="text-4xl mb-3">🎟️</p>
            <p className="font-bold">No coupons yet</p>
            <p className="text-sm">Create your first coupon code above</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-6 py-3 font-bold text-xs text-slate-500 uppercase">Code</th>
                  <th className="text-left px-6 py-3 font-bold text-xs text-slate-500 uppercase">Discount</th>
                  <th className="text-left px-6 py-3 font-bold text-xs text-slate-500 uppercase">Min Order</th>
                  <th className="text-left px-6 py-3 font-bold text-xs text-slate-500 uppercase">Uses</th>
                  <th className="text-left px-6 py-3 font-bold text-xs text-slate-500 uppercase">Expires</th>
                  <th className="text-left px-6 py-3 font-bold text-xs text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody>
                {coupons.map(c => (
                  <tr key={c.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-black tracking-wider text-[#0f172a]">{c.code}</span>
                        <button type="button" onClick={() => copyCode(c.code)} title="Copy code"
                          className="text-slate-400 hover:text-slate-700 transition-colors">
                          <LuCopy size={13} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${c.discountType === 'PERCENTAGE' ? 'bg-purple-50 text-purple-700' : 'bg-green-50 text-green-700'}`}>
                        {c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `$${c.discountValue}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{Number(c.minOrderAmount) > 0 ? `$${c.minOrderAmount}` : '—'}</td>
                    <td className="px-6 py-4">
                      <span className="text-slate-600">{c.usedCount}</span>
                      {c.maxUses && <span className="text-slate-400"> / {c.maxUses}</span>}
                      {!c.maxUses && <span className="text-slate-400"> / ∞</span>}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <button type="button" onClick={() => handleToggle(c)} title={c.isActive ? 'Deactivate' : 'Activate'}
                        className="transition-colors">
                        {c.isActive
                          ? <LuToggleRight size={24} className="text-green-500" />
                          : <LuToggleLeft size={24} className="text-slate-300" />}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button type="button" onClick={() => handleDelete(c.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors">
                        <LuTrash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
