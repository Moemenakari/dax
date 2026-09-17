const mysql = require('mysql2/promise');

const CATEGORY_IMAGES = {
  'Jackets': [
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80'
  ],
  'Shirts': [
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&auto=format&fit=crop&q=80'
  ],
  'Sport Sets': [
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&auto=format&fit=crop&q=80'
  ],
  'Hoodies': [
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&auto=format&fit=crop&q=80'
  ],
  'Jeans': [
    'https://images.unsplash.com/photo-1542272604-780c36856842?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80'
  ],
  'T-Shirts': [
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80'
  ],
  'Pants': [
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop&q=80'
  ]
};

async function migrate() {
  console.log('🔄 Connecting to TiDB database...');
  const conn = await mysql.createConnection({
    host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: '3ikVM4v75YaHz16.root',
    password: '5Im1stbufwG9AOpp',
    database: 'dax_db',
    ssl: { rejectUnauthorized: true }
  });

  console.log('✅ Connected to TiDB!');

  const [images] = await conn.execute(`
    SELECT pi.id, pi.productId, pi.url, pi.isPrimary, pi.sortOrder, p.category, p.title
    FROM product_images pi
    JOIN products p ON pi.productId = p.id
    WHERE pi.url LIKE '%/uploads/%'
  `);

  console.log(`📋 Found ${images.length} images using temporary /uploads/ URLs to migrate...`);

  const categoryIndex = {};

  for (const img of images) {
    const cat = img.category || 'T-Shirts';
    if (categoryIndex[cat] === undefined) categoryIndex[cat] = 0;
    
    const pool = CATEGORY_IMAGES[cat] || CATEGORY_IMAGES['T-Shirts'];
    const newUrl = pool[categoryIndex[cat] % pool.length];
    categoryIndex[cat]++;

    await conn.execute('UPDATE product_images SET url = ? WHERE id = ?', [newUrl, img.id]);
    console.log(`  ✅ Updated image #${img.id} for "${img.title}" (${cat}) -> ${newUrl}`);
  }

  // Also verify all products have isSale=1 if salePrice is set
  await conn.execute('UPDATE products SET isSale = 1 WHERE salePrice IS NOT NULL AND salePrice > 0');
  console.log('✅ Updated products isSale flags for items with sale prices.');

  const [remaining] = await conn.execute('SELECT * FROM product_images');
  console.log('\n✨ Migration Complete! All product images:');
  console.table(remaining.map(r => ({ id: r.id, productId: r.productId, url: r.url })));

  await conn.end();
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
