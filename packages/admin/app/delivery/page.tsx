'use client'
import { useEffect, useState, useCallback, useMemo } from 'react'
import api from '../lib/api'
import NextImage from 'next/image'

interface DeliveryCompany {
  id: number
  name: string
  logo: string | null
  description: string | null
}

interface DeliveryArea {
  id: number
  companyId: number | null
  companyName?: string
  areaName: string
  price: number
  estimatedTime: string
}

export default function DeliveryPage() {
  const [companies, setCompanies] = useState<DeliveryCompany[]>([])
  const [areas, setAreas] = useState<DeliveryArea[]>([])
  const [loading, setLoading] = useState(true)
  const [showCompanyForm, setShowCompanyForm] = useState(false)
  const [showAreaForm, setShowAreaForm] = useState(false)
  const [editingArea, setEditingArea] = useState<DeliveryArea | null>(null)
  const [companyForm, setCompanyForm] = useState({ name: '', logo: '', description: '' })
  const [areaForm, setAreaForm] = useState({ companyId: '', areaName: '', price: '', estimatedTime: '' })

  const fetchData = useCallback(async () => {
    try {
      const [cRes, aRes] = await Promise.all([
        api.get('/delivery/companies'),
        api.get('/delivery/areas'),
      ])
      setCompanies(cRes.data)
      setAreas(aRes.data)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { 
    let active = true
    if (active) fetchData()
    return () => { active = false }
  }, [fetchData])

  // Company CRUD
  const handleAddCompany = async () => {
    try {
      await api.post('/delivery/companies', companyForm)
      setCompanyForm({ name: '', logo: '', description: '' })
      setShowCompanyForm(false)
      fetchData()
    } catch {}
  }

  const handleDeleteCompany = async (id: number) => {
    if (!confirm('Remove this company?')) return
    try {
      await api.delete(`/delivery/companies/${id}`)
      fetchData()
    } catch {}
  }

  // Area CRUD
  const handleSaveArea = async () => {
    try {
      const data = {
        ...areaForm,
        companyId: areaForm.companyId ? Number(areaForm.companyId) : null,
        price: Number(areaForm.price),
      }
      if (editingArea) {
        await api.put(`/delivery/areas/${editingArea.id}`, { ...data, isActive: true })
      } else {
        await api.post('/delivery/areas', data)
      }
      setAreaForm({ companyId: '', areaName: '', price: '', estimatedTime: '' })
      setShowAreaForm(false)
      setEditingArea(null)
      fetchData()
    } catch {}
  }

  const handleEditArea = (area: DeliveryArea) => {
    setAreaForm({
      companyId: area.companyId ? String(area.companyId) : '',
      areaName: area.areaName,
      price: String(area.price),
      estimatedTime: area.estimatedTime,
    })
    setEditingArea(area)
    setShowAreaForm(true)
  }

  const handleDeleteArea = async (id: number) => {
    if (!confirm('Remove this area?')) return
    try {
      await api.delete(`/delivery/areas/${id}`)
      fetchData()
    } catch {}
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black">Delivery Management</h1>
        <p className="text-sm text-slate-400 mt-1">Manage delivery companies and areas</p>
      </div>

      {/* ── Companies ── */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-lg">🏢 Delivery Companies</h2>
          <button onClick={() => setShowCompanyForm(true)}
            className="bg-[#0f172a] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors">
            + Add Company
          </button>
        </div>

        {showCompanyForm && (
          <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-4 space-y-3">
            <input placeholder="Company Name" title="Company Name" value={companyForm.name} onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })}
              className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900" />
            <input placeholder="Logo URL (optional)" title="Logo URL" value={companyForm.logo} onChange={e => setCompanyForm({ ...companyForm, logo: e.target.value })}
              className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900" />
            <textarea placeholder="Description (optional)" title="Description" value={companyForm.description} onChange={e => setCompanyForm({ ...companyForm, description: e.target.value })}
              rows={2} className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900 resize-none" />
            <div className="flex gap-2">
              <button onClick={handleAddCompany} className="bg-[#0f172a] text-white px-5 py-2.5 rounded-xl text-sm font-bold">Save</button>
              <button onClick={() => setShowCompanyForm(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold border border-slate-200">Cancel</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {companies.map(c => (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-100 p-5">
              <div className="flex items-center gap-3 mb-2">
                {c.logo ? (
                  <div className="w-10 h-10 relative overflow-hidden rounded-lg">
                    <NextImage src={c.logo} alt={c.name} fill className="object-cover" sizes="40px" />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-lg">🚚</div>
                )}
                <div>
                  <p className="font-bold text-sm">{c.name}</p>
                  {c.description && <p className="text-xs text-slate-400">{c.description}</p>}
                </div>
              </div>
              <button onClick={() => handleDeleteCompany(c.id)} className="text-xs text-red-500 hover:underline mt-2">Remove</button>
            </div>
          ))}
          {companies.length === 0 && (
            <div className="text-center py-8 text-slate-400 col-span-3">
              <p className="font-medium text-sm">No delivery companies added yet</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Delivery Areas ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-lg">📍 Delivery Areas</h2>
          <button onClick={() => { setEditingArea(null); setAreaForm({ companyId: '', areaName: '', price: '', estimatedTime: '' }); setShowAreaForm(true) }}
            className="bg-[#0f172a] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors">
            + Add Area
          </button>
        </div>

        {showAreaForm && (
          <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input placeholder="Area Name *" title="Area Name" value={areaForm.areaName} onChange={e => setAreaForm({ ...areaForm, areaName: e.target.value })}
                className="border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900" />
              <input placeholder="Price *" title="Price" type="number" value={areaForm.price} onChange={e => setAreaForm({ ...areaForm, price: e.target.value })}
                className="border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900" />
              <input placeholder="Estimated Time *" title="Estimated Time" value={areaForm.estimatedTime} onChange={e => setAreaForm({ ...areaForm, estimatedTime: e.target.value })}
                className="border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900" />
              <select value={areaForm.companyId} onChange={e => setAreaForm({ ...areaForm, companyId: e.target.value })}
                title="Delivery Company"
                className="border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900">
                <option value="">No Company</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSaveArea} className="bg-[#0f172a] text-white px-5 py-2.5 rounded-xl text-sm font-bold">
                {editingArea ? 'Update Area' : 'Add Area'}
              </button>
              <button onClick={() => { setShowAreaForm(false); setEditingArea(null) }} className="px-5 py-2.5 rounded-xl text-sm font-bold border border-slate-200">Cancel</button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Area</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Company</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Price</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Time</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {areas.map(a => (
                <tr key={a.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-bold">{a.areaName}</td>
                  <td className="px-4 py-3 text-slate-500">{a.companyName || '—'}</td>
                  <td className="px-4 py-3 font-bold text-green-600">${a.price}</td>
                  <td className="px-4 py-3 text-slate-500">{a.estimatedTime}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEditArea(a)} className="text-xs font-bold text-blue-600 hover:underline mr-3">Edit</button>
                    <button onClick={() => handleDeleteArea(a.id)} className="text-xs font-bold text-red-500 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {areas.length === 0 && !loading && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-4xl mb-2">📍</p>
              <p className="font-medium">No delivery areas configured</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
