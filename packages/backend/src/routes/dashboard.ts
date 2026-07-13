import { Router, Response } from 'express'
import { db } from '../utils/db'
import { protect, adminOnly } from '../middleware/auth'

const router = Router()

// GET dashboard stats (admin)
router.get('/stats', protect, adminOnly, async (_req, res: Response) => {
  try {
    const [totalProducts]: any = await db.execute(
      'SELECT COUNT(*) as count FROM products WHERE isActive = true'
    )
    const [saleProducts]: any = await db.execute(
      'SELECT COUNT(*) as count FROM products WHERE isActive = true AND salePrice IS NOT NULL'
    )
    const [totalOrders]: any = await db.execute(
      'SELECT COUNT(*) as count FROM orders'
    )
    const [pendingOrders]: any = await db.execute(
      "SELECT COUNT(*) as count FROM orders WHERE status = 'PENDING'"
    )
    const [confirmedOrders]: any = await db.execute(
      "SELECT COUNT(*) as count FROM orders WHERE status = 'CONFIRMED'"
    )
    const [cancelledOrders]: any = await db.execute(
      "SELECT COUNT(*) as count FROM orders WHERE status = 'CANCELLED'"
    )
    const [deliveredOrders]: any = await db.execute(
      "SELECT COUNT(*) as count FROM orders WHERE status = 'DELIVERED'"
    )
    const [totalRevenue]: any = await db.execute(
      "SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status IN ('CONFIRMED','PROCESSING','SHIPPED','DELIVERED')"
    )
    const [paidOrders]: any = await db.execute(
      "SELECT COUNT(*) as count FROM orders WHERE paymentStatus = 'PAID'"
    )
    const [underReviewOrders]: any = await db.execute(
      "SELECT COUNT(*) as count FROM orders WHERE paymentStatus = 'UNDER_REVIEW'"
    )
    const [totalUsers]: any = await db.execute(
      'SELECT COUNT(*) as count FROM users'
    )
    const [recentOrders]: any = await db.execute(
      `SELECT o.*, u.name, u.phone
       FROM orders o JOIN users u ON o.userId = u.id
       ORDER BY o.createdAt DESC LIMIT 10`
    )

    // Monthly trend: last 6 months of orders and revenue
    const [monthlyTrend]: any = await db.execute(
      `SELECT
         DATE_FORMAT(createdAt, '%b %Y') as month,
         DATE_FORMAT(createdAt, '%Y-%m') as monthKey,
         COUNT(*) as orders,
         COALESCE(SUM(CASE WHEN status NOT IN ('CANCELLED') THEN total ELSE 0 END), 0) as revenue
       FROM orders
       WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(createdAt, '%Y-%m'), DATE_FORMAT(createdAt, '%b %Y')
       ORDER BY monthKey ASC`
    )

    res.json({
      totalProducts: totalProducts[0].count,
      saleProducts: saleProducts[0].count,
      totalOrders: totalOrders[0].count,
      pendingOrders: pendingOrders[0].count,
      confirmedOrders: confirmedOrders[0].count,
      cancelledOrders: cancelledOrders[0].count,
      deliveredOrders: deliveredOrders[0].count,
      totalRevenue: totalRevenue[0].total,
      paidOrders: paidOrders[0].count,
      underReviewOrders: underReviewOrders[0].count,
      totalUsers: totalUsers[0].count,
      recentOrders,
      monthlyTrend,
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
