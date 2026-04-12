import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://czvmhylvatlegobrxyrx.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_H5qXpZTrj9amwRuFHuYSsQ_V875y61f';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);