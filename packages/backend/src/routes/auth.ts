import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { db } from '../utils/db'
import { protect } from '../middleware/auth'
import { sendEmail, buildPasswordResetEmail } from '../utils/email'

const router = Router()

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, phone, password, email } = req.body

    if (!name || !phone || !password)
      return res.status(400).json({ message: 'All fields are required' })

    if (!/^\d{8}$/.test(phone))
      return res.status(400).json({ message: 'Phone must be 8 digits' })

    const [exists]: any = await db.execute(
      'SELECT id FROM users WHERE phone = ?', [phone]
    )
    if (exists[0])
      return res.status(400).json({ message: 'Phone already registered' })

    const hashed = await bcrypt.hash(password, 12)

    const [result]: any = await db.execute(
      'INSERT INTO users (name, email, password, phone, role, contactEmail) VALUES (?, ?, ?, ?, ?, ?)',
      [name, `${phone}@dax.com`, hashed, phone, 'CUSTOMER', email || null]
    )

    const [newUser]: any = await db.execute(
      'SELECT id, name, phone, role FROM users WHERE id = ?',
      [result.insertId]
    )

    sendToken(newUser[0], 201, res)
  } catch (err: any) {
    console.error('REGISTER ERROR:', err.message)
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body

    const [rows]: any = await db.execute(
      'SELECT * FROM users WHERE phone = ?', [phone]
    )
    const user = rows[0]
    if (!user)
      return res.status(400).json({ message: 'Invalid credentials' })

    const match = await bcrypt.compare(password, user.password)
    if (!match)
      return res.status(400).json({ message: 'Invalid credentials' })

    sendToken(
      { id: user.id, name: user.name, phone: user.phone, role: user.role },
      200, res
    )
  } catch (err: any) {
    console.error('LOGIN ERROR:', err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Logout
router.post('/logout', (_req, res: Response) => {
  res.clearCookie('token')
  res.json({ message: 'Logged out' })
})

// Me — check if still logged in
router.get('/me', protect, (req: any, res: Response) => {
  res.json(req.user)
})

// Update email on account
router.put('/email', protect, async (req: any, res: Response) => {
  try {
    const { email } = req.body
    if (!email || !email.includes('@'))
      return res.status(400).json({ message: 'Valid email required' })

    await db.execute('UPDATE users SET contactEmail = ? WHERE id = ?', [email, req.user.id])
    res.json({ message: 'Email updated' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// Forgot Password — generate token, send email if available
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { phone } = req.body
    const [rows]: any = await db.execute(
      'SELECT id, name, contactEmail FROM users WHERE phone = ?', [phone]
    )
    const user = rows[0]
    if (!user) {
      return res.status(404).json({ message: 'Phone number not found' })
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Delete any old tokens for this user
    await db.execute('DELETE FROM password_reset_tokens WHERE userId = ?', [user.id])

    // Save new token
    await db.execute(
      'INSERT INTO password_reset_tokens (userId, token, expiresAt) VALUES (?, ?, ?)',
      [user.id, token, expiresAt]
    )

    if (user.contactEmail) {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`
      await sendEmail({
        to: user.contactEmail,
        subject: 'Reset Your DAX Password',
        html: buildPasswordResetEmail(user.name, resetUrl),
      })
      return res.json({ message: 'Reset link sent to your email', hasEmail: true })
    }

    // No email on file — return token directly (phone-verified flow)
    res.json({ message: 'User verified. Use this token to reset.', token, hasEmail: false })
  } catch (err: any) {
    console.error('FORGOT PASSWORD ERROR:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Verify reset token
router.get('/verify-reset-token', async (req: Request, res: Response) => {
  try {
    const token = String(req.query.token || '')
    const [rows]: any = await db.execute(
      'SELECT prt.*, u.name FROM password_reset_tokens prt JOIN users u ON prt.userId = u.id WHERE prt.token = ? AND prt.expiresAt > NOW()',
      [token]
    )
    if (!rows[0]) return res.status(400).json({ message: 'Invalid or expired token' })
    res.json({ valid: true, name: rows[0].name })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// Reset Password — accept token or phone
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, phone, newPassword } = req.body
    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required' })
    }

    const hashed = await bcrypt.hash(newPassword, 12)

    if (token) {
      // Token-based reset (from email link)
      const [rows]: any = await db.execute(
        'SELECT userId FROM password_reset_tokens WHERE token = ? AND expiresAt > NOW()',
        [token]
      )
      if (!rows[0]) return res.status(400).json({ message: 'Invalid or expired token' })

      await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashed, rows[0].userId])
      await db.execute('DELETE FROM password_reset_tokens WHERE token = ?', [token])
    } else if (phone) {
      // Phone-based reset (legacy flow)
      await db.execute('UPDATE users SET password = ? WHERE phone = ?', [hashed, phone])
    } else {
      return res.status(400).json({ message: 'Token or phone required' })
    }

    res.json({ message: 'Password reset successfully' })
  } catch (err: any) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Helper — create token + set cookie
function sendToken(user: any, status: number, res: Response) {
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '30d' }
  )

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  })

  res.status(status).json({ user })
}

export default router
