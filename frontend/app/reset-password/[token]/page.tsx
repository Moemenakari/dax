'use client'
import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import api from '../../lib/api'
import Link from 'next/link'

export default function ResetPasswordPage({ params: paramsPromise }: { params: Promise<{ token: string }> }) {
  const params = use(paramsPromise)
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/reset-password', { token: params.token, newPassword: password })
      setSuccess(true)
      setTimeout(() => router.push('/login'), 2500)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired link')
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-5xl mb-4">✅</p>
          <h2 className="text-2xl font-black mb-2">Password Reset!</h2>
          <p className="text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-black">DA<span className="text-[#e63946]">X</span></Link>
          <p className="text-gray-500 text-sm mt-2">Set your new password</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4 shadow-sm">
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1.5 block">New Password</label>
            <input
              type="password"
              placeholder="Min 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0f0f0f] transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1.5 block">Confirm Password</label>
            <input
              type="password"
              placeholder="Repeat password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0f0f0f] transition-colors"
            />
          </div>
          {error && <p className="text-red-500 text-xs font-medium text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0f0f0f] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#e63946] transition-colors disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-4">
          <Link href="/login" className="text-[#e63946] font-bold hover:underline">Back to Login</Link>
        </p>
      </div>
    </div>
  )
}
