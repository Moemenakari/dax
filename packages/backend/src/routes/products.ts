import { Router, Request, Response } from 'express'
import { db } from '../utils/db'
import { protect, adminOnly } from '../middleware/auth'

const router = Router()

// GET all products (with filters)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, sale, trendy, featured, search, limit } = req.query

    let query = `
      SELECT p.*,
        (SELECT url FROM product_images WHERE productId = p.id AND isPrimary = true LIMIT 1) as image
      FROM products p
      WHERE p.isActive = true
    `
    const params: any[] = []

    if (category) { query += ' AND p.category = ?'; params.push(category) }
    if (sale === 'true') { query += ' AND p.salePrice IS NOT NULL' }
    if (trendy === 'true') { query += ' AND p.isTopTrendy = true' }
    if (featured === 'true') { query += ' AND p.isFeatured = true' }
    if (search) { 
      query += ' AND (p.title LIKE ? OR p.description LIKE ? OR p.category LIKE ?)'
      const s = `%${search}%`
      params.push(s, s, s)
    }

    query += ' ORDER BY p.createdAt DESC'
    if (limit) { query += ' LIMIT ?'; params.push(Number(limit)) }

    const [products]: any = await db.execute(query, params)
    res.json(products)
  } catch (error) {
    console.error('Products error:', error)
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' })
  }
})

// GET single product
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const [products]: any = await db.execute(
      'SELECT * FROM products WHERE id = ? AND isActive = true', [req.params.id]
    )
    if (!products[0])
      return res.status(404).json({ message: 'Product not found' })

    const [images]: any = await db.execute(
      'SELECT * FROM product_images WHERE productId = ? ORDER BY isPrimary DESC, sortOrder ASC', [req.params.id]
    )
    const [sizes]: any = await db.execute(
      'SELECT * FROM product_sizes WHERE productId = ?', [req.params.id]
    )

    // Get related products (same category)
    const [related]: any = await db.execute(
      `SELECT p.*, 
        (SELECT url FROM product_images WHERE productId = p.id AND isPrimary = true LIMIT 1) as image
       FROM products p 
       WHERE p.category = ? AND p.id != ? AND p.isActive = true 
       ORDER BY RAND() LIMIT 8`,
      [products[0].category, req.params.id]
    )

    res.json({ ...products[0], images, sizes, related })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// POST create product (admin only)
router.post('/', protect, adminOnly, async (req: Request, res: Response) => {
  try {
    const { title, description, category, price, salePrice, 
            isTopTrendy, isFeatured, isSale, images, sizes } = req.body

    const [result]: any = await db.execute(
      `INSERT INTO products 
       (title, description, category, price, salePrice, isTopTrendy, isFeatured, isSale)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, category, price, salePrice || null,
       isTopTrendy || false, isFeatured || false, isSale || false]
    )

    const productId = result.insertId

    // Insert images
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await db.execute(
          'INSERT INTO product_images (productId, url, isPrimary, sortOrder) VALUES (?, ?, ?, ?)',
          [productId, images[i].url, i === 0, i]
        )
      }
    }

    // Insert sizes
    if (sizes && sizes.length > 0) {
      for (const s of sizes) {
        await db.execute(
          'INSERT INTO product_sizes (productId, size, stock) VALUES (?, ?, ?)',
          [productId, s.size, s.stock || 0]
        )
      }
    }

    res.status(201).json({ id: productId, message: 'Product created' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// PUT update product (admin only)
router.put('/:id', protect, adminOnly, async (req: Request, res: Response) => {
  try {
    const { title, description, category, price, salePrice, 
            isTopTrendy, isFeatured, isSale, isActive, images, sizes } = req.body

    await db.execute(
      `UPDATE products SET
       title=?, description=?, category=?, price=?,
       salePrice=?, isTopTrendy=?, isFeatured=?, isSale=?, isActive=?
       WHERE id=?`,
      [title, description, category, price, salePrice || null,
       isTopTrendy || false, isFeatured || false, isSale || false, 
       isActive !== false, req.params.id]
    )

    // Update images if provided
    if (images) {
      await db.execute('DELETE FROM product_images WHERE productId = ?', [req.params.id])
      for (let i = 0; i < images.length; i++) {
        await db.execute(
          'INSERT INTO product_images (productId, url, isPrimary, sortOrder) VALUES (?, ?, ?, ?)',
          [req.params.id, images[i].url, i === 0, i]
        )
      }
    }

    // Update sizes if provided
    if (sizes) {
      await db.execute('DELETE FROM product_sizes WHERE productId = ?', [req.params.id])
      for (const s of sizes) {
        await db.execute(
          'INSERT INTO product_sizes (productId, size, stock) VALUES (?, ?, ?)',
          [req.params.id, s.size, s.stock || 0]
        )
      }
    }

    res.json({ message: 'Product updated' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// DELETE product (admin only — soft delete)
router.delete('/:id', protect, adminOnly, async (req: Request, res: Response) => {
  try {
    await db.execute('UPDATE products SET isActive = false WHERE id = ?', [req.params.id])
    res.json({ message: 'Product deleted' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// POST add image to product (admin)
router.post('/:id/images', protect, adminOnly, async (req: Request, res: Response) => {
  try {
    const { url, isPrimary } = req.body
    if (isPrimary) {
      await db.execute('UPDATE product_images SET isPrimary = false WHERE productId = ?', [req.params.id])
    }
    const [existing]: any = await db.execute('SELECT COUNT(*) as c FROM product_images WHERE productId = ?', [req.params.id])
    const sortOrder = existing[0].c
    const [result]: any = await db.execute(
      'INSERT INTO product_images (productId, url, isPrimary, sortOrder) VALUES (?, ?, ?, ?)',
      [req.params.id, url, isPrimary || false, sortOrder]
    )
    res.status(201).json({ id: result.insertId, message: 'Image added' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
