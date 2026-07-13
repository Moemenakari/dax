import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastState {
  toasts: Toast[]
}

const initialState: ToastState = { toasts: [] }

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    addToast: (state, action: PayloadAction<Omit<Toast, 'id'>>) => {
      state.toasts.push({
        ...action.payload,
        id: Date.now().toString() + Math.random().toString(36).slice(2),
      })
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(t => t.id !== action.payload)
    },
  },
})

export const { addToast, removeToast } = toastSlice.actions
export default toastSlice.reducer
