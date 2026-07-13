'use client'
import { useEffect, useState, useCallback } from 'react'
import api from '../lib/api'
import NextImage from 'next/image'

interface Product {
  id: number
  title: string
  price: number
  salePrice: number | null
  category: string
  image: string | null
  isSale: boolean
}

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [saleRes, allRes] = await Promise.all([
        api.get('/products', { params: { sale: true } }),
        api.get('/products'),
      ])
      setProducts(saleRes.data)
      setAllProducts(allRes.data)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { 
    let active = true
    if (active) fetchData()
    return () => { active = false }
  }, [fetchData])

  const toggleSale = async (productId: number, currentProduct: Product, addSale: boolean) => {
    try {
      if (addSale) {
        const salePrice = prompt(`Enter sale price for "${currentProduct.title}" (original: $${currentProduct.price}):`)
        if (!salePrice) return
        await api.put(`/products/${productId}`, {
          ...currentProduct,
          salePrice: Number(salePrice),
          isSale: true,
        })
      } else {
        await api.put(`/products/${productId}`, {
          ...currentProduct,
          salePrice: null,
          isSale: false,
        })
      }
      fetchData()
    } catch {}
  }

  const nonSaleProducts = allProducts.filter(p => !p.salePrice)

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-slate-100 border-t-[#0f172a] rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black">Sales Management</h1>
        <p className="text-sm text-slate-400 mt-1">Manage products on sale</p>
      </div>

      {/* Current Sale Products */}
      <div className="mb-10">
        <h2 className="font-black text-lg mb-4 flex items-center gap-2">
          🏷️ Products on Sale <span className="text-sm font-normal text-slate-400">({products.length})</span>
        </h2>
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {products.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-4xl mb-2">🏷️</p>
              <p className="font-medium">No products on sale</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Product</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Original</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Sale Price</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Discount</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const safeSalePrice = p.salePrice ?? p.price
                  const discount = Math.round(((p.price - safeSalePrice) / p.price) * 100)
                  return (
                    <tr key={p.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                        <div className="w-10 h-12 rounded-lg overflow-hidden bg-slate-50 relative">
                            {p.image && <NextImage src={p.image} alt={p.title} fill className="object-cover" sizes="40px" />}
                          </div>
                          <span className="font-medium">{p.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400 line-through">${p.price}</td>
                      <td className="px-4 py-3 font-bold text-red-600">${p.salePrice}</td>
                      <td className="px-4 py-3">
                        <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded-md">-{discount}%</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => toggleSale(p.id, p, false)} className="text-xs font-bold text-red-500 hover:underline">
                          Remove Sale
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add to Sale */}
      <div>
        <h2 className="font-black text-lg mb-4 flex items-center gap-2">
          👕 Regular Products <span className="text-sm font-normal text-slate-400">({nonSaleProducts.length})</span>
        </h2>
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {nonSaleProducts.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="font-medium">All products are on sale!</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Product</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Price</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {nonSaleProducts.map(p => (
                  <tr key={p.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium">{p.title}</td>
                    <td className="px-4 py-3 text-slate-500">{p.category}</td>
                    <td className="px-4 py-3 font-bold">${p.price}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => toggleSale(p.id, p, true)} className="text-xs font-bold text-blue-600 hover:underline">
                        Add to Sale
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
