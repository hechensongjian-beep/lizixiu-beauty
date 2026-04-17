-- ================================================================
-- 丽姿秀美容管理系统 - 完整 Schema 重建脚本
-- ================================================================
-- 执行方法：
-- 1. 打开 https://supabase.com/dashboard/project/czvmhylvatlegobrxyrx/sql
-- 2. 新建查询，粘贴全部内容
-- 3. 点击 "Run" 执行
-- ================================================================

-- ================================================================
-- 第一步：重建 products 表（添加 image_url 列，保留现有数据）
-- ================================================================
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;
-- 迁移现有 image_urls[1] 到 image_url
UPDATE products SET image_url = image_urls[1]
  WHERE image_url IS NULL
    AND image_urls IS NOT NULL
    AND array_length(image_urls, 1) > 0;

-- ================================================================
-- 第二步：重建 appointments 表（添加 customer_name/customer_phone）
-- ================================================================
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- ================================================================
-- 第三步：重建 orders 表（添加 delivery_method）
-- ================================================================
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_method TEXT DEFAULT 'express';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_fee DECIMAL(12,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax DECIMAL(12,2) DEFAULT 0;

-- ================================================================
-- 第四步：重建 order_items 表（添加 name 列）
-- ================================================================
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS name TEXT;

-- ================================================================
-- 第五步：验证结果
-- ================================================================
SELECT '✅ products 列：' || string_agg(column_name, ', ')
FROM information_schema.columns WHERE table_name = 'products';

SELECT '✅ orders 列：' || string_agg(column_name, ', ')
FROM information_schema.columns WHERE table_name = 'orders';

SELECT '✅ appointments 列：' || string_agg(column_name, ', ')
FROM information_schema.columns WHERE table_name = 'appointments';

SELECT '✅ order_items 列：' || string_agg(column_name, ', ')
FROM information_schema.columns WHERE table_name = 'order_items';

SELECT 'Schema 修复完成！' AS status;
