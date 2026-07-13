'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import api from '../lib/api'
import ProductCard from '../components/ProductCard'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'

interface Product {
  id: number
  title: string
  price: number
  salePrice: number | null
  category: string
  image: string
}

const CATEGORIES = ['All', 'Jeans', 'T-Shirts', 'Shirts', 'Sport Sets', 'Pants', 'Hoodies', 'Jackets', 'Shorts', 'Accessories']

function ShopContent() {
  const searchParams = useSearchParams()
  const [products, setProducts]     = useState<Product[]>([])
  const [loading, setLoading]       = useState(true)
  const [category, setCategory]     = useState('All')
  const [saleOnly, setSaleOnly]     = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Read URL params
  useEffect(() => {
    const urlCat = searchParams.get('category')
    const urlSale = searchParams.get('sale')
    const urlSearch = searchParams.get('search')
    
    if (urlCat) {
      const found = CATEGORIES.find(c => c.toLowerCase().replace(' ', '-') === urlCat.toLowerCase())
      if (found) setCategory(found)
    }
    if (urlSale === 'true') setSaleOnly(true)
    if (urlSearch) setSearchQuery(urlSearch)
  }, [searchParams])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | boolean | number> = {}
      if (category !== 'All') params.category = category
      if (saleOnly) params.sale = true
      if (searchQuery) params.search = searchQuery
      const res = await api.get('/products', { params })
      setProducts(res.data)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [category, saleOnly, searchQuery])

  useEffect(() => {
    let active = true
    if (active) fetchProducts()
    return () => { active = false }
  }, [fetchProducts])

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black flex items-center gap-2">
          {searchQuery ? `Search: "${searchQuery}"` : saleOnly ? <><LocalOfferIcon sx={{ fontSize: 'inherit', color: '#e63946' }} /> Sale</> : 'Shop'}
        </h1>
        {!loading && (
          <p className="text-sm text-gray-400 mt-2">{products.length} products found</p>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" sx={{ fontSize: 18 }} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0f0f0f] transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search query"
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto hide-scrollbar pb-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border-2 transition-all shrink-0
              ${category === cat
                ? 'bg-[#0f0f0f] text-white border-[#0f0f0f]'
                : 'border-gray-100 hover:border-gray-300 bg-white'}`}
          >
            {cat}
          </button>
        ))}
        <button
          onClick={() => setSaleOnly(!saleOnly)}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold border-2 transition-all shrink-0 flex items-center gap-1.5
            ${saleOnly
              ? 'bg-[#e63946] text-white border-[#e63946]'
              : 'border-gray-100 hover:border-[#e63946] bg-white text-[#e63946]'}`}
        >
          <LocalOfferIcon sx={{ fontSize: 14 }} /> Sale Only
        </button>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden">
              <div className="aspect-3/4 skeleton rounded-2xl" />
              <div className="pt-3 space-y-2">
                <div className="h-3 w-16 skeleton rounded" />
                <div className="h-4 w-3/4 skeleton rounded" />
                <div className="h-4 w-1/3 skeleton rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl text-gray-300 mb-4"><SearchIcon fontSize="inherit" /></p>
          <h3 className="text-xl font-black mb-2">No Products Found</h3>
          <p className="text-gray-400 text-sm mb-6">Try adjusting your filters or search query.</p>
          <button 
            onClick={() => { setCategory('All'); setSaleOnly(false); setSearchQuery('') }}
            className="text-[#e63946] font-bold text-sm hover:underline"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-3/4 skeleton rounded-2xl" />
          ))}
        </div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  )
}
