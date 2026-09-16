const mysql = require('mysql2/promise');
const fs = require('fs');

async function run() {
  console.log('🔌 Connecting to TiDB Cloud...');
  
  const conn = await mysql.createConnection({
    host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: '3ikVM4v75YaHz16.root',
    password: '5Im1stbufwG9AOpp',
    ssl: { rejectUnauthorized: true },
    multipleStatements: true
  });
  
  console.log('✅ Connected to TiDB Cloud!');
  
  // Step 1: Create database
  console.log('📦 Creating database dax_db...');
  await conn.execute('CREATE DATABASE IF NOT EXISTS dax_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
  console.log('  ✅ Database dax_db created');
  
  // Step 2: Use database
  await conn.execute('USE dax_db');
  console.log('  ✅ Using dax_db');
  
  // Step 3: Read and run remaining schema (skip CREATE DATABASE and USE)
  const schema = fs.readFileSync('c:\\Users\\moemen\\Desktop\\dax\\packages\\backend\\schema.sql', 'utf8');
  
  // Remove comments and split by semicolons
  const cleaned = schema
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n');
  
  const statements = cleaned
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .filter(s => !s.toUpperCase().startsWith('CREATE DATABASE'))
    .filter(s => !s.toUpperCase().startsWith('USE '));
  
  console.log(`📦 Running ${statements.length} statements...`);
  
  for (const stmt of statements) {
    try {
      await conn.execute(stmt);
      const preview = stmt.substring(0, 70).replace(/\n/g, ' ');
      console.log('  ✅', preview);
    } catch (err) {
      console.error('  ❌ Error:', err.message);
      console.error('     Statement:', stmt.substring(0, 100).replace(/\n/g, ' '));
    }
  }
  
  // Step 4: Verify tables
  const [tables] = await conn.execute('SHOW TABLES');
  console.log(`\n📋 Tables created (${tables.length}):`);
  tables.forEach(t => console.log('  •', Object.values(t)[0]));
  
  console.log('\n🎉 Done! Database setup complete.');
  await conn.end();
}

run().catch(err => {
  console.error('❌ Connection failed:', err.message);
  process.exit(1);
});
