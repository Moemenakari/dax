import { configureStore } from '@reduxjs/toolkit'
import cartReducer from './cartSlice'
import authReducer from './authSlice'
import toastReducer from './toastSlice'

// Save state to local storage
const saveState = (state: RootState) => {
  try {
    if (typeof window === 'undefined') return;
    const serializedState = JSON.stringify(state.cart);
    window.localStorage.setItem('dax_cart_state', serializedState);
  } catch {
    // ignore write errors
  }
};

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    toast: toastReducer,
  },
})

store.subscribe(() => {
  saveState(store.getState());
})

export type RootState   = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
