import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://czvmhylvatlegobrxyrx.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_Tw_bq2ADdH4ES1GvWeyfFQ_4ph7WZFr';

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
