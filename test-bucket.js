const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://czvmhylvatlegobrxyrx.supabase.co';
const supabaseServiceKey = 'sb_secret_Tw_bq2ADdH4ES1GvWeyfFQ_4ph7WZFr';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const timestamp = Date.now();
  
  // 测试1: 用 base64 上传真实图片数据
  console.log('=== 测试 base64 图片上传 ===');
  const imgData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==', 'base64');
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(`test_${timestamp}.png`, imgData, { contentType: 'image/png', upsert: true });
  
  if (error) { console.log('❌ 上传失败:', error.message); }
  else {
    console.log('✅ 上传成功');
    // 获取公开URL
    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(`test_${timestamp}.png`);
    console.log('📎 公开URL:', urlData.publicUrl);
  }

  // 测试2: 列出 product-images 里的文件
  console.log('\n=== 列出 product-images 文件 ===');
  const { data: files, error: listErr } = await supabase.storage.from('product-images').list('', { limit: 20 });
  if (listErr) console.log('❌ 列表失败:', listErr.message);
  else files.forEach(f => console.log(` - ${f.name} (${f.metadata?.size} bytes)`));
}

main();
