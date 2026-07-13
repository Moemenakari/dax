'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import api from '../lib/api'

type Mode = 'login' | 'signup' | 'forgot' | 'reset'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [message, setMessage] = useState('')

  const [form, setForm] = useState({
    name: '', phone: '', password: '', confirmPassword: '', newPassword: ''
  })

  const passwordsMatch = mode === 'signup' 
    ? (form.password && form.confirmPassword && form.password === form.confirmPassword)
    : (form.newPassword && form.confirmPassword && form.newPassword === form.confirmPassword)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
    setMessage('')
  }

  const handleSubmit = async () => {
    setError('')
    setMessage('')

    if (mode === 'signup') {
      if (!form.name) return setError('Full Name is required')
      if (!/^\d{8}$/.test(form.phone)) return setError('Phone must be exactly 8 digits')
      if (form.password !== form.confirmPassword) return setError('Passwords do not match')
    }

    if (mode === 'login' && !form.phone) return setError('Phone is required')
    if (mode === 'forgot' && !/^\d{8}$/.test(form.phone)) return setError('Enter 8-digit phone number')

    setLoading(true)
    try {
      if (mode === 'login') {
        await api.post('/auth/login', {
          phone: form.phone,
          password: form.password,
        })
        router.push('/')
        router.refresh()
      } else if (mode === 'signup') {
        await api.post('/auth/register', {
          name: form.name,
          phone: form.phone,
          password: form.password,
        })
        router.push('/')
        router.refresh()
      } else if (mode === 'forgot') {
        await api.post('/auth/forgot-password', { phone: form.phone })
        setMode('reset')
        setMessage('User found. Please enter your new password.')
      } else if (mode === 'reset') {
        if (!passwordsMatch) return setError('Passwords do not match')
        await api.post('/auth/reset-password', { 
          phone: form.phone, 
          newPassword: form.newPassword 
        })
        setMode('login')
        setMessage('Password reset successfully! Log in with your new password.')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-sm p-8 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-black">
            DA<span className="text-red-600">X</span>
          </Link>
          <p className="text-gray-400 text-sm mt-2">
            {mode === 'login' && 'Welcome back'}
            {mode === 'signup' && 'Create your account'}
            {mode === 'forgot' && 'Reset your password'}
            {mode === 'reset' && 'Set new password'}
          </p>
        </div>

        {/* Toggle */}
        {(mode === 'login' || mode === 'signup') && (
          <div className="flex bg-gray-100 rounded-full p-1 mb-6">
            <button
              onClick={() => { setMode('login'); setError(''); setMessage('') }}
              className={`flex-1 py-2 rounded-full text-sm font-bold transition-colors
                ${mode === 'login' ? 'bg-black text-white' : 'text-gray-500'}`}>
              Login
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); setMessage('') }}
              className={`flex-1 py-2 rounded-full text-sm font-bold transition-colors
                ${mode === 'signup' ? 'bg-black text-white' : 'text-gray-500'}`}>
              Sign Up
            </button>
          </div>
        )}

        {/* Form */}
        <div className="flex flex-col gap-4">
          {mode === 'signup' && (
            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-black transition-colors"
            />
          )}

          {(mode === 'login' || mode === 'signup' || mode === 'forgot') && (
            <input
              name="phone"
              placeholder="Phone Number (8 digits)"
              value={form.phone}
              onChange={handleChange}
              maxLength={8}
              className="border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-black transition-colors"
            />
          )}

          {mode === 'login' && (
            <input
              name="password"
              type="text"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-black transition-colors"
            />
          )}

          {mode === 'signup' && (
            <>
              <input
                name="password"
                type="text"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-black transition-colors"
              />
              <input
                name="confirmPassword"
                type="text"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                className={`border-2 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none transition-colors
                  ${form.confirmPassword
                    ? passwordsMatch
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-400'
                    : 'border-gray-100 focus:border-black'
                  }`}
              />
            </>
          )}

          {mode === 'reset' && (
            <>
              <input
                name="newPassword"
                type="text"
                placeholder="New Password"
                value={form.newPassword}
                onChange={handleChange}
                className="border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-black transition-colors"
              />
              <input
                name="confirmPassword"
                type="text"
                placeholder="Confirm New Password"
                value={form.confirmPassword}
                onChange={handleChange}
                className={`border-2 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none transition-colors
                  ${form.confirmPassword
                    ? passwordsMatch
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-400'
                    : 'border-gray-100 focus:border-black'
                  }`}
              />
            </>
          )}

          {/* Password match indicator */}
          {(mode === 'signup' || mode === 'reset') && form.confirmPassword && (
            <p className={`text-xs font-bold ${passwordsMatch ? 'text-green-500' : 'text-red-500'}`}>
              {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
            </p>
          )}

          {mode === 'login' && (
            <div className="text-right">
              <button 
                onClick={() => setMode('forgot')}
                className="text-xs font-bold text-gray-400 hover:text-black transition-colors"
              >
                Forgot password?
              </button>
            </div>
          )}

          {error && (
            <p className="text-red-600 text-sm font-medium text-center">{error}</p>
          )}
          {message && (
            <p className="text-green-600 text-sm font-medium text-center">{message}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || ((mode === 'signup' || mode === 'reset') && !passwordsMatch)}
            className="bg-black text-white py-3 rounded-full font-bold hover:bg-red-600 transition-colors disabled:opacity-40">
            {loading ? 'Please wait...' : 
              mode === 'login' ? 'Login' : 
              mode === 'signup' ? 'Create Account' :
              mode === 'forgot' ? 'Continue' : 'Reset Password'
            }
          </button>

          {(mode === 'forgot' || mode === 'reset') && (
            <button 
              onClick={() => setMode('login')}
              className="text-sm font-bold text-gray-500 hover:text-black transition-colors text-center"
            >
              Back to Login
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
