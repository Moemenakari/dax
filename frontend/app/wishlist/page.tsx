'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import api from '../lib/api'
import NextImage from 'next/image'
import { useDispatch } from 'react-redux'
import { addItem } from '../store/cartSlice'
import LockIcon from '@mui/icons-material/Lock'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import CheckroomIcon from '@mui/icons-material/Checkroom'

interface WishlistItem {
  id: number
  productId: number
  title: string
  price: number
  salePrice: number | null
  image: string
}

export default function WishlistPage() {
  const dispatch = useDispatch()
  const [items, setItems]     = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const fetchWishlist = useCallback(async () => {
    try {
      const res = await api.get('/wishlist')
      setItems(res.data)
    } catch {
      setError('Please login to view your wishlist')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    if (active) fetchWishlist()
    return () => { active = false }
  }, [fetchWishlist])

  const removeFromWishlist = async (productId: number) => {
    try {
      await api.delete(`/wishlist/${productId}`)
      setItems(items.filter(i => i.productId !== productId))
    } catch {}
  }

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-2xl aspect-3/4 animate-pulse" />
        ))}
      </div>
    </div>
  )

  if (error) return (
    <div className="max-w-6xl mx-auto px-4 py-20 text-center">
      <p className="text-4xl text-gray-300 mb-4"><LockIcon fontSize="inherit" /></p>
      <h2 className="text-2xl font-black mb-4">{error}</h2>
      <Link href="/login"
        className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-red-600 transition-colors inline-block">
        Login
      </Link>
    </div>
  )

  if (items.length === 0) return (
    <div className="max-w-6xl mx-auto px-4 py-20 text-center">
      <p className="text-5xl text-gray-300 mb-4"><FavoriteBorderIcon fontSize="inherit" /></p>
      <h2 className="text-2xl font-black mb-4">Your wishlist is empty</h2>
      <Link href="/shop"
        className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-red-600 transition-colors inline-block">
        Explore Products
      </Link>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-black mb-8">My Wishlist</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-2xl shadow-sm overflow-hidden group">

            {/* Image */}
            <Link href={`/shop/${item.productId}`}>
              <div className="relative bg-gray-100 aspect-3/4 overflow-hidden">
                {item.image
                  ? <NextImage 
                      src={item.image} 
                      alt={item.title}
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-300" 
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  : <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300"><CheckroomIcon fontSize="inherit" /></div>
                }
              </div>
            </Link>

            {/* Info */}
            <div className="p-3">
              <h3 className="font-bold text-sm truncate mb-1">{item.title}</h3>
              <div className="flex items-center gap-2 mb-3">
                {item.salePrice ? (
                  <>
                    <span className="font-black text-red-600">${item.salePrice}</span>
                    <span className="text-gray-400 text-xs line-through">${item.price}</span>
                  </>
                ) : (
                  <span className="font-black">${item.price}</span>
                )}
              </div>

              {/* Buttons */}
              <button
                onClick={() => {
                  dispatch(addItem({
                    productId: item.productId,
                    title: item.title,
                    price: item.price,
                    salePrice: item.salePrice,
                    size: 'M',
                    quantity: 1,
                    stock: 99,
                    image: item.image,
                  }))
                }}
                className="w-full bg-black text-white text-xs font-bold py-2 rounded-full hover:bg-red-600 transition-colors mb-2">
                Add to Cart
              </button>
              <button
                onClick={() => removeFromWishlist(item.productId)}
                className="w-full border-2 border-gray-100 text-xs font-bold py-2 rounded-full hover:border-red-600 hover:text-red-600 transition-colors">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
