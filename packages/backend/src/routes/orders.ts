import { Router, Request, Response } from 'express'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { db } from '../utils/db'
import { protect, adminOnly } from '../middleware/auth'
import { sendEmail, buildOrderConfirmationEmail } from '../utils/email'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

const router = Router()

// Create order
router.post('/', protect, async (req: any, res: Response) => {
  try {
    const {
      items, deliveryAreaId, deliveryFee, paymentMethod, subtotal, total,
      customerName, customerPhone, customerAddress, customerCity, notes,
      couponCode, discountAmount, wishProofUrl,
    } = req.body

    let paymentStatus = 'NOT_PAID'
    if (paymentMethod === 'WISH') paymentStatus = 'UNDER_REVIEW'

    const [order]: any = await db.execute(
      `INSERT INTO orders
       (userId, status, paymentMethod, paymentStatus, deliveryAreaId, deliveryFee,
        subtotal, total, customerName, customerPhone, customerAddress, customerCity,
        notes, couponCode, discountAmount, wishProofUrl)
       VALUES (?, 'PENDING', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, paymentMethod || 'COD', paymentStatus,
       deliveryAreaId || null, deliveryFee || 0, subtotal, total,
       customerName || req.user.name, customerPhone || req.user.phone,
       customerAddress || '', customerCity || '', notes || '',
       couponCode || null, discountAmount || 0, wishProofUrl || null]
    )

    const orderId = order.insertId

    for (const item of items) {
      await db.execute(
        `INSERT INTO order_items
         (orderId, productId, titleSnapshot, priceSnapshot, salePriceSnapshot, size, qty, imageSnapshotUrl)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, item.productId, item.title,
         item.price, item.salePrice || null, item.size, item.qty, item.image]
      )
      await db.execute(
        `UPDATE product_sizes SET stock = stock - ?
         WHERE productId = ? AND size = ?`,
        [item.qty, item.productId, item.size]
      )
    }

    // Apply coupon usage count
    if (couponCode) {
      await db.execute(
        'UPDATE coupons SET usedCount = usedCount + 1 WHERE code = ?',
        [couponCode]
      )
    }

    // In-app notification
    await db.execute(
      'INSERT INTO notifications (userId, title, message, type) VALUES (?, ?, ?, ?)',
      [req.user.id, 'Order Placed', `Your order #${orderId} has been placed successfully!`, 'order']
    )

    // Send confirmation email if user has contactEmail
    try {
      const [userRows]: any = await db.execute(
        'SELECT contactEmail, name FROM users WHERE id = ?', [req.user.id]
      )
      const userEmail = userRows[0]?.contactEmail
      if (userEmail) {
        const orderData = {
          id: orderId, customerName, customerPhone, customerAddress, customerCity,
          paymentMethod: paymentMethod || 'COD', paymentStatus, total,
          createdAt: new Date(),
        }
        await sendEmail({
          to: userEmail,
          subject: `Order #${orderId} Confirmed — DAX`,
          html: buildOrderConfirmationEmail(orderData, items.map((i: any) => ({
            titleSnapshot: i.title,
            priceSnapshot: i.price,
            salePriceSnapshot: i.salePrice,
            size: i.size,
            qty: i.qty,
          }))),
        })
      }
    } catch (emailErr) {
      console.error('[Email] Order confirmation failed:', emailErr)
    }

    res.status(201).json({ orderId, message: 'Order placed successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Upload Wish payment proof (authenticated customer)
router.post('/:id/proof', protect, upload.single('proof'), async (req: any, res: Response) => {
  try {
    const orderId = req.params.id

    // Verify order belongs to user
    const [orders]: any = await db.execute(
      'SELECT id, paymentMethod FROM orders WHERE id = ? AND userId = ?',
      [orderId, req.user.id]
    )
    if (!orders[0]) return res.status(404).json({ message: 'Order not found' })
    if (orders[0].paymentMethod !== 'WISH') {
      return res.status(400).json({ message: 'Payment proof only for Wish orders' })
    }
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })

    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'dax/proofs' },
        (err, result) => (err ? reject(err) : resolve(result))
      )
      stream.end(req.file!.buffer)
    })

    await db.execute(
      'UPDATE orders SET wishProofUrl = ?, paymentStatus = ? WHERE id = ?',
      [result.secure_url, 'UNDER_REVIEW', orderId]
    )

    res.json({ message: 'Proof uploaded', url: result.secure_url })
  } catch (err) {
    console.error('Proof upload error:', err)
    res.status(500).json({ message: 'Upload failed' })
  }
})

