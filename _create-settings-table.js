const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://czvmhylvatlegobrxyrx.supabase.co';
const serviceKey = 'sb_secret_Tw_bq2ADdH4ES1GvWeyfFQ_4ph7WZFr';
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  // Check if table exists
  const { data, error } = await supabase.from('site_settings').select('id').limit(1);
  if (!error) {
    console.log('site_settings table already exists');
    return;
  }
  
  // Try to create via pg
  const { error: pgErr } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS site_settings (
        id integer PRIMARY KEY DEFAULT 1,
        hero_title text DEFAULT '丽姿秀 · Beauty',
        hero_subtitle text DEFAULT '让美，从这里开始',
        hero_desc text DEFAULT '专业美容服务团队',
        business_hours text DEFAULT '周一至周日 09:00 - 21:00',
        business_tel text DEFAULT '139-0000-0001',
        business_addr text DEFAULT '上海市静安区',
        notice_bar text DEFAULT '',
        updated_at timestamptz DEFAULT now()
      );
      INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
      ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Allow all" ON site_settings FOR ALL USING (true);
    `
  });
  
  if (pgErr) {
    console.error('RPC failed:', pgErr.message);
    console.log('Manual SQL needed - see _sql.txt');
  } else {
    console.log('Table created successfully');
  }
}

main();
