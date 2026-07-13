'use client'
import { useEffect, useState, useCallback } from 'react'
import api from '../lib/api'
import { LuSettings, LuSave, LuStore, LuPhone, LuMail, LuMapPin, LuDollarSign } from 'react-icons/lu'

interface Settings {
  id: number
  storeName: string
  storePhone: string
  storeEmail: string
  storeAddress: string
  currency: string
  deliveryFee: number
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    id: 1,
    storeName: '',
    storePhone: '',
    storeEmail: '',
    storeAddress: '',
    currency: 'USD',
    deliveryFee: 0
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const fetchSettings = useCallback(async () => {
    try {
      const res = await api.get('/settings')
      if (res.data) setSettings(res.data)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { 
    fetchSettings()
  }, [fetchSettings])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      await api.put('/settings', settings)
      setMessage('✅ Settings updated successfully!')
    } catch {
      setMessage('❌ Failed to update settings.')
    }
    setSaving(false)
  }

  if (loading) return <div className="p-8 text-center text-slate-400 animate-pulse">Loading settings...</div>

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-[#0f172a]">Store Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Configure your store general information and defaults</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-slate-900 font-bold border-b border-slate-50 pb-4">
            <LuStore className="text-[#e63946]" />
            <span>Store Information</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider">Store Name</label>
              <div className="relative">
                <LuStore className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                <input 
                  title="Store Name"
                  type="text"
                  value={settings.storeName}
                  onChange={e => setSettings({...settings, storeName: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider">Contact Phone</label>
              <div className="relative">
                <LuPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                <input 
                  title="Contact Phone"
                  type="text"
                  value={settings.storePhone}
                  onChange={e => setSettings({...settings, storePhone: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider">Contact Email</label>
              <div className="relative">
                <LuMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                <input 
                  title="Contact Email"
                  type="email"
                  value={settings.storeEmail}
                  onChange={e => setSettings({...settings, storeEmail: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider">Store Address</label>
              <div className="relative">
                <LuMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                <input 
                  title="Store Address"
                  type="text"
                  value={settings.storeAddress}
                  onChange={e => setSettings({...settings, storeAddress: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider">Currency Symbol</label>
              <div className="relative">
                <LuDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                <input 
                  title="Currency Symbol"
                  type="text"
                  value={settings.currency}
                  onChange={e => setSettings({...settings, currency: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider">Base Delivery Fee</label>
            <input 
              title="Delivery Fee"
              type="number"
              value={settings.deliveryFee}
              onChange={e => setSettings({...settings, deliveryFee: Number(e.target.value)})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
            />
            <p className="text-[10px] text-slate-400 mt-2 italic">* This is the default fee. You can manage specific regions in the <a href="/delivery" className="underline font-bold">Delivery</a> page.</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-bold">{message}</p>
          <button 
            type="submit"
            disabled={saving}
            className="bg-[#0f172a] text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-900/20 disabled:opacity-50"
          >
            <LuSave />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
