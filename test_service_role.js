const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 读取 .env.local 文件
const envPath = path.join(__dirname, '.env.local');
let supabaseUrl = '';
let supabaseAnonKey = '';
let supabaseServiceKey = '';

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.substring('NEXT_PUBLIC_SUPABASE_URL='.length).trim();
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseAnonKey = line.substring('NEXT_PUBLIC_SUPABASE_ANON_KEY='.length).trim();
    }
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
      supabaseServiceKey = line.substring('SUPABASE_SERVICE_ROLE_KEY='.length).trim();
    }
  }
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('缺少环境变量。请检查 .env.local 文件。');
  process.exit(1);
}

console.log('使用 Service Role Key 测试连接...');
console.log('URL:', supabaseUrl);
console.log('Service Key 前几位:', supabaseServiceKey.substring(0, 10) + '...');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testServiceRole() {
  // 尝试调用需要服务角色权限的端点，例如获取用户列表（如果启用了 Auth）
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.log('❌ 调用 admin.listUsers 失败:', error.message);
      // 可能因为 Auth 未启用或其他原因，尝试另一个端点
    } else {
      console.log('✅ 服务角色密钥有效，可以访问用户列表（数量）:', data.users?.length || 0);
    }
  } catch (err) {
    console.log('❌ 异常:', err.message);
  }

  // 尝试通过 REST 查询系统表（需要服务角色权限）
  const { data, error } = await supabase.from('pg_tables').select('*').limit(1);
  if (error) {
    console.log('❌ 查询 pg_tables 失败（预期）:', error.message);
    // 尝试创建表（通过 rpc）
    console.log('尝试通过 rpc 创建测试表...');
    const { error: rpcError } = await supabase.rpc('exec_sql', { sql: 'CREATE TABLE IF NOT EXISTS test_service_role (id SERIAL PRIMARY KEY, name TEXT);' });
    if (rpcError) {
      console.log('❌ 通过 rpc 创建表失败:', rpcError.message);
      console.log('提示：可能需要启用 pg_net 扩展或创建 exec_sql 函数。');
    } else {
      console.log('✅ 测试表创建成功（或已存在）');
    }
  } else {
    console.log('✅ 查询系统表成功（服务角色密钥有效）:', data.length);
  }
}

testServiceRole().catch(console.error);