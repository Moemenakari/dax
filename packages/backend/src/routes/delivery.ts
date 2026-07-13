import { Router, Request, Response } from 'express'
import { db } from '../utils/db'
import { protect, adminOnly } from '../middleware/auth'

const router = Router()

// ─── DELIVERY COMPANIES ───

// GET all companies (public)
router.get('/companies', async (_req, res: Response) => {
  try {
    const [rows]: any = await db.execute(
      'SELECT * FROM delivery_companies WHERE isActive = true ORDER BY name'
    )
    res.json(rows)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// POST create company (admin)
router.post('/companies', protect, adminOnly, async (req: Request, res: Response) => {
  try {
    const { name, logo, description } = req.body
    const [result]: any = await db.execute(
      'INSERT INTO delivery_companies (name, logo, description) VALUES (?, ?, ?)',
      [name, logo || null, description || null]
    )
    res.status(201).json({ id: result.insertId, message: 'Company created' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// PUT update company (admin)
router.put('/companies/:id', protect, adminOnly, async (req: Request, res: Response) => {
  try {
    const { name, logo, description, isActive } = req.body
    await db.execute(
      'UPDATE delivery_companies SET name=?, logo=?, description=?, isActive=? WHERE id=?',
      [name, logo, description, isActive, req.params.id]
    )
    res.json({ message: 'Company updated' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// DELETE company (admin)
router.delete('/companies/:id', protect, adminOnly, async (req: Request, res: Response) => {
  try {
    await db.execute('UPDATE delivery_companies SET isActive = false WHERE id = ?', [req.params.id])
    res.json({ message: 'Company removed' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// ─── DELIVERY AREAS ───

// GET all areas (public)
router.get('/areas', async (_req, res: Response) => {
  try {
    const [rows]: any = await db.execute(
      `SELECT a.*, c.name as companyName, c.logo as companyLogo 
       FROM delivery_areas a 
       LEFT JOIN delivery_companies c ON a.companyId = c.id 
       WHERE a.isActive = true 
       ORDER BY a.price ASC`
    )
    res.json(rows)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// POST create area (admin)
router.post('/areas', protect, adminOnly, async (req: Request, res: Response) => {
  try {
    const { companyId, areaName, price, estimatedTime } = req.body
    const [result]: any = await db.execute(
      'INSERT INTO delivery_areas (companyId, areaName, price, estimatedTime) VALUES (?, ?, ?, ?)',
      [companyId || null, areaName, price, estimatedTime]
    )
    res.status(201).json({ id: result.insertId, message: 'Area created' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// PUT update area (admin)
router.put('/areas/:id', protect, adminOnly, async (req: Request, res: Response) => {
  try {
    const { companyId, areaName, price, estimatedTime, isActive } = req.body
    await db.execute(
      'UPDATE delivery_areas SET companyId=?, areaName=?, price=?, estimatedTime=?, isActive=? WHERE id=?',
      [companyId || null, areaName, price, estimatedTime, isActive, req.params.id]
    )
    res.json({ message: 'Area updated' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// DELETE area (admin)
router.delete('/areas/:id', protect, adminOnly, async (req: Request, res: Response) => {
  try {
    await db.execute('UPDATE delivery_areas SET isActive = false WHERE id = ?', [req.params.id])
    res.json({ message: 'Area removed' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
