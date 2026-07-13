import bcrypt from 'bcryptjs'
import { db } from './src/utils/db'
import dotenv from 'dotenv'
dotenv.config()

async function main() {
  const phone    = '71234567'
  const password = 'admin123'
  const hashed   = await bcrypt.hash(password, 12)

  await db.execute(
    `INSERT INTO users (name, email, phone, password, role)
     VALUES (?, ?, ?, ?, 'ADMIN')
     ON DUPLICATE KEY UPDATE password = ?, role = 'ADMIN'`,
    ['Admin', 'admin@dax.com', phone, hashed, hashed]
  )

  console.log('✅ Admin created!')
  console.log('   Phone:    ' + phone)
  console.log('   Password: ' + password)
  process.exit(0)
}

main().catch(err => { console.error('❌ Error:', err.message); process.exit(1) })
