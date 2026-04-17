-- 紧急修复：添加缺失的数据库列
-- 执行时间：2026-04-17

-- 1. products 表：添加 image_url 列（单数，用于主图）
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. orders 表：添加 delivery_method 列
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_method VARCHAR(50) DEFAULT 'express';

-- 3. orders 表：添加 customer_name 列（用于非登录用户）
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);

-- 4. appointments 表：添加 customer_name 列
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS customer_name VARCHAR(100);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20);

-- 5. appointments 表：修改 notes 列允许 NULL（如果原来是 NOT NULL）
ALTER TABLE appointments ALTER COLUMN notes DROP NOT NULL;

-- 6. 验证列已添加
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name IN ('products', 'orders', 'appointments')
ORDER BY table_name, ordinal_position;
