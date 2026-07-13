-- DAX — Database migration for new features
-- Run this once against your dax_db database

-- 1. Add real contact email to users (for email notifications)
ALTER TABLE users ADD COLUMN IF NOT EXISTS contactEmail VARCHAR(255) DEFAULT NULL;

-- 2. Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  userId     INT NOT NULL,
  token      VARCHAR(255) NOT NULL UNIQUE,
  expiresAt  DATETIME NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  code            VARCHAR(50) NOT NULL UNIQUE,
  discountType    ENUM('PERCENTAGE','FIXED') NOT NULL DEFAULT 'PERCENTAGE',
  discountValue   DECIMAL(10,2) NOT NULL,
  minOrderAmount  DECIMAL(10,2) DEFAULT 0,
  maxUses         INT DEFAULT NULL,
  usedCount       INT DEFAULT 0,
  expiresAt       DATETIME DEFAULT NULL,
  isActive        BOOLEAN DEFAULT true,
  createdAt       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Add coupon and Wish payment proof fields to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS couponCode      VARCHAR(50) DEFAULT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discountAmount  DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS wishProofUrl    VARCHAR(500) DEFAULT NULL;