// Get my orders
router.get('/my', protect, async (req: any, res: Response) => {
  try {
    const [orders]: any = await db.execute(
      'SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC', [req.user.id]
    )
    for (const order of orders) {
      const [items]: any = await db.execute(
        'SELECT * FROM order_items WHERE orderId = ?', [order.id]
      )
      order.items = items
    }
    res.json(orders)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// Get single order (customer or admin)
router.get('/:id', protect, async (req: any, res: Response) => {
  try {
    let query = `SELECT o.*, u.name as customerName, u.phone as customerPhone
                 FROM orders o JOIN users u ON o.userId = u.id WHERE o.id = ?`
    const params: any[] = [req.params.id]

    if (req.user.role !== 'ADMIN') {
      query += ' AND o.userId = ?'
      params.push(req.user.id)
    }

    const [orders]: any = await db.execute(query, params)
    if (!orders[0]) return res.status(404).json({ message: 'Order not found' })

    const [items]: any = await db.execute(
      'SELECT * FROM order_items WHERE orderId = ?', [req.params.id]
    )

    res.json({ ...orders[0], items })
  } catch (error) {
    console.error('Order detail error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get all orders (admin)
router.get('/', protect, adminOnly, async (req: Request, res: Response) => {
  try {
    const { status, paymentStatus, paymentMethod } = req.query
    let query = `SELECT o.*, u.name, u.phone
                 FROM orders o JOIN users u ON o.userId = u.id`
    const conditions: string[] = []
    const params: any[] = []

    if (status) { conditions.push('o.status = ?'); params.push(status) }
    if (paymentStatus) { conditions.push('o.paymentStatus = ?'); params.push(paymentStatus) }
    if (paymentMethod) { conditions.push('o.paymentMethod = ?'); params.push(paymentMethod) }

    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ')
    query += ' ORDER BY o.createdAt DESC'

    const [orders]: any = await db.execute(query, params)
    for (const order of orders) {
      const [items]: any = await db.execute(
        'SELECT * FROM order_items WHERE orderId = ?', [order.id]
      )
      order.items = items
    }

    res.json(orders)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// Update order status (admin)
router.put('/:id/status', protect, adminOnly, async (req: Request, res: Response) => {
  try {
    const { status } = req.body
    await db.execute('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id])

    const [order]: any = await db.execute('SELECT userId FROM orders WHERE id = ?', [req.params.id])
    if (order[0]) {
      const statusMessages: Record<string, string> = {
        PENDING: 'Your order is pending.',
        REVIEW: 'Your order is under review.',
        CONFIRMED: 'Your order has been confirmed! 🎉',
        PROCESSING: 'Your order is being processed.',
        SHIPPED: 'Your order has been shipped! 🚚',
        DELIVERED: 'Your order has been delivered! ✅',
        CANCELLED: 'Your order has been cancelled.',
      }
      await db.execute(
        'INSERT INTO notifications (userId, title, message, type) VALUES (?, ?, ?, ?)',
        [order[0].userId, 'Order Update',
         `Order #${req.params.id}: ${statusMessages[status] || status}`, 'order']
      )
    }

    res.json({ message: 'Order status updated' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// Update payment status (admin)
router.put('/:id/payment', protect, adminOnly, async (req: Request, res: Response) => {
  try {
    const { paymentStatus } = req.body
    await db.execute('UPDATE orders SET paymentStatus = ? WHERE id = ?', [paymentStatus, req.params.id])

    const [order]: any = await db.execute('SELECT userId FROM orders WHERE id = ?', [req.params.id])
    if (order[0]) {
      const msg = paymentStatus === 'PAID'
        ? `Payment for order #${req.params.id} has been confirmed! ✅`
        : `Payment status for order #${req.params.id} updated to ${paymentStatus}.`
      await db.execute(
        'INSERT INTO notifications (userId, title, message, type) VALUES (?, ?, ?, ?)',
        [order[0].userId, 'Payment Update', msg, 'payment']
      )
    }

    res.json({ message: 'Payment status updated' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// Cancel order (customer)
router.put('/:id/cancel', protect, async (req: any, res: Response) => {
  try {
    const { reason } = req.body

    const [orders]: any = await db.execute(
      'SELECT * FROM orders WHERE id = ? AND userId = ?', [req.params.id, req.user.id]
    )
    if (!orders[0]) return res.status(404).json({ message: 'Order not found' })
    if (orders[0].status !== 'PENDING') {
      return res.status(400).json({ message: 'Only pending orders can be cancelled' })
    }

    await db.execute(
      'UPDATE orders SET status = ?, notes = ? WHERE id = ? AND userId = ?',
      ['CANCELLED', reason || 'Cancelled by customer', req.params.id, req.user.id]
    )

    const [items]: any = await db.execute('SELECT * FROM order_items WHERE orderId = ?', [req.params.id])
    for (const item of items) {
      await db.execute(
        'UPDATE product_sizes SET stock = stock + ? WHERE productId = ? AND size = ?',
        [item.qty, item.productId, item.size]
      )
    }

    await db.execute(
      'INSERT INTO notifications (userId, title, message, type) VALUES (?, ?, ?, ?)',
      [req.user.id, 'Order Cancelled', `Your order #${req.params.id} has been cancelled.`, 'order']
    )

    res.json({ message: 'Order cancelled successfully' })
  } catch (err) {
    console.error('Cancel order error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
