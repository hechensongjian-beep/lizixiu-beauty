-- 紧急修复：禁用RLS确保数据读写正常
-- 在 Supabase SQL Editor 中执行此脚本

-- 禁用所有表的 RLS（临时，等正式上线再加严格策略）
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_verifications DISABLE ROW LEVEL SECURITY;

-- 确保 payment_settings 初始记录存在
INSERT INTO payment_settings (id, merchant_name, wechat_qr_url, alipay_qr_url)
VALUES (1, '丽姿秀美容', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- 给 payment_settings 加主键（如果缺少）
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payment_settings_pkey') THEN
    ALTER TABLE payment_settings ADD PRIMARY KEY (id);
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
