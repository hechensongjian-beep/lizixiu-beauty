-- ================================================================
-- 丽姿秀美容管理系统 - 数据库 Schema 同步（修正版）
-- 执行：https://supabase.com/dashboard → SQL Editor → 新建 → 粘贴执行
-- ================================================================

-- 1. appointments：添加 customer_name 和 customer_phone 列
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- 2. orders：添加缺失列
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_method TEXT DEFAULT 'express';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_fee DECIMAL(12,2) DEFAULT 0;

-- 3. order_items：添加 name 列
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS name TEXT;

-- 4. 验证 products 表实际列（调试用）
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- 5. 验证 appointments 表列
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'appointments'
ORDER BY ordinal_position;

-- 6. 验证 orders 表列
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;

SELECT 'Schema 同步完成！' AS status;
