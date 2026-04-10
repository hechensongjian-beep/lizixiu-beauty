const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 读取 .env.local 文件
const envPath = path.join(__dirname, '.env.local');
let supabaseUrl = '';
let supabaseKey = '';

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.substring('NEXT_PUBLIC_SUPABASE_URL='.length).trim();
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseKey = line.substring('NEXT_PUBLIC_SUPABASE_ANON_KEY='.length).trim();
    }
  }
}

if (!supabaseUrl || !supabaseKey) {
  console.error('缺少环境变量。请检查 .env.local 文件。');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('测试 Supabase 连接...');
  const { data, error } = await supabase.from('_dummy').select('*').limit(1);
  if (error) {
    if (error.code === 'PGRST116') {
      console.log('✅ 连接成功（表 _dummy 不存在，但请求到达了 Supabase）');
    } else {
      console.log('❌ 连接错误:', error.message);
    }
  } else {
    console.log('✅ 连接成功，返回数据:', data);
  }
}

async function testCreateTable() {
  console.log('\n尝试创建测试表（需要服务角色密钥）...');
  // 尝试执行 SQL 创建表（通过 Supabase 的 REST API 无法直接创建表，需要 service role 调用 postgrest 或使用 SQL editor）
  // 这里我们尝试调用 supabase.rpc('exec_sql', { sql: 'CREATE TABLE ...' }) 但通常需要 service role
  // 我们先尝试一个简单的插入操作，看看是否有权限创建行（如果表不存在会报错）
  const { error } = await supabase.from('test_table').insert({ name: 'test' });
  if (error) {
    console.log('❌ 插入失败（可能表不存在或无权限）:', error.message);
    if (error.code === '42501') {
      console.log('🔐 权限不足，需要服务角色密钥（SUPABASE_SERVICE_ROLE_KEY）来创建表。');
    } else if (error.code === '42P01') {
      console.log('📋 表不存在，需要先创建表。这通常需要服务角色密钥。');
    }
  } else {
    console.log('✅ 插入成功（表已存在且有权写入）');
  }
}

async function main() {
  await testConnection();
  await testCreateTable();
}

main().catch(console.error);