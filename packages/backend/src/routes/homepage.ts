import { Router } from 'express'
import { db } from '../utils/db'
import { protect, adminOnly } from '../middleware/auth'
const router = Router()

// Ensure homepage_content table and default row exist
const initHomepageTable = async () => {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS homepage_content (
        id INT PRIMARY KEY DEFAULT 1,
        hero_title VARCHAR(255) DEFAULT 'Explore the New Mens Collection',
        hero_subtitle VARCHAR(255) DEFAULT 'Premium quality. Modern style. Made for men.',
        hero_image VARCHAR(500) DEFAULT '',
        about_title VARCHAR(255) DEFAULT 'Our Story',
        about_text TEXT,
        about_image VARCHAR(500) DEFAULT '',
        banner_title VARCHAR(255) DEFAULT 'UP TO 70% OFF',
        banner_subtitle VARCHAR(255) DEFAULT 'Limited Time Offer',
        banner_image VARCHAR(500) DEFAULT '',
        sale_percentage INT DEFAULT 70,
        nav_announcement VARCHAR(255) DEFAULT 'Free delivery on orders over $50',
        updated_at DATETIME DEFAULT NOW() ON UPDATE NOW()
      )
    `)
    await db.execute('INSERT IGNORE INTO homepage_content (id) VALUES (1)')

    // try to add the columns if they don't exist (e.g. they weren't in the previous table version)
    try {
      await db.execute('ALTER TABLE homepage_content ADD COLUMN about_title VARCHAR(255) DEFAULT "Our Story"');
    } catch (e) {}
    try {
      await db.execute('ALTER TABLE homepage_content ADD COLUMN banner_title VARCHAR(255) DEFAULT "UP TO 70% OFF"');
    } catch (e) {}
    try {
      await db.execute('ALTER TABLE homepage_content ADD COLUMN banner_subtitle VARCHAR(255) DEFAULT "Limited Time Offer"');
    } catch (e) {}
    try {
      await db.execute('ALTER TABLE homepage_content ADD COLUMN nav_announcement VARCHAR(255) DEFAULT "Free delivery on orders over $50"');
    } catch (e) {}
  } catch (err) {
    console.error('Homepage table init error:', err)
  }
}
initHomepageTable()

router.get('/', async (_req, res) => {
  try {
    const [rows]: any = await db.execute('SELECT * FROM homepage_content WHERE id = 1')
    res.json(rows[0] || {})
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

router.put('/', protect, adminOnly, async (req, res) => {
  try {
    const {
      hero_title, hero_subtitle, hero_image,
      about_title, about_text, about_image,
      banner_title, banner_subtitle, banner_image,
      sale_percentage, nav_announcement
    } = req.body
    await db.execute(`
      UPDATE homepage_content SET
      hero_title=?, hero_subtitle=?, hero_image=?,
      about_title=?, about_text=?, about_image=?,
      banner_title=?, banner_subtitle=?, banner_image=?,
      sale_percentage=?, nav_announcement=?
      WHERE id=1
    `, [
      hero_title, hero_subtitle, hero_image,
      about_title, about_text, about_image,
      banner_title, banner_subtitle, banner_image,
      sale_percentage, nav_announcement
    ])
    res.json({ message: 'Homepage updated successfully' })
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

export default router
