const { createClient } = require('@supabase/supabase-js');

// 从环境变量读取（或在脚本中直接设置）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://czvmhylvatlegobrxyrx.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_H5qXpZTrj9amwRuFHuYSsQ_V875y61f';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_Tw_bq2ADdH4ES1GvWeyfFQ_4ph7WZFr';

// 使用 service role key 创建管理客户端（有完整权限）
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// 使用 anon key 创建客户端（测试用）
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔌 测试 Supabase 连接...');
  console.log('URL:', supabaseUrl);
  console.log('Anon key:', supabaseAnonKey ? '已设置' : '未设置');
  console.log('Service key:', supabaseServiceKey ? '已设置' : '未设置');

  // 测试 anon 连接
  try {
    const { data, error } = await supabase.from('_dummy').select('*').limit(1);
    if (error && error.code === 'PGRST116') {
      console.log('✅ Anon 连接正常（表不存在是预期的）');
    } else if (error) {
      console.log('❌ Anon 连接错误:', error.message);
    } else {
      console.log('✅ Anon 连接正常，返回数据:', data);
    }
  } catch (err) {
    console.log('❌ Anon 连接异常:', err.message);
  }

  // 测试 admin 连接
  try {
    const { data, error } = await supabaseAdmin.from('_dummy').select('*').limit(1);
    if (error && error.code === 'PGRST116') {
      console.log('✅ Admin 连接正常（表不存在是预期的）');
    } else if (error) {
      console.log('❌ Admin 连接错误:', error.message);
    } else {
      console.log('✅ Admin 连接正常，返回数据:', data);
    }
  } catch (err) {
    console.log('❌ Admin 连接异常:', err.message);
  }
}

async function createTables() {
  console.log('\n📦 创建数据库表...');

  const sql = `
-- 1. 客户表
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 服务项目表
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- 分钟
  price DECIMAL(10,2) NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 员工表
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 预约表
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 用户资料表（扩展 auth.users）
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT,
  role TEXT CHECK (role IN ('customer', 'staff', 'admin')) DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_service_id ON appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_appointments_staff_id ON appointments(staff_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
`;

  try {
    const { error } = await supabaseAdmin.rpc('exec_sql', { sql: sql });
    if (error) {
      // 如果 exec_sql 函数不存在，使用 SQL 端点
      console.log('⚠️ 尝试直接执行 SQL（需要启用 pg_net 扩展）...');
      // 另一种方式：使用 fetch 调用 Supabase REST API 的 SQL 端点
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        },
        body: JSON.stringify({ query: sql })
      });
      if (response.ok) {
        console.log('✅ 表创建成功（通过 REST API）');
      } else {
        console.log('❌ SQL 执行失败:', await response.text());
      }
    } else {
      console.log('✅ 表创建成功（通过 RPC）');
    }
  } catch (err) {
    console.log('❌ 创建表异常:', err.message);
    console.log('💡 请手动在 Supabase 控制台执行 SQL');
  }
}

async function insertSampleData() {
  console.log('\n📝 插入示例数据...');

  // 插入示例客户
  const { data: customers, error: custError } = await supabaseAdmin
    .from('customers')
    .insert([
      { name: '张美丽', phone: '13800138001', email: 'zhangmeili@example.com', notes: '偏好周末预约' },
      { name: '王先生', phone: '13900139002', email: 'wangxiansheng@example.com', notes: '常做面部护理' },
      { name: '李小姐', phone: '13700137003', email: 'lixiaojie@example.com', notes: '新客户' },
      { name: '赵女士', phone: '13600136004', email: 'zhaonvshi@example.com', notes: '会员卡客户' }
    ])
    .select();
  if (custError) {
    console.log('⚠️ 插入客户数据失败:', custError.message);
  } else {
    console.log(`✅ 插入 ${customers.length} 条客户数据`);
  }

  // 插入示例服务
  const { data: services, error: svcError } = await supabaseAdmin
    .from('services')
    .insert([
      { name: '深层清洁面部护理', description: '彻底清洁毛孔，去除黑头粉刺', duration: 60, price: 298, category: '面部护理' },
      { name: '水光针注射', description: '补水保湿，提亮肤色', duration: 90, price: 880, category: '微整形' },
      { name: '热玛吉紧肤', description: '提升皮肤紧致度，减少皱纹', duration: 120, price: 3500, category: '抗衰老' },
      { name: '美甲护理', description: '基础美甲 + 手部护理', duration: 45, price: 128, category: '手足护理' },
      { name: '全身按摩', description: '舒缓肌肉，放松身心', duration: 90, price: 258, category: '身体护理' }
    ])
    .select();
  if (svcError) {
    console.log('⚠️ 插入服务数据失败:', svcError.message);
  } else {
    console.log(`✅ 插入 ${services.length} 条服务数据`);
  }

  // 插入示例员工
  const { data: staff, error: staffError } = await supabaseAdmin
    .from('staff')
    .insert([
      { name: '刘技师', role: '高级美容师', phone: '13800138005', email: 'liujishi@example.com', avatar: '/avatars/staff1.png' },
      { name: '陈顾问', role: '美容顾问', phone: '13900139006', email: 'chenguwen@example.com', avatar: '/avatars/staff2.png' },
      { name: '王医生', role: '医美医师', phone: '13700137007', email: 'wangyisheng@example.com', avatar: '/avatars/staff3.png' },
      { name: '李助理', role: '助理美容师', phone: '13600136008', email: 'lizhuli@example.com', avatar: '/avatars/staff4.png' }
    ])
    .select();
  if (staffError) {
    console.log('⚠️ 插入员工数据失败:', staffError.message);
  } else {
    console.log(`✅ 插入 ${staff.length} 条员工数据`);
  }

  // 插入示例预约（需要先获取插入的ID，这里简化）
  console.log('📅 预约数据需要外键，跳过自动插入');
}

async function main() {
  console.log('🚀 Supabase 数据库初始化脚本\n');
  await testConnection();
  await createTables();
  await insertSampleData();
  console.log('\n🎉 初始化完成！');
  console.log('👉 请访问 http://localhost:3000 查看系统。');
}

main().catch(err => {
  console.error('❌ 脚本执行失败:', err);
  process.exit(1);
});