import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://czvmhylvatlegobrxyrx.supabase.co';
// TODO: 替换为anon key + RLS策略。目前临时用service role key绕过RLS
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_secret_Tw_bq2ADdH4ES1GvWeyfFQ_4ph7WZFr';

export const supabase = createClient(supabaseUrl, supabaseKey);