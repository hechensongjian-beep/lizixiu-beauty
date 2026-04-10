import { createClient } from '@supabase/supabase-js';

// 服务器端 Supabase 客户端，使用 Service Role Key 以获得完全访问权限
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl) {
  throw new Error('缺少环境变量: NEXT_PUBLIC_SUPABASE_URL');
}
if (!supabaseServiceRoleKey) {
  throw new Error('缺少环境变量: SUPABASE_SERVICE_ROLE_KEY');
}

export const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey);