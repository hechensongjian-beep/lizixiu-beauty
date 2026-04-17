-- 移除 appointments.customer_name 的 NOT NULL 约束
ALTER TABLE appointments ALTER COLUMN customer_name DROP NOT NULL;
ALTER TABLE appointments ALTER COLUMN customer_phone DROP NOT NULL;

-- 验证
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'appointments'
ORDER BY ordinal_position;

SELECT 'Done - NOT NULL constraints removed' AS status;
