import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { db } from '../utils/db'

export const protect = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token
    if (!token)
      return res.status(401).json({ message: 'Not authenticated' })

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)
    const [rows]: any = await db.execute(
      'SELECT id, name, email, phone, role FROM users WHERE id = ?',
      [decoded.id]
    )
    if (!rows[0])
      return res.status(401).json({ message: 'User not found' })

    req.user = rows[0]
    next()
  } catch {
    res.status(401).json({ message: 'Invalid token' })
  }
}

export const adminOnly = (req: any, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN')
    return res.status(403).json({ message: 'Admins only' })
  next()
}
