import { Router, Request, Response } from 'express'
import { db } from '../utils/db'
import { protect, adminOnly } from '../middleware/auth'

const router = Router()

// Get settings (public)
router.get('/', async (_req, res: Response) => {
  try {
    const [rows]: any = await db.execute('SELECT * FROM settings LIMIT 1')
    res.json(rows[0])
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// Update settings (admin only)
router.put('/', protect, adminOnly, async (req: Request, res: Response) => {
  try {
    const { deliveryFee, storeName, storePhone, storeEmail, storeAddress, currency } = req.body
    await db.execute(
      `UPDATE settings SET
       deliveryFee=?, storeName=?, storePhone=?, storeEmail=?, storeAddress=?, currency=?
       WHERE id=1`,
      [deliveryFee, storeName, storePhone, storeEmail, storeAddress, currency]
    )
    res.json({ message: 'Settings updated' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
