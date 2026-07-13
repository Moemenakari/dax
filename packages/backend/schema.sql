-- ============================================================
--  DAX — Complete Database Schema
--  Run this once to create everything from scratch
-- ============================================================

CREATE DATABASE IF NOT EXISTS dax_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dax_db;

-- ─── Users ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(255) NOT NULL,
  email        VARCHAR(255) NOT NULL,
  contactEmail VARCHAR(255) DEFAULT NULL,
  phone        VARCHAR(20)  NOT NULL UNIQUE,
  password     VARCHAR(255) NOT NULL,
  role         ENUM('CUSTOMER','ADMIN') DEFAULT 'CUSTOMER',
  address      TEXT,
  createdAt    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Password Reset Tokens ────────────────────────────────
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  userId    INT NOT NULL,
  token     VARCHAR(255) NOT NULL UNIQUE,
  expiresAt DATETIME NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── Products ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  category    VARCHAR(100),
  price       DECIMAL(10,2) NOT NULL,
  salePrice   DECIMAL(10,2) DEFAULT NULL,
  isActive    BOOLEAN DEFAULT true,
  isTopTrendy BOOLEAN DEFAULT false,
  isFeatured  BOOLEAN DEFAULT false,
  isSale      BOOLEAN DEFAULT false,
  createdAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Product Images ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_images (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  productId INT NOT NULL,
  url       VARCHAR(500) NOT NULL,
  isPrimary BOOLEAN DEFAULT false,
  sortOrder INT DEFAULT 0,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);

-- ─── Product Sizes ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_sizes (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  productId INT NOT NULL,
  size      VARCHAR(10) NOT NULL,
  stock     INT DEFAULT 0,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);

-- ─── Delivery Companies ───────────────────────────────────
CREATE TABLE IF NOT EXISTS delivery_companies (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  logo        VARCHAR(500),
  description TEXT,
  isActive    BOOLEAN DEFAULT true,
  createdAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Delivery Areas ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS delivery_areas (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  companyId     INT DEFAULT NULL,
  areaName      VARCHAR(255) NOT NULL,
  price         DECIMAL(10,2) NOT NULL,
  estimatedTime VARCHAR(100),
  isActive      BOOLEAN DEFAULT true,
  FOREIGN KEY (companyId) REFERENCES delivery_companies(id) ON DELETE SET NULL
);

-- ─── Coupons ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coupons (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  code           VARCHAR(50) NOT NULL UNIQUE,
  discountType   ENUM('PERCENTAGE','FIXED') NOT NULL DEFAULT 'PERCENTAGE',
  discountValue  DECIMAL(10,2) NOT NULL,
  minOrderAmount DECIMAL(10,2) DEFAULT 0,
  maxUses        INT DEFAULT NULL,
  usedCount      INT DEFAULT 0,
  expiresAt      DATETIME DEFAULT NULL,
  isActive       BOOLEAN DEFAULT true,
  createdAt      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Orders ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  userId          INT NOT NULL,
  status          ENUM('PENDING','REVIEW','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED') DEFAULT 'PENDING',
  paymentMethod   ENUM('COD','WISH','WHATSAPP') DEFAULT 'COD',
  paymentStatus   ENUM('NOT_PAID','UNDER_REVIEW','PAID') DEFAULT 'NOT_PAID',
  deliveryAreaId  INT DEFAULT NULL,
  deliveryFee     DECIMAL(10,2) DEFAULT 0,
  subtotal        DECIMAL(10,2) NOT NULL,
  total           DECIMAL(10,2) NOT NULL,
  couponCode      VARCHAR(50) DEFAULT NULL,
  discountAmount  DECIMAL(10,2) DEFAULT 0,
  wishProofUrl    VARCHAR(500) DEFAULT NULL,
  customerName    VARCHAR(255),
  customerPhone   VARCHAR(20),
  customerAddress TEXT,
  customerCity    VARCHAR(100),
  notes           TEXT,
  createdAt       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (deliveryAreaId) REFERENCES delivery_areas(id) ON DELETE SET NULL
);

-- ─── Order Items ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  orderId           INT NOT NULL,
  productId         INT DEFAULT NULL,
  titleSnapshot     VARCHAR(255),
  priceSnapshot     DECIMAL(10,2),
  salePriceSnapshot DECIMAL(10,2) DEFAULT NULL,
  size              VARCHAR(10),
  qty               INT,
  imageSnapshotUrl  VARCHAR(500),
  FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
);

-- ─── Wishlist ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlist (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  userId    INT NOT NULL,
  productId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_wish (userId, productId),
  FOREIGN KEY (userId)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);

-- ─── Reviews ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  productId    INT DEFAULT NULL,
  customerName VARCHAR(255) NOT NULL,
  rating       INT DEFAULT 5,
  comment      TEXT,
  isVisible    BOOLEAN DEFAULT true,
  sortOrder    INT DEFAULT 0,
  createdAt    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── FAQ ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS faq (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  question  TEXT NOT NULL,
  answer    TEXT NOT NULL,
  isVisible BOOLEAN DEFAULT true,
  sortOrder INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Notifications ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  userId    INT NOT NULL,
  title     VARCHAR(255),
  message   TEXT,
  type      ENUM('order','payment') DEFAULT 'order',
  isRead    BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── Settings ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  deliveryFee  DECIMAL(10,2) DEFAULT 3.00,
  storeName    VARCHAR(255)  DEFAULT 'DAX',
  storePhone   VARCHAR(50),
  storeEmail   VARCHAR(255),
  storeAddress TEXT,
  currency     VARCHAR(10)   DEFAULT 'USD'
);

-- ─── Homepage Content ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS homepage_content (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  hero_title       VARCHAR(255),
  hero_subtitle    TEXT,
  hero_image       VARCHAR(500),
  about_title      VARCHAR(255),
  about_text       TEXT,
  about_image      VARCHAR(500),
  banner_title     VARCHAR(255),
  banner_subtitle  TEXT,
  banner_image     VARCHAR(500),
  sale_percentage  INT DEFAULT 0,
  nav_announcement VARCHAR(500),
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── Default Data ─────────────────────────────────────────

INSERT IGNORE INTO settings (id, storeName, storePhone, currency)
VALUES (1, 'DAX', '96170474719', 'USD');

INSERT IGNORE INTO homepage_content (id, hero_title, hero_subtitle, nav_announcement)
VALUES (1, 'New Arrivals', 'Discover the latest mens fashion', 'Free delivery on orders over $50!');

INSERT IGNORE INTO delivery_areas (id, areaName, price, estimatedTime, isActive) VALUES
(1, 'Tripoli',       2.00, '24 hours', true),
(2, 'Beirut',        3.00, '1-2 days', true),
(3, 'North Lebanon', 3.00, '1-2 days', true),
(4, 'Mount Lebanon', 3.50, '2-3 days', true),
(5, 'South Lebanon', 4.00, '3-5 days', true);

-- ─── Default Admin Account ────────────────────────────────
-- Password: admin123
INSERT IGNORE INTO users (id, name, email, phone, password, role)
VALUES (1, 'Admin', 'admin@dax.com', '71234567',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uBi2', 'ADMIN');
