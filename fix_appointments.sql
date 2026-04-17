-- ================================================================
-- appointments 约束修复：移除 customer_name / customer_phone 的 NOT NULL
-- 执行：Supabase → SQL Editor → 粘贴执行
-- ================================================================
ALTER TABLE appointments ALTER COLUMN customer_name DROP NOT NULL;
ALTER TABLE appointments ALTER COLUMN customer_phone DROP NOT NULL;

-- 验证结果
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'appointments'
ORDER BY ordinal_position;
