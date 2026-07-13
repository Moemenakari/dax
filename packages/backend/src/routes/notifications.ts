import { Router, Response } from 'express'
import { db } from '../utils/db'
import { protect } from '../middleware/auth'

const router = Router()

// GET my notifications
router.get('/', protect, async (req: any, res: Response) => {
  try {
    const [rows]: any = await db.execute(
      'SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT 50',
      [req.user.id]
    )
    res.json(rows)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// GET unread count
router.get('/unread', protect, async (req: any, res: Response) => {
  try {
    const [rows]: any = await db.execute(
      'SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND isRead = false',
      [req.user.id]
    )
    res.json({ count: rows[0].count })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// PUT mark as read
router.put('/:id/read', protect, async (req: any, res: Response) => {
  try {
    await db.execute(
      'UPDATE notifications SET isRead = true WHERE id = ? AND userId = ?',
      [req.params.id, req.user.id]
    )
    res.json({ message: 'Marked as read' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// PUT mark all as read
router.put('/read-all', protect, async (req: any, res: Response) => {
  try {
    await db.execute(
      'UPDATE notifications SET isRead = true WHERE userId = ?',
      [req.user.id]
    )
    res.json({ message: 'All marked as read' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
