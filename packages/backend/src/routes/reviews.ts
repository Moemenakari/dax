import { Router, Request, Response } from 'express'
import { db } from '../utils/db'
import { protect, adminOnly } from '../middleware/auth'

const router = Router()

// GET visible reviews (public)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { productId } = req.query
    let query = 'SELECT * FROM reviews WHERE isVisible = true'
    const params: any[] = []

    if (productId) {
      query += ' AND productId = ?'
      params.push(productId)
    }

    query += ' ORDER BY sortOrder ASC, createdAt DESC'

    const [rows]: any = await db.execute(query, params)
    res.json(rows)
  } catch (error) {
    console.error('Reviews error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET all reviews including hidden (admin)
router.get('/all', protect, adminOnly, async (_req, res: Response) => {
  try {
    const [rows]: any = await db.execute('SELECT * FROM reviews ORDER BY sortOrder ASC, createdAt DESC')
    res.json(rows)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// POST submit review — customers (protected, auto-hidden until admin approves)
router.post('/submit', protect, async (req: any, res: Response) => {
  try {
    const { productId, rating, comment } = req.body
    if (!comment || !rating) {
      return res.status(400).json({ message: 'Rating and comment are required' })
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' })
    }

    const [result]: any = await db.execute(
      'INSERT INTO reviews (productId, customerName, rating, comment, isVisible) VALUES (?, ?, ?, ?, false)',
      [productId || null, req.user.name, rating, comment]
    )
    res.status(201).json({ id: result.insertId, message: 'Review submitted! It will appear after approval.' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// POST create review (admin — immediately visible)
router.post('/', protect, adminOnly, async (req: Request, res: Response) => {
  try {
    const { customerName, rating, comment, sortOrder, productId } = req.body
    const [result]: any = await db.execute(
      'INSERT INTO reviews (productId, customerName, rating, comment, sortOrder, isVisible) VALUES (?, ?, ?, ?, ?, true)',
      [productId || null, customerName, rating || 5, comment, sortOrder || 0]
    )
    res.status(201).json({ id: result.insertId, message: 'Review created' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// PUT update review (admin)
router.put('/:id', protect, adminOnly, async (req: Request, res: Response) => {
  try {
    const { customerName, rating, comment, isVisible, sortOrder } = req.body
    await db.execute(
      'UPDATE reviews SET customerName=?, rating=?, comment=?, isVisible=?, sortOrder=? WHERE id=?',
      [customerName, rating, comment, isVisible, sortOrder, req.params.id]
    )
    res.json({ message: 'Review updated' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// DELETE review (admin)
router.delete('/:id', protect, adminOnly, async (req: Request, res: Response) => {
  try {
    await db.execute('DELETE FROM reviews WHERE id = ?', [req.params.id])
    res.json({ message: 'Review deleted' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
