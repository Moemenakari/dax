'use client'
import { useEffect, useState, useCallback, use } from 'react'
import api from '../../lib/api'
import { LuChevronLeft, LuSave, LuImage, LuBox, LuTrash2, LuUpload, LuCheck } from 'react-icons/lu'
import Link from 'next/link'
import NextImage from 'next/image'

interface ProductSize {
  size: string
  stock: number
}

interface ProductImage {
  id?: number
  url: string
  isPrimary?: boolean
}

interface Product {
  id: number
  title: string
  description: string | null
  price: number
  salePrice: number | null
  category: string
  isTopTrendy: boolean
  isFeatured: boolean
  isSale: boolean
  isActive: boolean
  images: ProductImage[]
  sizes: ProductSize[]
}

const CATEGORIES = ['T-Shirts', 'Jeans', 'Jackets', 'Shorts', 'Shirts', 'Accessories', 'Shoes']
const SIZE_LIST = ['S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40', '41', '42', '43', '44', '45']

export default function ProductEditPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise)
  const [form, setForm] = useState<Omit<Product, 'id'>>({
    title: '',
    description: '',
    price: 0,
    salePrice: null,
    category: CATEGORIES[0],
    isTopTrendy: false,
    isFeatured: false,
    isSale: false,
    isActive: true,
    images: [],
    sizes: []
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [message, setMessage] = useState('')

  const fetchProduct = useCallback(async () => {
    try {
      const res = await api.get(`/products/${params.id}`)
      setForm(res.data)
    } catch {}
    setLoading(false)
  }, [params.id])

  useEffect(() => { 
    fetchProduct()
  }, [fetchProduct])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (form.images.length >= 7) { alert('Max 7 images'); return }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/upload` : 'http://localhost:5000/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      setForm({ ...form, images: [...form.images, { url: data.url }] })
    } catch (err) {
      alert("Upload failed. Try using image URL instead.")
    }
    setUploading(false)
  }

  const addImageByUrl = () => {
    if (imageUrl.trim()) {
      if (form.images.length >= 7) { alert('Max 7 images'); return }
      setForm({ ...form, images: [...form.images, { url: imageUrl.trim() }] })
      setImageUrl('')
    }
  }

  const toggleSize = (size: string) => {
    const exists = form.sizes.find(s => s.size === size)
    if (exists) {
      setForm({ ...form, sizes: form.sizes.filter(s => s.size !== size) })
    } else {
      setForm({ ...form, sizes: [...form.sizes, { size, stock: 0 }] })
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      await api.put(`/products/${params.id}`, form)
      setMessage('✅ Product updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch {
      setMessage('❌ Failed to update product.')
    }
    setSaving(false)
  }

  if (loading) return <div className="p-8 text-center text-slate-400 animate-pulse">Loading product...</div>

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div className="flex items-center gap-4">
          <Link href="/products" className="w-10 h-10 rounded-xl border border-slate-100 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors">
            <LuChevronLeft className="text-slate-600" />
          </Link>
          <h1 className="text-2xl font-black text-[#0f172a]">Edit Product</h1>
        </div>
        <div className="flex items-center gap-4">
           {message && <span className="text-xs font-bold text-slate-500 animate-fade-in">{message}</span>}
           <button 
             onClick={handleSave}
             disabled={saving}
             className="bg-[#0f172a] text-white px-8 py-3 rounded-xl font-black text-sm hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-900/20 disabled:opacity-50"
           >
            <LuSave size={18} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
             <div>
                <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider">Product Title</label>
                <input 
                  title="Title"
                  type="text"
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
                />
             </div>
             <div>
                <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider">Description</label>
                <textarea 
                  title="Description"
                  rows={4}
                  value={form.description || ''}
                  onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all resize-none"
                />
             </div>

             <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider">Original Price ($)</label>
                  <input 
                    title="Price"
                    type="number"
                    value={form.price}
                    onChange={e => setForm({...form, price: Number(e.target.value)})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider">Sale Price ($)</label>
                  <input 
                    title="Sale Price"
                    type="number"
                    value={form.salePrice || ''}
                    onChange={e => setForm({...form, salePrice: e.target.value ? Number(e.target.value) : null})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
                  />
                </div>
             </div>

             <div>
                <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider">Category</label>
                <select 
                  title="Category"
                  value={form.category}
                  onChange={e => setForm({...form, category: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
             <div className="flex items-center justify-between border-b border-slate-50 pb-4">
               <span className="text-xs font-black uppercase text-slate-900 tracking-wider">Sizes & Stock</span>
               <span className="text-[10px] text-slate-400 font-bold uppercase">Click to toggle sizes</span>
             </div>
             <div className="flex flex-wrap gap-2">
                {SIZE_LIST.map(sz => {
                  const sObj = form.sizes.find(s => s.size === sz)
                  return (
                    <button 
                      key={sz}
                      onClick={() => toggleSize(sz)}
                      className={`min-w-[40px] h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-all border ${
                        sObj ? 'bg-[#0f172a] text-white border-slate-900 shadow-lg shadow-slate-900/20' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      {sz}
                    </button>
                  )
                })}
             </div>
             {form.sizes.length > 0 && (
               <div className="grid grid-cols-4 md:grid-cols-6 gap-3 pt-4 animate-fade-in">
                  {form.sizes.map((s, i) => (
                    <div key={s.size} className="text-center space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase">{s.size}</p>
                      <input 
                        title={`Stock for ${s.size}`}
                        type="number"
                        min={0}
                        value={s.stock}
                        onChange={e => {
                          const newSizes = [...form.sizes]
                          newSizes[i] = { ...s, stock: Number(e.target.value) }
                          setForm({ ...form, sizes: newSizes })
                        }}
                        className="w-full px-1 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs text-center focus:outline-none focus:border-slate-900"
                      />
                    </div>
                  ))}
               </div>
             )}
          </div>
        </div>

        <div className="space-y-6">
           {/* Image Section */}
           <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-900 tracking-wider">Product Gallery</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{form.images.length}/7</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {form.images.map((img, i) => (
                  <div key={i} className="relative w-20 h-24 rounded-lg overflow-hidden border border-slate-100 group">
                     <NextImage src={img.url} alt="" fill className="object-cover" sizes="80px" />
                     <button 
                       onClick={() => setForm({...form, images: form.images.filter((_, j) => j !== i)})}
                       className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                     >
                       ✕
                     </button>
                  </div>
                ))}
                {form.images.length < 7 && (
                   <label className="w-20 h-24 rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-slate-50 transition-colors group">
                     <LuUpload className="text-slate-300 group-hover:text-slate-500" size={16} />
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Upload</span>
                     <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                   </label>
                )}
              </div>

              <div className="pt-2">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Or add via URL</p>
                <div className="flex gap-2">
                   <input 
                     title="Image URL"
                     type="text"
                     placeholder="http://..."
                     value={imageUrl}
                     onChange={e => setImageUrl(e.target.value)}
                     className="flex-1 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none"
                   />
                   <button onClick={addImageByUrl} className="px-3 py-2 bg-[#0f172a] text-white rounded-xl text-xs font-bold">Add</button>
                </div>
              </div>
           </div>

           {/* Visibility Switches */}
           <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4 font-bold text-xs uppercase tracking-wide">
              <label className="flex items-center justify-between cursor-pointer py-2 border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                 <span>Product Active</span>
                 <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="size-4 rounded accent-[#0f172a]" />
              </label>
              <label className="flex items-center justify-between cursor-pointer py-2 border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                 <span>Top Trendy</span>
                 <input type="checkbox" checked={form.isTopTrendy} onChange={e => setForm({...form, isTopTrendy: e.target.checked})} className="size-4 rounded accent-[#0f172a]" />
              </label>
              <label className="flex items-center justify-between cursor-pointer py-2 border-b border-slate-50 hover:bg-slate-50/50 transition-colors text-[#e63946]">
                 <span>Featured Item</span>
                 <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({...form, isFeatured: e.target.checked})} className="size-4 rounded accent-[#e63946]" />
              </label>
              <label className="flex items-center justify-between cursor-pointer py-2 hover:bg-slate-50/50 transition-colors text-blue-600">
                 <span>On Sale</span>
                 <input type="checkbox" checked={form.isSale} onChange={e => setForm({...form, isSale: e.target.checked})} className="size-4 rounded accent-blue-600" />
              </label>
           </div>
        </div>
      </div>
    </div>
  )
}
