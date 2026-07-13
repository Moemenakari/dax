'use client'
import Link from 'next/link'
import NextImage from 'next/image'
import { useDispatch } from 'react-redux'
import { addItem } from '../store/cartSlice'
import { addToast } from '../store/toastSlice'
import AddIcon from '@mui/icons-material/Add'
import CheckroomIcon from '@mui/icons-material/Checkroom'

interface Product {
  id: number
  title: string
  price: number
  salePrice: number | null
  category: string
  image: string
}

export default function ProductCard({ product }: { product: Product }) {
  const dispatch = useDispatch()

  const discountPercent = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : null

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dispatch(addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      salePrice: product.salePrice,
      size: 'M',
      quantity: 1,
      stock: 99,
      image: product.image,
    }))
    dispatch(addToast({ message: `${product.title} added to cart!`, type: 'success' }))
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden group hover:shadow-lg transition-all duration-300 border border-gray-50">
      
      {/* Image */}
      <Link href={`/shop/${product.id}`}>
        <div className="relative bg-gray-50 aspect-[3/4] overflow-hidden">
          {product.image ? (
            <NextImage
              src={product.image}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-200">
              <CheckroomIcon sx={{ fontSize: 48 }} />
            </div>
          )}
          
          {/* Sale Badge */}
          {discountPercent && (
            <span className="absolute top-3 left-3 bg-[#e63946] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
              -{discountPercent}%
            </span>
          )}

          {/* Quick Add Button */}
          <button
            title="Quick add to cart"
            onClick={handleAddToCart}
            className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-black w-10 h-10 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-[#e63946] hover:text-white"
          >
            <AddIcon fontSize="small" />
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="p-3.5">
        <Link href={`/shop/${product.id}`}>
          <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">{product.category}</p>
          <h3 className="font-semibold text-sm mb-2 truncate hover:text-[#e63946] transition-colors">
            {product.title}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2">
          {product.salePrice ? (
            <>
              <span className="font-bold text-[#e63946]">${product.salePrice}</span>
              <span className="text-gray-400 text-xs line-through">${product.price}</span>
            </>
          ) : (
            <span className="font-bold">${product.price}</span>
          )}
        </div>
      </div>
    </div>
  )
}