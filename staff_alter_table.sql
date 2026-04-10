-- 为 staff 表添加缺失列
ALTER TABLE staff
ADD COLUMN specialties TEXT[],
ADD COLUMN experience_years INTEGER DEFAULT 0,
ADD COLUMN is_active BOOLEAN DEFAULT true;