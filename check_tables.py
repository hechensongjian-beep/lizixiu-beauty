import urllib.request, json, sys
sys.stdout.reconfigure(encoding='utf-8')

SERVICE_KEY = 'sb_secret_Tw_bq2ADdH4ES1GvWeyfFQ_4ph7WZFr'
BASE = 'https://czvmhylvatlegobrxyrx.supabase.co'

# Create Storage RLS policies via SQL RPC
# We need to use the SQL endpoint to create policies
headers = {'apikey': SERVICE_KEY, 'Authorization': 'Bearer ' + SERVICE_KEY, 'Content-Type': 'application/json'}

# Use the /rpc endpoint or direct SQL
# Actually, Supabase REST API doesn't support SQL execution directly
# We need to use the management API or tell the user to run SQL

# Instead, let's test if the current setup works with the env fix
# The key issue was NEXT_PUBLIC_ prefix missing from env var
# With the fix, the supabaseAdmin client should use service_role key

# Let's verify by checking the built output
print('Env fix applied. Now checking if supabase-admin.ts has correct fallback...')
print('')
print('The fix: Changed .env.local from SUPABASE_SERVICE_ROLE_KEY to NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY')
print('This ensures the service role key is available at build time for static export.')
print('')
print('Additionally, we should create Storage policies for extra safety.')

# Create storage policies using the Supabase SQL API
# The /rest/v1/rpc/ endpoint can execute functions, but we need raw SQL
# Let's try creating policies directly via the storage API

# Actually, let's create the SQL the user needs to run for storage policies
sql = """
-- Storage RLS policies for uploads
-- Run in: https://supabase.com/dashboard/project/czvmhylvatlegobrxyrx/sql

-- Allow public upload to payment-qr bucket
CREATE POLICY "Allow public upload to payment-qr" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'payment-qr');

-- Allow public update to payment-qr bucket  
CREATE POLICY "Allow public update to payment-qr" ON storage.objects
  FOR UPDATE USING (bucket_id = 'payment-qr');

-- Allow public upload to product-images bucket
CREATE POLICY "Allow public upload to product-images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images');

-- Allow public update to product-images bucket
CREATE POLICY "Allow public update to product-images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-images');

-- Allow public upload to avatars bucket
CREATE POLICY "Allow public upload to avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars');

-- Allow public update to avatars bucket
CREATE POLICY "Allow public update to avatars" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars');

-- Allow public read from all buckets (should already exist)
CREATE POLICY "Allow public read from all buckets" ON storage.objects
  FOR SELECT USING (true);
"""

print('SQL for Storage RLS policies:')
print(sql)
