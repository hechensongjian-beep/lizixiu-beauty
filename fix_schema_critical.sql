-- ================================================
-- 紧急修复：同步数据库 schema 与代码
-- 2026-04-17 - 修复核心功能阻塞
-- ================================================

-- 1. orders 表：添加代码需要的列
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_method VARCHAR(50) DEFAULT 'express';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_fee DECIMAL(12,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax DECIMAL(12,2) DEFAULT 0;

-- 2. products 表：添加 image_url 列（单图URL）
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;
-- 如果 image_urls 列存在但 image_url 不存在，从 image_urls[1] 迁移
UPDATE products SET image_url = image_urls[1] WHERE image_url IS NULL AND image_urls IS NOT NULL AND array_length(image_urls, 1) > 0;

-- 3. order_items 表：添加 name 列（代码需要）
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS name VARCHAR(200);

-- 4. 验证所有表结构
SELECT 'products' as tbl, column_name, data_type, is_nullable 
FROM information_schema.columns WHERE table_name = 'products'
UNION ALL
SELECT 'orders', column_name, data_type, is_nullable 
FROM information_schema.columns WHERE table_name = 'orders'
UNION ALL
SELECT 'appointments', column_name, data_type, is_nullable 
FROM information_schema.columns WHERE table_name = 'appointments'
UNION ALL
SELECT 'order_items', column_name, data_type, is_nullable 
FROM information_schema.columns WHERE table_name = 'order_items'
ORDER BY tbl, ordinal_position;
