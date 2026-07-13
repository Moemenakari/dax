'use client'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store'
import { removeItem, updateQuantity } from '../store/cartSlice'
import Link from 'next/link'
import NextImage from 'next/image'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

export default function CartPage() {
  const items = useSelector((state: RootState) => state.cart.items)
  const dispatch = useDispatch()

  const subtotal = items.reduce((sum, i) =>
    sum + Number(i.salePrice ?? i.price) * i.quantity, 0
  )
  const isFreeDelivery = subtotal >= 50
  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center px-4">
        <div className="text-gray-300 mb-4 flex justify-center"><ShoppingCartIcon sx={{ fontSize: 72 }} /></div>
        <h2 className="text-2xl font-black mb-3">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven&apos;t added anything yet.</p>
        <Link 
          href="/shop" 
          className="bg-[#0f0f0f] text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-[#e63946] transition-colors inline-flex items-center gap-2"
        >
          Continue Shopping
          <ArrowForwardIcon sx={{ fontSize: 18 }} />
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
      <h1 className="text-3xl md:text-4xl font-black mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => {
            const unitPrice = item.salePrice ?? item.price
            const atStockLimit = item.quantity >= item.stock
            return (
              <div key={`${item.productId}-${item.size}`} className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 flex gap-3 sm:gap-4">
                {/* Image */}
                <Link href={`/shop/${item.productId}`} className="shrink-0">
                  <div className="w-16 h-20 sm:w-24 sm:h-28 md:w-28 md:h-32 rounded-xl overflow-hidden bg-gray-50 relative">
                    {item.image ? (
                      <NextImage 
                        src={item.image} 
                        alt={item.title} 
                        fill 
                        className="object-cover"
                        sizes="(max-width: 640px) 64px, (max-width: 768px) 100px, 120px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300"><CheckroomIcon sx={{ fontSize: 32 }} /></div>
                    )}
                  </div>
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link href={`/shop/${item.productId}`}>
                        <h3 className="font-bold text-sm hover:text-[#e63946] transition-colors">{item.title}</h3>
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">Size: {item.size}</p>
                      {item.stock <= 3 && (
                        <span className="inline-block text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded mt-1">
                          Only {item.stock} left
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => dispatch(removeItem({ productId: item.productId, size: item.size }))}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1 shrink-0"
                      title="Remove from cart"
                    >
                      <CloseIcon sx={{ fontSize: 20 }} />
                    </button>
                  </div>

                  <div className="flex items-end justify-between mt-3 sm:mt-4">
                    {/* Quantity */}
                    <div className="inline-flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button 
                        onClick={() => dispatch(updateQuantity({ productId: item.productId, size: item.size, quantity: Math.max(1, item.quantity - 1) }))}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                        title="Decrease quantity"
                      >
                        <RemoveIcon sx={{ fontSize: 16 }} />
                      </button>
                      <span className="w-8 h-8 flex items-center justify-center text-sm font-bold border-x border-gray-200">{item.quantity}</span>
                      <button 
                        onClick={() => dispatch(updateQuantity({ productId: item.productId, size: item.size, quantity: item.quantity + 1 }))}
                        disabled={atStockLimit}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title={atStockLimit ? 'Maximum stock reached' : 'Increase quantity'}
                      >
                        <AddIcon sx={{ fontSize: 16 }} />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      {item.salePrice ? (
                        <div>
                          <span className="text-xs text-gray-400 line-through block">${(item.price * item.quantity).toFixed(2)}</span>
                          <span className="font-bold text-[#e63946]">${(unitPrice * item.quantity).toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className="font-bold">${(unitPrice * item.quantity).toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-2xl p-6 sticky top-28">
            <h2 className="font-black text-lg mb-6">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-bold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className={`font-bold ${isFreeDelivery ? 'text-green-600' : 'text-gray-500 text-xs'}`}>
                  {isFreeDelivery ? 'FREE' : 'Calculated at checkout'}
                </span>
              </div>
              {!isFreeDelivery && (
                <p className="text-[10px] text-gray-400 mt-1">Add ${(50 - subtotal).toFixed(2)} more for free delivery!</p>
              )}
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between font-black text-lg">
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="block w-full bg-[#0f0f0f] text-white text-center py-4 rounded-full font-bold text-sm hover:bg-[#e63946] transition-colors"
            >
              Proceed to Checkout
            </Link>
            <Link
              href="/shop"
              className="block w-full text-center py-3 text-sm font-medium text-gray-500 hover:text-black transition-colors mt-2"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
