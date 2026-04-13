-- ========================================
-- 丽姿秀数据库修复脚本
-- 请在 Supabase SQL Editor 中执行
-- 地址: https://supabase.com/dashboard/project/czvmhylvatlegobrxyrx/sql
-- ========================================

-- 1. 创建 staff_schedule 表（排班管理）
CREATE TABLE IF NOT EXISTS public.staff_schedule (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL DEFAULT '09:00',
  end_time TIME NOT NULL DEFAULT '18:00',
  is_available BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(staff_id, date)
);

-- 2. 给 appointments 表添加缺失的列
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- 3. 禁用所有表的 RLS（开发阶段必需，否则客户端无法读写）
ALTER TABLE public.appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_verifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_schedule DISABLE ROW LEVEL SECURITY;

-- 执行完毕后，所有功能应该正常工作
