'use client'
import { useEffect, useState, useCallback } from 'react'
import api from '../lib/api'
import NextImage from 'next/image'

const CATEGORIES = ['Jeans', 'T-Shirts', 'Shirts', 'Sport Sets', 'Pants', 'Hoodies', 'Jackets', 'Shorts', 'Accessories']
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']

interface ProductSize {
  size: string
  stock: number
}

interface ProductImage {
  url: string
}

interface Product {
  id: number
  title: string
  description: string | null
  category: string
  price: number
  salePrice: number | null
  isTopTrendy: boolean
  isFeatured: boolean
  isSale: boolean
  image: string | null
  images: ProductImage[]
  sizes: ProductSize[]
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  interface ProductForm {
    title: string
    description: string
    category: string
    price: string
    salePrice: string
    isTopTrendy: boolean
    isFeatured: boolean
    isSale: boolean
    sizes: ProductSize[]
    images: ProductImage[]
  }

  const [form, setForm] = useState<ProductForm>({
    title: '', description: '', category: CATEGORIES[0], price: '',
    salePrice: '', isTopTrendy: false, isFeatured: false, isSale: false,
    sizes: SIZES.map(s => ({ size: s, stock: 0 })),
    images: [] as ProductImage[],
  })
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get('/products')
      setProducts(res.data)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { 
    let active = true
    if (active) fetchProducts()
    return () => { active = false }
  }, [fetchProducts])

  const resetForm = () => {
    setForm({
      title: '', description: '', category: CATEGORIES[0], price: '',
      salePrice: '', isTopTrendy: false, isFeatured: false, isSale: false,
      sizes: SIZES.map(s => ({ size: s, stock: 0 })),
      images: [],
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = async (id: number) => {
    try {
      const res = await api.get(`/products/${id}`)
      const p = res.data
      setForm({
        title: p.title, description: p.description || '', category: p.category,
        price: p.price, salePrice: p.salePrice || '',
        isTopTrendy: p.isTopTrendy, isFeatured: p.isFeatured, isSale: p.isSale,
        sizes: SIZES.map(s => {
          const existing = p.sizes?.find((ps: ProductSize) => ps.size === s)
          return { size: s, stock: existing?.stock || 0 }
        }),
        images: p.images?.map((img: ProductImage) => ({ url: img.url })) || [],
      })
      setEditingId(id)
      setShowForm(true)
    } catch {}
  }

  const handleSubmit = async () => {
    const data = {
      ...form,
      price: Number(form.price),
      salePrice: form.salePrice ? Number(form.salePrice) : null,
      sizes: form.sizes.filter(s => s.stock > 0),
    }
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, data)
      } else {
        await api.post('/products', data)
      }
      resetForm()
      fetchProducts()
    } catch {}
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return
    try {
      await api.delete(`/products/${id}`)
      fetchProducts()
    } catch {}
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (form.images.length >= 7) {
      alert('Maximum 7 images allowed')
      return
    }
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
      if (form.images.length >= 7) {
        alert('Maximum 7 images allowed')
        return
      }
      setForm({ ...form, images: [...form.images, { url: imageUrl.trim() }] })
      setImageUrl('')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black">Products</h1>
          <p className="text-sm text-slate-400 mt-1">{products.length} products</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="bg-[#0f172a] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
        >
          + Add Product
        </button>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <>
          {/* Backdrop — click outside to close */}
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => resetForm()} />
          {/* Scrollable container — pointer-events-none so clicks pass through to backdrop */}
          <div className="fixed inset-0 z-50 overflow-y-auto pointer-events-none">
            <div className="flex items-start justify-center min-h-full pt-10 px-4 pb-10">
              {/* White box — pointer-events-auto to capture its own clicks */}
              <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl pointer-events-auto">
              <div className="flex items-center justify-between mb-6">
              <h2 className="font-black text-lg">{editingId ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={resetForm} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 text-xl font-bold transition-colors">✕</button>
            </div>
            
            <div className="space-y-4">
              <input placeholder="Product Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900" />
              
              <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                rows={3} className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900 resize-none" />
              
              <div className="grid grid-cols-2 gap-4">
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  title="Product Category"
                  className="border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="number" placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                  className="border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900" />
              </div>

              <input type="number" placeholder="Sale Price (optional)" value={form.salePrice} onChange={e => setForm({ ...form, salePrice: e.target.value })}
                className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-900" />
              
              {/* Flags */}
              <div className="flex flex-wrap gap-4">
                {[
                  { key: 'isFeatured', label: 'Featured' },
                  { key: 'isTopTrendy', label: 'Trending' },
                  { key: 'isSale', label: 'Sale' },
                ].map(flag => (
                  <label key={flag.key} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form[flag.key as keyof typeof form] as boolean}
                      onChange={e => setForm({ ...form, [flag.key]: e.target.checked })}
                      className="w-4 h-4 rounded" />
                    <span className="font-medium">{flag.label}</span>
                  </label>
                ))}
              </div>

              {/* Sizes */}
              <div>
                <p className="font-bold text-sm mb-2">Sizes & Stock</p>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                  {form.sizes.map((s, i) => (
                    <div key={s.size} className="text-center">
                      <p className="text-xs font-bold text-slate-500 mb-1">{s.size}</p>
                      <input type="number" min={0} value={s.stock}
                        title={`Stock for size ${s.size}`}
                        onChange={e => {
                          const newSizes = [...form.sizes]
                          newSizes[i] = { ...s, stock: Number(e.target.value) }
                          setForm({ ...form, sizes: newSizes })
                        }}
                        className="w-full border-2 border-slate-100 rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:border-slate-900" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Images */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-sm">Images <span className="text-slate-400 font-normal">({form.images.length}/7)</span></p>
                  {form.images.length >= 7 && <span className="text-[10px] text-red-500 font-bold uppercase">Max Reached</span>}
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {form.images.map((img, i) => (
                    <div key={i} className="relative w-20 h-24 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 group">
                      <NextImage src={img.url} alt="" fill className="object-cover" sizes="80px" />
                      <button onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })}
                        title="Remove image"
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        ✕
                      </button>
                    </div>
                  ))}
                  {form.images.length < 7 && (
                    <label className="w-20 h-24 rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-all text-slate-400">
                      <span className="text-xl">+</span>
                      <span className="text-[10px] font-bold">Upload</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                    </label>
                  )}
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="Or paste Image URL" value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                    disabled={form.images.length >= 7}
                    className="flex-1 border-2 border-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-900 disabled:opacity-50" />
                  <button onClick={addImageByUrl} 
                    disabled={form.images.length >= 7 || !imageUrl.trim()}
                    className="px-4 py-2.5 bg-slate-100 rounded-xl text-sm font-bold hover:bg-slate-200 disabled:opacity-50">Add</button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleSubmit}
                className="flex-1 bg-[#0f172a] text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors">
                {editingId ? 'Update Product' : 'Create Product'}
              </button>
              <button onClick={resetForm}
                className="px-6 py-3 border-2 border-slate-100 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">
                Cancel
              </button>
            </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-xs text-slate-500 uppercase">Product</th>
                <th className="text-left px-4 py-3 font-bold text-xs text-slate-500 uppercase">Category</th>
                <th className="text-left px-4 py-3 font-bold text-xs text-slate-500 uppercase">Price</th>
                <th className="text-left px-4 py-3 font-bold text-xs text-slate-500 uppercase">Status</th>
                <th className="text-right px-4 py-3 font-bold text-xs text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-12 rounded-lg overflow-hidden bg-slate-50 flex-shrink-0 relative">
                        {p.image ? (
                          <NextImage src={p.image} alt="" fill className="object-cover" sizes="40px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs">👕</div>
                        )}
                      </div>
                      <span className="font-medium truncate max-w-[200px]">{p.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{p.category}</td>
                  <td className="px-4 py-3">
                    {p.salePrice ? (
                      <div>
                        <span className="font-bold text-red-600">${p.salePrice}</span>
                        <span className="text-xs text-slate-400 line-through ml-1">${p.price}</span>
                      </div>
                    ) : (
                      <span className="font-bold">${p.price}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.isFeatured && <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md">Featured</span>}
                      {p.isTopTrendy && <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md">Trending</span>}
                      {p.salePrice && <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-700 rounded-md">Sale</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEdit(p.id)} className="text-xs font-bold text-blue-600 hover:underline mr-3">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="text-xs font-bold text-red-500 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 && !loading && (
          <div className="text-center py-12 text-slate-400">
            <p className="text-4xl mb-2">👕</p>
            <p className="font-medium">No products yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
