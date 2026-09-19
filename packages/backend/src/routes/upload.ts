import { Router, Request, Response } from 'express'
import multer from 'multer'
import { createClient } from '@supabase/supabase-js'
import { protect, adminOnly } from '../middleware/auth'
import fs from 'fs'
import path from 'path'

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ''
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || 'products'

const useSupabase = Boolean(
  SUPABASE_URL &&
  SUPABASE_KEY &&
  !SUPABASE_URL.includes('your_') &&
  !SUPABASE_KEY.includes('your_')
)

let supabase: ReturnType<typeof createClient> | null = null
if (useSupabase) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
} else {
  console.log('⚠️  Supabase storage not configured — using local file storage for uploads in development')
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
const UPLOAD_DIR = path.resolve(process.cwd(), 'public/uploads')

const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: JPEG, PNG, WebP, GIF, AVIF`))
    }
  }
})

const router = Router()

const handleMulterUpload = (req: Request, res: Response): Promise<void> => {
  return new Promise((resolve, reject) => {
    upload.single('image')(req as any, res as any, (err: any) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

// ── POST /api/upload — file upload ──
router.post('/', protect, adminOnly, async (req: Request, res: Response) => {
  try {
    try {
      await handleMulterUpload(req, res)
    } catch (multerErr: any) {
      if (multerErr.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          message: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`
        })
      }
      return res.status(400).json({
        message: multerErr.message || 'Invalid file upload.'
      })
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file provided. Please select an image to upload.' })
    }

    const rawExt = req.file.mimetype.split('/')[1] || 'jpg'
    const ext = rawExt.replace('jpeg', 'jpg')
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    // ── Supabase Storage Path ──
    if (useSupabase && supabase) {
      try {
        const { data, error } = await supabase.storage
          .from(SUPABASE_BUCKET)
          .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: false,
          })

        if (error) {
          console.error('Supabase storage upload error:', error)
          return res.status(502).json({
            message: `Supabase upload error: ${error.message}. Make sure bucket "${SUPABASE_BUCKET}" exists and is public.`
          })
        }

        const { data: publicUrlData } = supabase.storage
          .from(SUPABASE_BUCKET)
          .getPublicUrl(data.path)

        return res.json({ url: publicUrlData.publicUrl })
      } catch (err: any) {
        console.error('Supabase upload exception:', err)
        return res.status(502).json({
          message: 'Image storage provider failed. Please try again in a moment.'
        })
      }
    }

    // ── Production without Cloud Storage ──
    if (process.env.NODE_ENV === 'production') {
      console.error('Upload attempted in production without Supabase Storage configured.')
      return res.status(503).json({
        message: 'Image upload is not configured on Render. Please set SUPABASE_URL, SUPABASE_ANON_KEY (or SERVICE_ROLE_KEY), and SUPABASE_BUCKET in your Render Environment Variables.'
      })
    }

    // ── Local fallback for development ──
    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })
    fs.writeFileSync(path.join(UPLOAD_DIR, fileName), req.file.buffer)

    const host = `${req.protocol}://${req.get('host')}`
    res.json({ url: `${host}/uploads/${fileName}` })
  } catch (err: any) {
    console.error('Upload error (unhandled):', err)
    res.status(500).json({ message: 'An unexpected error occurred during upload. Please try again.' })
  }
})

export default router
