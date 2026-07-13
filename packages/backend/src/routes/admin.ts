import { Router, Request, Response } from 'express'
import { db } from '../utils/db'
import { protect, adminOnly } from '../middleware/auth'

const router = Router()

// GET all users with order counts (admin only)
router.get('/users', protect, adminOnly, async (_req: Request, res: Response) => {
  try {
    const [users]: any = await db.execute(`
      SELECT 
        u.id, 
        u.name, 
        u.phone, 
        u.email,
        u.address, 
        u.role, 
        u.createdAt,
        COUNT(o.id) as totalOrders
      FROM users u
      LEFT JOIN orders o ON u.id = o.userId
      GROUP BY u.id
      ORDER BY u.createdAt DESC
    `)
    res.json(users)
  } catch (error) {
    console.error('Admin users error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
