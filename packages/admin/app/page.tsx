'use client'
import { useEffect, useState, useCallback } from 'react'
import api from './lib/api'
import {
  LuShirt,
  LuTag,
  LuPackage,
  LuClock,
  LuCheck,
  LuX,
  LuPartyPopper,
  LuUsers
} from 'react-icons/lu'

interface RecentOrder {
  id: number
  name: string
  phone: string
  status: string
  paymentMethod: string
  total: number
}

interface MonthlyPoint {
  month: string
  orders: number
  revenue: number
}

interface DashboardStats {
  totalProducts: number
  saleProducts: number
  totalOrders: number
  pendingOrders: number
  confirmedOrders: number
  cancelledOrders: number
  deliveredOrders: number
  totalUsers: number
  totalRevenue: number
  paidOrders: number
  underReviewOrders: number
  recentOrders: RecentOrder[]
  monthlyTrend: MonthlyPoint[]
}

function BarChart({ data, valueKey, color, label }: {
  data: MonthlyPoint[]
  valueKey: 'orders' | 'revenue'
  color: string
  label: string
}) {
  const max = Math.max(...data.map(d => Number(d[valueKey])), 1)
  return (
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{label}</p>
      <div className="flex items-end gap-2 h-28">
        {data.map((d, i) => {
          const pct = (Number(d[valueKey]) / max) * 100
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#0f172a] text-white text-[10px] font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {valueKey === 'revenue' ? `$${Number(d[valueKey]).toFixed(0)}` : d[valueKey]}
              </div>
              <div
                className={`w-full rounded-t-lg transition-all ${color}`}
                style={{ height: `${Math.max(pct, 4)}%` }}
              />
              <span className="text-[9px] text-slate-400 font-medium truncate w-full text-center">{d.month.split(' ')[0]}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function DashboardHome() {
  const [stats, setStats]   = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/dashboard/stats')
      setStats(res.data)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    let active = true
    if (active) fetchStats()
    return () => { active = false }
  }, [fetchStats])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const cards = [
    { label: 'Total Products', value: stats?.totalProducts || 0, icon: <LuShirt />, color: 'bg-blue-50 text-blue-700' },
    { label: 'Sale Products',  value: stats?.saleProducts || 0,  icon: <LuTag />,   color: 'bg-red-50 text-red-700' },
    { label: 'Total Orders',   value: stats?.totalOrders || 0,   icon: <LuPackage />, color: 'bg-purple-50 text-purple-700' },
    { label: 'Pending',        value: stats?.pendingOrders || 0, icon: <LuClock />, color: 'bg-yellow-50 text-yellow-700' },
    { label: 'Confirmed',      value: stats?.confirmedOrders || 0, icon: <LuCheck />, color: 'bg-green-50 text-green-700' },
    { label: 'Cancelled',      value: stats?.cancelledOrders || 0, icon: <LuX />,   color: 'bg-red-50 text-red-600' },
    { label: 'Delivered',      value: stats?.deliveredOrders || 0, icon: <LuPartyPopper />, color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Total Users',    value: stats?.totalUsers || 0,    icon: <LuUsers />, color: 'bg-slate-50 text-slate-700' },
  ]

  const trend = stats?.monthlyTrend || []

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">Welcome back! Here&apos;s your store overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((card, i) => (
          <div key={i} className={`${card.color} rounded-2xl p-5`}>
            <span className="text-2xl">{card.icon}</span>
            <p className="text-2xl font-black mt-2">{card.value}</p>
            <p className="text-xs font-medium opacity-70 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#0f172a] text-white rounded-2xl p-6">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Revenue</p>
          <p className="text-3xl font-black">${Number(stats?.totalRevenue || 0).toFixed(2)}</p>
        </div>
        <div className="bg-green-600 text-white rounded-2xl p-6">
          <p className="text-xs text-green-200 uppercase tracking-wider mb-1">Paid Orders</p>
          <p className="text-3xl font-black">{stats?.paidOrders || 0}</p>
        </div>
        <div className="bg-yellow-500 text-white rounded-2xl p-6">
          <p className="text-xs text-yellow-100 uppercase tracking-wider mb-1">Under Review</p>
          <p className="text-3xl font-black">{stats?.underReviewOrders || 0}</p>
        </div>
      </div>

      {/* Charts */}
      {trend.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <BarChart data={trend} valueKey="orders" color="bg-blue-500" label="Orders — Last 6 Months" />
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <BarChart data={trend} valueKey="revenue" color="bg-emerald-500" label="Revenue ($) — Last 6 Months" />
          </div>
        </div>
      )}

      {/* Order Status Breakdown */}
      {stats && stats.totalOrders > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-8">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Order Status Breakdown</p>
          <div className="space-y-3">
            {[
              { label: 'Pending',   value: stats.pendingOrders,   color: 'bg-yellow-400' },
              { label: 'Confirmed', value: stats.confirmedOrders, color: 'bg-blue-500' },
              { label: 'Delivered', value: stats.deliveredOrders, color: 'bg-emerald-500' },
              { label: 'Cancelled', value: stats.cancelledOrders, color: 'bg-red-400' },
            ].map(row => {
              const pct = stats.totalOrders > 0 ? (row.value / stats.totalOrders) * 100 : 0
              return (
                <div key={row.label}>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>{row.label}</span>
                    <span className="text-slate-500">{row.value} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${row.color} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50">
          <h2 className="font-black">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-6 py-3 font-bold text-xs text-slate-500 uppercase">#</th>
                <th className="text-left px-6 py-3 font-bold text-xs text-slate-500 uppercase">Customer</th>
                <th className="text-left px-6 py-3 font-bold text-xs text-slate-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 font-bold text-xs text-slate-500 uppercase">Payment</th>
                <th className="text-right px-6 py-3 font-bold text-xs text-slate-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recentOrders || []).map((order) => (
                <tr key={order.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                  <td className="px-6 py-3 font-bold">#{order.id}</td>
                  <td className="px-6 py-3">
                    <p className="font-medium">{order.name}</p>
                    <p className="text-xs text-slate-400">{order.phone}</p>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                      order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                      order.status === 'PENDING'   ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-xs">{order.paymentMethod}</td>
                  <td className="px-6 py-3 text-right font-bold">${Number(order.total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
