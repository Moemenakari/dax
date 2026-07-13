import { Router, Request, Response } from 'express'
import { db } from '../utils/db'
import { protect, adminOnly } from '../middleware/auth'

const router = Router()

// GET visible FAQ (public)
router.get('/', async (_req, res: Response) => {
  try {
    const [rows]: any = await db.execute(
      'SELECT * FROM faq WHERE isVisible = true ORDER BY sortOrder ASC, createdAt DESC'
    )
    res.json(rows)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// GET all FAQ (admin)
router.get('/all', protect, adminOnly, async (_req, res: Response) => {
  try {
    const [rows]: any = await db.execute('SELECT * FROM faq ORDER BY sortOrder ASC')
    res.json(rows)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// POST create FAQ (admin)
router.post('/', protect, adminOnly, async (req: Request, res: Response) => {
  try {
    const { question, answer, sortOrder } = req.body
    const [result]: any = await db.execute(
      'INSERT INTO faq (question, answer, sortOrder) VALUES (?, ?, ?)',
      [question, answer, sortOrder || 0]
    )
    res.status(201).json({ id: result.insertId, message: 'FAQ created' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// PUT update FAQ (admin)
router.put('/:id', protect, adminOnly, async (req: Request, res: Response) => {
  try {
    const { question, answer, isVisible, sortOrder } = req.body
    await db.execute(
      'UPDATE faq SET question=?, answer=?, isVisible=?, sortOrder=? WHERE id=?',
      [question, answer, isVisible, sortOrder, req.params.id]
    )
    res.json({ message: 'FAQ updated' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// DELETE FAQ (admin)
router.delete('/:id', protect, adminOnly, async (req: Request, res: Response) => {
  try {
    await db.execute('DELETE FROM faq WHERE id = ?', [req.params.id])
    res.json({ message: 'FAQ deleted' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
