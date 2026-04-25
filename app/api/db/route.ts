import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: Request) {
  try {
    const { action } = await request.json();

    if (action === 'init_promotions') {
      // Use service role key to create table
      const adminClient = createClient(supabaseUrl, supabaseKey, {
        db: { schema: 'public' },
      });

      // Try to select from promotions table to check if it exists
      const { error } = await adminClient.from('promotions').select('id').limit(1);

      if (error && error.code === '42P01') {
        // Table doesn't exist - return message to create it manually
        return NextResponse.json({
          success: false,
          needsSetup: true,
          sql: `-- 复制以下SQL到 Supabase SQL Editor 执行：
CREATE TABLE IF NOT EXISTS promotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL DEFAULT 0,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  applicable_to TEXT DEFAULT 'all' CHECK (applicable_to IN ('all', 'products', 'services')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active promotions"
  ON promotions FOR SELECT USING (is_active = true);

CREATE POLICY "Full access for authenticated users"
  ON promotions FOR ALL USING (true) WITH CHECK (true);

INSERT INTO promotions (title, description, discount_type, discount_value, start_date, end_date, applicable_to)
VALUES
  ('新客首单8折', '首次下单享8折优惠，欢迎体验丽姿秀专业服务', 'percentage', 20, NOW(), NOW() + INTERVAL '30 days', 'all'),
  ('护肤季 全场9折', '精选护肤产品限时9折', 'percentage', 10, NOW(), NOW() + INTERVAL '15 days', 'products');`
        });
      }

      return NextResponse.json({ success: true, message: 'promotions表已存在' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
