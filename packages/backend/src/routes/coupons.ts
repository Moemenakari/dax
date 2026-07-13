import { Router, Request, Response } from 'express'
import { db } from '../utils/db'
import { protect, adminOnly } from '../middleware/auth'

const router = Router()

// GET all coupons (admin)
router.get('/', protect, adminOnly, async (_req, res: Response) => {
  try {
    const [rows]: any = await db.execute('SELECT * FROM coupons ORDER BY createdAt DESC')
    res.json(rows)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// POST validate + preview coupon discount (authenticated)
router.post('/apply', protect, async (req: Request, res: Response) => {
  try {
    const { code, orderTotal } = req.body
    if (!code) return res.status(400).json({ message: 'Coupon code required' })

    const [rows]: any = await db.execute(
      `SELECT * FROM coupons
       WHERE code = ? AND isActive = true
         AND (expiresAt IS NULL OR expiresAt > NOW())
         AND (maxUses IS NULL OR usedCount < maxUses)`,
      [code.toUpperCase()]
    )
    const coupon = rows[0]
    if (!coupon) return res.status(404).json({ message: 'Invalid or expired coupon' })

    if (orderTotal < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `Minimum order $${coupon.minOrderAmount} required for this coupon`,
      })
    }

    let discount = 0
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (orderTotal * coupon.discountValue) / 100
    } else {
      discount = Math.min(coupon.discountValue, orderTotal)
    }

    res.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discount: Number(discount.toFixed(2)),
    })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// POST create coupon (admin)
router.post('/', protect, adminOnly, async (req: Request, res: Response) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, maxUses, expiresAt } = req.body
    if (!code || !discountValue) {
      return res.status(400).json({ message: 'Code and discount value are required' })
    }
    const [result]: any = await db.execute(
      `INSERT INTO coupons (code, discountType, discountValue, minOrderAmount, maxUses, expiresAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [code.toUpperCase(), discountType || 'PERCENTAGE', discountValue,
       minOrderAmount || 0, maxUses || null, expiresAt || null]
    )
    res.status(201).json({ id: result.insertId, message: 'Coupon created' })
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(400).json({ message: 'Coupon code already exists' })
    res.status(500).json({ message: 'Server error' })
  }
})

// PUT update coupon (admin)
router.put('/:id', protect, adminOnly, async (req: Request, res: Response) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, maxUses, expiresAt, isActive } = req.body
    await db.execute(
      `UPDATE coupons SET code=?, discountType=?, discountValue=?, minOrderAmount=?,
       maxUses=?, expiresAt=?, isActive=? WHERE id=?`,
      [code?.toUpperCase(), discountType, discountValue, minOrderAmount,
       maxUses || null, expiresAt || null, isActive, req.params.id]
    )
    res.json({ message: 'Coupon updated' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// DELETE coupon (admin)
router.delete('/:id', protect, adminOnly, async (req: Request, res: Response) => {
  try {
    await db.execute('DELETE FROM coupons WHERE id = ?', [req.params.id])
    res.json({ message: 'Coupon deleted' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
