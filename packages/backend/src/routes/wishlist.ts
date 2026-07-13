import { Router, Response } from 'express'
import { db } from '../utils/db'
import { protect } from '../middleware/auth'

const router = Router()

// Get wishlist
router.get('/', protect, async (req: any, res: Response) => {
  try {
    const [items]: any = await db.execute(
      `SELECT w.id, p.id as productId, p.title, p.price, p.salePrice,
        (SELECT url FROM product_images WHERE productId = p.id AND isPrimary = true LIMIT 1) as image
       FROM wishlist w
       JOIN products p ON w.productId = p.id
       WHERE w.userId = ?`,
      [req.user.id]
    )
    res.json(items)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// Add to wishlist
router.post('/:productId', protect, async (req: any, res: Response) => {
  try {
    const [exists]: any = await db.execute(
      'SELECT id FROM wishlist WHERE userId = ? AND productId = ?',
      [req.user.id, req.params.productId]
    )
    if (exists[0])
      return res.status(400).json({ message: 'Already in wishlist' })

    await db.execute(
      'INSERT INTO wishlist (userId, productId) VALUES (?, ?)',
      [req.user.id, req.params.productId]
    )
    res.status(201).json({ message: 'Added to wishlist' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// Remove from wishlist
router.delete('/:productId', protect, async (req: any, res: Response) => {
  try {
    await db.execute(
      'DELETE FROM wishlist WHERE userId = ? AND productId = ?',
      [req.user.id, req.params.productId]
    )
    res.json({ message: 'Removed from wishlist' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
