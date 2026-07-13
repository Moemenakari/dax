import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import path from 'path'
dotenv.config()

import authRoutes          from './routes/auth'
import productRoutes       from './routes/products'
import orderRoutes         from './routes/orders'
import wishlistRoutes      from './routes/wishlist'
import uploadRoutes        from './routes/upload'
import settingsRoutes      from './routes/settings'
import deliveryRoutes      from './routes/delivery'
import homepageRoutes      from './routes/homepage'
import reviewRoutes        from './routes/reviews'
import faqRoutes           from './routes/faq'
import notificationRoutes  from './routes/notifications'
import dashboardRoutes     from './routes/dashboard'
import adminRoutes         from './routes/admin'
import couponRoutes        from './routes/coupons'
import { errorHandler }    from './middleware/errorHandler'

const app = express()

app.use(cors({
  origin: function(origin, callback) {
    const allowed = [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:3002',
      process.env.CLIENT_URL,
      process.env.ADMIN_URL
    ]
    if (!origin || allowed.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))
app.use(express.json())
app.use(cookieParser() as any)
app.use('/uploads', express.static(path.resolve(process.cwd(), 'public/uploads')))

// Add CSP headers
app.use((_req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' http://localhost:* ws://localhost:*; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
  )
  next()
})

app.use('/api/auth',          authRoutes)
app.use('/api/products',      productRoutes)
app.use('/api/orders',        orderRoutes)
app.use('/api/wishlist',      wishlistRoutes)
app.use('/api/upload',        uploadRoutes)
app.use('/api/settings',      settingsRoutes)
app.use('/api/delivery',      deliveryRoutes)
app.use('/api/homepage',      homepageRoutes)
app.use('/api/reviews',       reviewRoutes)
app.use('/api/faq',           faqRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/dashboard',     dashboardRoutes)
app.use('/api/admin',         adminRoutes)
app.use('/api/coupons',       couponRoutes)

app.get('/health', (_, res) => res.json({ status: 'ok' }))
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`))
