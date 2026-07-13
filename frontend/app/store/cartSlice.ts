import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface CartItem {
  productId: number
  title: string
  price: number
  salePrice: number | null
  size: string
  quantity: number
  image: string
  stock: number
}

interface CartState {
  items: CartItem[]
}

const initialState: CartState = { items: [] }

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find(
        i => i.productId === action.payload.productId
          && i.size === action.payload.size
      )
      if (existing) {
        // Block if already at stock limit
        if (existing.quantity >= action.payload.stock) return
        const newQty = existing.quantity + action.payload.quantity
        existing.quantity = Math.min(newQty, action.payload.stock)
        existing.stock = action.payload.stock
      } else {
        state.items.push({
          ...action.payload,
          quantity: Math.min(action.payload.quantity, action.payload.stock)
        })
      }
    },
    removeItem: (state, action: PayloadAction<{productId: number, size: string}>) => {
      state.items = state.items.filter(
        i => !(i.productId === action.payload.productId
             && i.size === action.payload.size)
      )
    },
    updateQuantity: (state, action: PayloadAction<{productId: number, size: string, quantity: number}>) => {
      const item = state.items.find(
        i => i.productId === action.payload.productId
          && i.size === action.payload.size
      )
      if (item) {
        // Block if quantity exceeds stock
        if (action.payload.quantity > item.stock) return
        item.quantity = action.payload.quantity
      }
    },
    clearCart: (state) => { state.items = [] },
    setCartState: (state, action: PayloadAction<CartState>) => {
      state.items = action.payload.items || []
    }
  }
})

export const { addItem, removeItem, updateQuantity, clearCart, setCartState } = cartSlice.actions
export default cartSlice.reducer
