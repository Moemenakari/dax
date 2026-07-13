'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useDispatch, useSelector } from 'react-redux'
import { addItem } from '../../store/cartSlice'
import { addToast } from '../../store/toastSlice'
import { RootState } from '../../store'
import ProductCard from '../../components/ProductCard'
import api from '../../lib/api'
import NextImage from 'next/image'
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import ReplayIcon from '@mui/icons-material/Replay'
import PaymentsIcon from '@mui/icons-material/Payments'
import VerifiedIcon from '@mui/icons-material/Verified'

interface ProductImage {
  id: number
  url: string
  isPrimary: boolean
}

interface ProductSize {
  id: number
  size: string
  stock: number
}

interface Product {
  id: number
  title: string
  description: string
  category: string
  price: number
  salePrice: number | null
  image: string
  images: ProductImage[]
  sizes: ProductSize[]
  related: Product[]
}

export default function ProductDetailPage() {
  const params = useParams()
  const dispatch = useDispatch()
  const cartItems = useSelector((state: RootState) => state.cart.items)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const [reviews, setReviews] = useState<any[]>([])
  const [recommended, setRecommended] = useState<Product[]>([])
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  const fetchProduct = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get(`/products/${params.id}`)
      setProduct(res.data)
      if (res.data.sizes?.length > 0) {
        const inStock = res.data.sizes.find((s: ProductSize) => s.stock > 0)
        if (inStock) setSelectedSize(inStock.size)
      }

      // Fetch reviews
      try {
        const revRes = await api.get(`/reviews?productId=${params.id}`)
        let fetchedReviews = revRes.data
        if (!fetchedReviews || fetchedReviews.length === 0) {
          const storeRevRes = await api.get('/reviews')
          fetchedReviews = storeRevRes.data
        }
        setReviews(fetchedReviews || [])
      } catch {}

      // Fetch recommended
      try {
        const recRes = await api.get(`/products?category=${res.data.category}&limit=5`)
        const recs = recRes.data.filter((p: any) => p.id !== res.data.id).slice(0, 4)
        setRecommended(recs)
      } catch {}
    } catch {
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    let active = true
    if (active && params.id) fetchProduct()
    return () => { active = false }
  }, [fetchProduct, params.id])

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviews.length
    : 0

  const discountPercent = product?.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : null

  const currentSizeStock = product?.sizes?.find((s: ProductSize) => s.size === selectedSize)?.stock || 0

  // Calculate how many of this item/size are already in cart
  const cartQtyForSize = product ? cartItems.find(
    i => i.productId === product.id && i.size === selectedSize
  )?.quantity || 0 : 0

  const availableStock = Math.max(0, currentSizeStock - cartQtyForSize)

  const handleAddToCart = () => {
    if (!product) return
    if (!selectedSize) {
      dispatch(addToast({ message: 'Please select a size', type: 'error' }))
      return
    }
    if (currentSizeStock <= 0) {
      dispatch(addToast({ message: 'This size is out of stock', type: 'error' }))
      return
    }
    if (availableStock <= 0) {
      dispatch(addToast({ message: 'Maximum stock reached for this size', type: 'error' }))
      return
    }
    dispatch(addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      salePrice: product.salePrice,
      size: selectedSize,
      quantity,
      image: product.images?.[0]?.url || product.image || '',
      stock: currentSizeStock,
    }))
    dispatch(addToast({ message: `${product.title} added to cart!`, type: 'success' }))
  }

  const handleSubmitReview = async () => {
    if (!reviewForm.comment.trim()) {
      dispatch(addToast({ message: 'Please write a comment', type: 'error' }))
      return
    }
    setReviewSubmitting(true)
    try {
      await api.post('/reviews/submit', {
        productId: Number(params.id),
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      })
      dispatch(addToast({ message: 'Review submitted! It will appear after approval.', type: 'success' }))
      setReviewForm({ rating: 5, comment: '' })
    } catch {
      dispatch(addToast({ message: 'Please login to submit a review', type: 'error' }))
    }
    setReviewSubmitting(false)
  }

  const handleWishlist = async () => {
    if (!product) return
    try {
      if (isWishlisted) {
        await api.delete(`/wishlist/${product.id}`)
        setIsWishlisted(false)
        dispatch(addToast({ message: 'Removed from wishlist', type: 'info' }))
      } else {
        await api.post(`/wishlist/${product.id}`)
        setIsWishlisted(true)
        dispatch(addToast({ message: 'Added to wishlist!', type: 'success' }))
      }
    } catch {
      dispatch(addToast({ message: 'Please login to use wishlist', type: 'error' }))
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-[3/4] bg-gray-100 rounded-2xl skeleton" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-gray-100 rounded-lg skeleton" />
            <div className="h-6 w-1/2 bg-gray-100 rounded-lg skeleton" />
            <div className="h-20 bg-gray-100 rounded-lg skeleton" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl text-gray-300 mb-4"><SentimentVeryDissatisfiedIcon fontSize="inherit" /></p>
        <h2 className="text-2xl font-black mb-4">Product Not Found</h2>
        <Link href="/shop" className="text-[#e63946] font-bold hover:underline">Back to Shop</Link>
      </div>
    )
  }

  const images: ProductImage[] = product.images || []
  const primaryImage = images[selectedImage]?.url || product.image || ''

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6 overflow-x-auto">
        <Link href="/" className="hover:text-black transition-colors shrink-0">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-black transition-colors shrink-0">Shop</Link>
        <span>/</span>
        <Link href={`/shop?category=${product.category}`} className="hover:text-black transition-colors capitalize shrink-0">{product.category}</Link>
        <span>/</span>
        <span className="text-black font-medium truncate">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
        
        {/* ─── Images ─── */}
        <div>
          {/* Main Image */}
          <div className="aspect-[3/4] bg-gray-50 rounded-2xl overflow-hidden mb-3 relative">
            {primaryImage ? (
              <NextImage 
                src={primaryImage} 
                alt={product.title} 
                fill 
                className="object-cover" 
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-200">
                <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            {discountPercent && (
              <span className="absolute top-4 left-4 bg-[#e63946] text-white text-sm font-bold px-3 py-1.5 rounded-xl">
                -{discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  title={`View image ${i + 1}`}
                  className={`flex-shrink-0 w-16 h-20 md:w-20 md:h-24 rounded-xl overflow-hidden border-2 transition-all relative ${
                    selectedImage === i ? 'border-[#e63946] shadow-md' : 'border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <NextImage src={img.url} alt="" fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ─── Details ─── */}
        <div>
          <p className="text-xs text-[#e63946] font-bold uppercase tracking-[0.15em] mb-2">{product.category}</p>
          <h1 className="text-2xl md:text-3xl font-black mb-3">{product.title}</h1>

          {/* Average Rating */}
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(star => (
                  <svg key={star} className={`w-4 h-4 ${star <= Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-black text-gray-800">{avgRating.toFixed(1)}</span>
              <span className="text-xs text-gray-400 font-medium">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-3 mb-6">
            {product.salePrice ? (
              <>
                <span className="text-3xl font-black text-[#e63946]">${product.salePrice}</span>
                <span className="text-xl text-gray-400 line-through">${product.price}</span>
                <span className="bg-[#e63946]/10 text-[#e63946] text-xs font-bold px-2.5 py-1 rounded-lg">-{discountPercent}%</span>
              </>
            ) : (
              <span className="text-3xl font-black">${product.price}</span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-gray-500 leading-relaxed mb-6 text-sm">{product.description}</p>
          )}

          {/* Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <p className="font-bold text-sm mb-3">
                Size: <span className="text-[#e63946]">{selectedSize || 'Select'}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s: ProductSize) => (
                  <button
                    key={s.id}
                    onClick={() => { s.stock > 0 && setSelectedSize(s.size); setQuantity(1) }}
                    disabled={s.stock <= 0}
                    className={`min-w-[48px] h-12 px-4 rounded-xl text-sm font-bold border-2 transition-all relative
                      ${selectedSize === s.size 
                        ? 'bg-[#0f0f0f] text-white border-[#0f0f0f]' 
                        : s.stock > 0 
                          ? 'border-gray-200 hover:border-[#0f0f0f] text-gray-700' 
                          : 'border-gray-100 text-gray-300 line-through cursor-not-allowed'}`}
                  >
                    {s.size}
                    {s.stock > 0 && s.stock <= 3 && (
                      <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        {s.stock}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {selectedSize && (
                <p className={`text-xs mt-2 font-medium ${currentSizeStock > 5 ? 'text-green-600' : currentSizeStock > 0 ? 'text-orange-500' : 'text-red-500'}`}>
                  {currentSizeStock > 5 ? '✓ In Stock' : currentSizeStock > 0 ? `⚠ Only ${currentSizeStock} left` : '✕ Out of Stock'}
                </p>
              )}
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <p className="font-bold text-sm mb-3">Quantity</p>
            <div className="inline-flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 flex items-center justify-center text-lg font-bold hover:bg-gray-50 transition-colors"
              >
                −
              </button>
              <span className="w-12 h-12 flex items-center justify-center font-bold border-x-2 border-gray-200">{quantity}</span>
              <button 
                onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                disabled={quantity >= availableStock}
                className="w-12 h-12 flex items-center justify-center text-lg font-bold hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
            {availableStock > 0 && availableStock < currentSizeStock && (
              <p className="text-xs text-orange-500 mt-1 font-medium">
                {cartQtyForSize} already in cart
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize || currentSizeStock <= 0 || availableStock <= 0}
              className="flex-1 bg-[#0f0f0f] text-white py-4 rounded-full font-bold text-sm hover:bg-[#e63946] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShoppingBagIcon fontSize="small" />
              {availableStock <= 0 && selectedSize ? 'Max Stock Reached' : 'Add to Cart'}
            </button>
            <button
              onClick={handleWishlist}
              className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all ${
                isWishlisted ? 'bg-[#e63946] border-[#e63946] text-white' : 'border-gray-200 hover:border-[#e63946] text-gray-400 hover:text-[#e63946]'
              }`}
            >
              {isWishlisted ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
            </button>
          </div>

          {/* Features */}
          <div className="border-t pt-6 space-y-3">
            {[
              { icon: <LocalShippingIcon fontSize="inherit" />, text: 'Fast delivery all over Lebanon' },
              { icon: <ReplayIcon fontSize="inherit" />, text: 'Easy returns within 3 days' },
              { icon: <PaymentsIcon fontSize="inherit" />, text: 'Cash on Delivery available' },
              { icon: <VerifiedIcon fontSize="inherit" />, text: '100% Original products' },
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-gray-500">
                <span>{feat.icon}</span>
                <span>{feat.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Related Products ─── */}
      {/* ─── Reviews Section ─── */}
      <section className="mt-16 border-t pt-10">
        <h2 className="text-2xl font-black mb-8">Customer Reviews</h2>
        {reviews.length > 0 ? (
          <div className="flex overflow-x-auto md:grid md:grid-cols-4 gap-4 pb-4 md:pb-0 hide-scrollbar snap-x">
            {reviews.map((r, idx) => (
              <div key={idx} className="min-w-[280px] md:min-w-0 bg-white border border-gray-100 rounded-2xl p-5 md:p-6 snap-center flex-shrink-0">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-4 h-4 ${i < (r.rating || 5) ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">&ldquo;{r.comment || r.review}&rdquo;</p>
                <div className="flex justify-between items-end">
                  <p className="font-bold text-sm">{r.customerName || r.name}</p>
                  <p className="text-xs text-gray-400">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No reviews yet.</p>
        )}
      </section>

      {/* ─── Submit Review ─── */}
      <div className="mt-10 bg-gray-50 rounded-2xl p-6">
        <h3 className="font-black text-lg mb-4">Leave a Review</h3>
        {isAuthenticated ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-bold mb-2">Rating</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewForm(f => ({ ...f, rating: star }))}
                    className="text-2xl transition-transform hover:scale-110"
                  >
                    <svg className={`w-7 h-7 ${star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            <textarea
              placeholder="Share your experience with this product..."
              value={reviewForm.comment}
              onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
              rows={3}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#0f0f0f] transition-colors resize-none"
            />
            <button
              type="button"
              onClick={handleSubmitReview}
              disabled={reviewSubmitting}
              className="bg-[#0f0f0f] text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-[#e63946] transition-colors disabled:opacity-50"
            >
              {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            <a href="/login" className="text-[#e63946] font-bold hover:underline">Login</a> to leave a review.
          </p>
        )}
      </div>

      {/* ─── Recommended Items ─── */}
      {recommended && recommended.length > 0 && (
        <section className="mt-16 border-t pt-10">
          <h2 className="text-2xl font-black mb-8">You May Also Like</h2>
          <div className="flex overflow-x-auto md:grid md:grid-cols-4 gap-4 pb-4 md:pb-0 hide-scrollbar snap-x">
            {recommended.map((p) => (
              <div key={p.id} className="min-w-[50%] md:min-w-0 snap-center flex-shrink-0">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
