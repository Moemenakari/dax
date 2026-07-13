'use client'
import { Inter } from 'next/font/google'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import api from './lib/api'
import './globals.css'
import {
  LuLayoutDashboard,
  LuShirt,
  LuPackage,
  LuClipboardCheck,
  LuUsers,
  LuTag,
  LuTruck,
  LuLayoutGrid,
  LuSettings,
  LuLogOut,
  LuMenu,
  LuX,
  LuTicket,
  LuCreditCard
} from 'react-icons/lu'

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800', '900'] })

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: <LuLayoutDashboard /> },
  { label: 'Products', href: '/products', icon: <LuShirt /> },
  { label: 'Orders', href: '/orders', icon: <LuPackage /> },
  { label: 'To-Do', href: '/todo', icon: <LuClipboardCheck /> },
  { label: 'Users', href: '/users', icon: <LuUsers /> },
  { label: 'Sales', href: '/sales', icon: <LuTag /> },
  { label: 'Delivery', href: '/delivery', icon: <LuTruck /> },
  { label: 'Coupons', href: '/coupons', icon: <LuTicket /> },
  { label: 'Payments', href: '/payments', icon: <LuCreditCard /> },
  { label: 'Homepage', href: '/homepage', icon: <LuLayoutGrid /> },
  { label: 'Settings', href: '/settings', icon: <LuSettings /> },
]

interface Admin {
  id: number
  name: string
  phone: string
  role: 'ADMIN'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  // Skip auth check on the login page itself
  const isLoginPage = pathname === '/login'

  useEffect(() => {
    if (isLoginPage) { setAuthLoading(false); return }
    let active = true
    api.get('/auth/me')
      .then(res => {
        if (!active) return
        if (res.data?.role === 'ADMIN') setAdmin(res.data)
        else router.replace('/login')
      })
      .catch(() => { if (active) router.replace('/login') })
      .finally(() => { if (active) setAuthLoading(false) })
    return () => { active = false }
  }, [isLoginPage, router])

  const handleLogout = async () => {
    try { await api.post('/auth/logout') } catch {}
    setAdmin(null)
    router.replace('/login')
  }

  // Login page — render without sidebar
  if (isLoginPage) {
    return (
      <html lang="en">
        <head><title>DAX Admin — Login</title></head>
        <body className={inter.className}>{children}</body>
      </html>
    )
  }

  // Loading spinner
  if (authLoading || !admin) {
    return (
      <html lang="en">
        <body className={inter.className}>
          <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        </body>
      </html>
    )
  }

  return (
    <html lang="en">
      <head>
        <title>DAX Admin Dashboard</title>
      </head>
      <body className={inter.className}>
        <div className="flex min-h-screen">
          
          {/* Sidebar - Desktop */}
          <aside className="hidden md:flex flex-col w-60 bg-[#0f172a] text-white fixed inset-y-0 left-0 z-40">
            <div className="px-6 py-6 border-b border-white/10">
              <p className="text-xl font-black">DA<span className="text-[#e63946]">X</span></p>
              <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider">Admin Panel</p>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map(item => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-3 mb-3 px-2">
                <div className="w-8 h-8 bg-[#e63946] rounded-full flex items-center justify-center text-xs font-bold">
                  {admin?.name?.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{admin?.name}</p>
                  <p className="text-[10px] text-slate-400">Admin</p>
                </div>
              </div>
              <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-xs text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5 flex items-center gap-2">
                <LuLogOut /> Logout
              </button>
            </div>
          </aside>

          {/* Mobile Header */}
          <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0f172a] text-white px-4 py-3 flex items-center justify-between">
            <p className="text-lg font-black">DA<span className="text-[#e63946]">X</span> <span className="text-xs text-slate-400 font-normal">Admin</span></p>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
              {sidebarOpen ? <LuX size={20} /> : <LuMenu size={20} />}
            </button>
          </div>

          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div className="md:hidden fixed inset-0 z-40" onClick={() => setSidebarOpen(false)}>
              <div className="absolute inset-0 bg-black/50" />
              <aside className="absolute left-0 top-0 bottom-0 w-64 bg-[#0f172a] pt-16 px-3 py-4" onClick={e => e.stopPropagation()}>
                <nav className="space-y-1">
                  {NAV_ITEMS.map(item => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
                </nav>
                <button onClick={handleLogout} className="mt-4 w-full text-left px-3 py-2 text-xs text-slate-400 hover:text-red-400 flex items-center gap-2">
                  <LuLogOut /> Logout
                </button>
              </aside>
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1 md:ml-60 pt-14 md:pt-0 flex flex-col min-h-screen">
            <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full fade-in">
              {children}
            </div>
            
            {/* White Footer */}
            <footer className="bg-white border-t border-slate-100 py-6 px-4 md:px-8 text-center text-xs text-slate-400 font-medium">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
                <p>© 2026 DAX. All rights reserved.</p>
                <div className="flex items-center gap-6">
                  <a href="#" className="hover:text-slate-600 transition-colors">Documentation</a>
                  <a href="#" className="hover:text-slate-600 transition-colors">Support</a>
                </div>
              </div>
            </footer>
          </main>
        </div>
      </body>
    </html>
  )
}

