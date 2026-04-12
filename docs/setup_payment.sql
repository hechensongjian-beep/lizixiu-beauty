-- ============================================================
-- 丽姿秀 · 收款码系统初始化脚本
-- 运行方式：Supabase Dashboard → SQL Editor → 粘贴执行
-- ============================================================

-- 1. 创建收款码设置表
CREATE TABLE IF NOT EXISTS payment_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  merchant_name TEXT DEFAULT '丽姿秀',
  wechat_qr_url TEXT,
  alipay_qr_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 初始数据（默认商家）
INSERT INTO payment_settings (id, merchant_name) VALUES (1, '丽姿秀')
ON CONFLICT (id) DO NOTHING;

-- 2. 启用 RLS
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;

-- 商家可读取（所有已登录用户），任何人可读取收款码
CREATE POLICY "Anyone can read payment settings"
  ON payment_settings FOR SELECT USING (true);

-- 仅商家可更新（需在后端验证角色）
CREATE POLICY "Service role can update payment settings"
  ON payment_settings FOR UPDATE USING (true);

-- ============================================================
-- 3. 创建收款码存储桶（Supabase Storage）
-- 在 Storage 页面手动创建：
--   Bucket Name: payment-qr
--   Public: ✓ (公开)
-- 
-- 或用以下 API（需 Service Role Key）：
-- POST https://czvmhylvatlegobrxyrx.supabase.co/storage/v1/bucket
-- Body: { "id": "payment-qr", "name": "payment-qr", "public": true }
-- ============================================================

-- 4. 为 product-images 桶添加公开读取策略（如果不存在）
-- 已在产品上传中使用，确认 Storage 桶已创建
