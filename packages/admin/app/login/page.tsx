'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '../lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [phone, setPhone]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [checking, setChecking] = useState(true)

  // If already logged in as admin → go to dashboard
  useEffect(() => {
    api.get('/auth/me')
      .then(res => { if (res.data?.role === 'ADMIN') router.replace('/') })
      .catch(() => {})
      .finally(() => setChecking(false))
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone || !password) { setError('Please fill in all fields'); return }
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', { phone, password })
      if (res.data.user?.role !== 'ADMIN') {
        setError('Access denied. Admin accounts only.')
        return
      }
      router.replace('/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid phone or password')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0f172a] flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#e63946]/10" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-white/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-white/5" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <p className="text-3xl font-black text-white tracking-tight">
            DA<span className="text-[#e63946]">X</span>
          </p>
          <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest">Admin Panel</p>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Manage your<br />
            store with<br />
            <span className="text-[#e63946]">confidence.</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
            Full control over products, orders, deliveries, and customer experience — all in one place.
          </p>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { label: 'Products', value: 'Manage' },
            { label: 'Orders',   value: 'Track' },
            { label: 'Revenue',  value: 'Monitor' },
          ].map(s => (
            <div key={s.label} className="border border-white/10 rounded-xl p-4">
              <p className="text-white font-black text-sm">{s.value}</p>
              <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <p className="text-3xl font-black">DA<span className="text-[#e63946]">X</span></p>
            <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest">Admin Panel</p>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-black text-slate-900">Welcome back</h1>
            <p className="text-slate-400 text-sm mt-1">Sign in to your admin account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => { setPhone(e.target.value); setError('') }}
                placeholder="e.g. 71234567"
                autoComplete="tel"
                autoFocus
                className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-900 placeholder-slate-300 focus:outline-none focus:border-[#0f172a] transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-900 placeholder-slate-300 focus:outline-none focus:border-[#0f172a] transition-colors"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
                <span className="text-red-500 text-sm">⚠</span>
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0f172a] text-white py-4 rounded-xl font-bold text-sm hover:bg-[#e63946] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-8">
            DAX Store Admin &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>

    </div>
  )
}
