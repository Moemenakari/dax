import { Router, Request, Response } from 'express'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { protect, adminOnly } from '../middleware/auth'
import fs from 'fs'
import path from 'path'

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || ''
const API_KEY    = process.env.CLOUDINARY_API_KEY || ''
const API_SECRET = process.env.CLOUDINARY_API_SECRET || ''

const useCloudinary =
  CLOUD_NAME && CLOUD_NAME !== 'your_cloud_name' &&
  API_KEY    && API_KEY    !== 'your_api_key' &&
  API_SECRET && API_SECRET !== 'your_api_secret'

if (useCloudinary) {
  cloudinary.config({ cloud_name: CLOUD_NAME, api_key: API_KEY, api_secret: API_SECRET })
} else {
  console.log('⚠️  Cloudinary not configured — using local file storage for uploads')
}

const UPLOAD_DIR = path.resolve(process.cwd(), 'public/uploads')

const storage = multer.memoryStorage()
const upload  = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } })

const router = Router()

router.post('/', protect, adminOnly, upload.single('image'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file)
        return res.status(400).json({ message: 'No file uploaded' })

      if (useCloudinary) {
        const result = await new Promise<any>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'dax' },
            (err, result) => err ? reject(err) : resolve(result)
          )
          stream.end(req.file!.buffer)
        })
        return res.json({ url: result.secure_url })
      }

      // Local fallback — save to public/uploads/
      if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

      const ext  = (req.file.mimetype.split('/')[1] || 'jpg').replace('jpeg', 'jpg')
      const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      fs.writeFileSync(path.join(UPLOAD_DIR, name), req.file.buffer)

      const host = `${req.protocol}://${req.get('host')}`
      res.json({ url: `${host}/uploads/${name}` })
    } catch (err) {
      console.error('Upload error:', err)
      res.status(500).json({ message: 'Upload failed' })
    }
  }
)

export default router
