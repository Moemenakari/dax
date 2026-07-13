'use client'
import { useEffect, useState, useCallback } from 'react'
import api from '../lib/api'
import { LuUsers, LuSearch, LuExternalLink } from 'react-icons/lu'
import Link from 'next/link'

interface User {
  id: number
  name: string
  phone: string
  email: string
  address: string | null
  role: string
  totalOrders: number
  created_at: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/admin/users')
      setUsers(res.data)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { 
    fetchUsers()
  }, [fetchUsers])

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.phone?.includes(search)
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-[#0f172a]">Users Management</h1>
        <p className="text-sm text-slate-400 mt-1">View and manage all registered customers</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              title="Search users"
              placeholder="Search by name or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
            />
          </div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Users: {users.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-6 py-4 font-bold text-xs text-slate-500 uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-4 font-bold text-xs text-slate-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-4 font-bold text-xs text-slate-500 uppercase tracking-wider">Orders</th>
                <th className="text-left px-6 py-4 font-bold text-xs text-slate-500 uppercase tracking-wider">Joined</th>
                <th className="text-right px-6 py-4 font-bold text-xs text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400 animate-pulse">Loading users...</td>
                </tr>
              ) : filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0f172a] text-white flex items-center justify-center text-xs font-bold">
                        {user.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                      user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <span className="font-bold text-slate-700">{user.totalOrders}</span>
                       <span className="text-[10px] text-slate-400 font-medium">Orders</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right underline-offset-4">
                    <Link href={`/orders?phone=${user.phone}`} className="text-[#0f172a] hover:underline font-bold text-xs flex items-center justify-end gap-1">
                      View Orders <LuExternalLink size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
              {!loading && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
