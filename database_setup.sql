-- 丽姿秀美容院管理系统数据库初始化 SQL
-- 请复制全部内容，在 Supabase 控制台执行：
-- 1. 登录 https://supabase.com/dashboard
-- 2. 选择项目 czvmhylvatlegobrxyrx
-- 3. 点击左侧 SQL Editor
-- 4. 粘贴本 SQL，点击 Run 执行
-- 5. 等待所有语句成功完成

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

-- 插入示例数据（可选）
INSERT INTO customers (name, phone, email, notes) VALUES
  ('张美丽', '13800138001', 'zhangmeili@example.com', '偏好周末预约'),
  ('王先生', '13900139002', 'wangxiansheng@example.com', '常做面部护理'),
  ('李小姐', '13700137003', 'lixiaojie@example.com', '新客户'),
  ('赵女士', '13600136004', 'zhaonvshi@example.com', '会员卡客户')
ON CONFLICT (phone) DO NOTHING;

INSERT INTO services (name, description, duration, price, category) VALUES
  ('深层清洁面部护理', '彻底清洁毛孔，去除黑头粉刺', 60, 298.00, '面部护理'),
  ('水光针注射', '补水保湿，提亮肤色', 90, 880.00, '微整形'),
  ('热玛吉紧肤', '提升皮肤紧致度，减少皱纹', 120, 3500.00, '抗衰老'),
  ('美甲护理', '基础美甲 + 手部护理', 45, 128.00, '手足护理'),
  ('全身按摩', '舒缓肌肉，放松身心', 90, 258.00, '身体护理')
ON CONFLICT (name) DO NOTHING;

INSERT INTO staff (name, role, phone, email, avatar) VALUES
  ('刘技师', '高级美容师', '13800138005', 'liujishi@example.com', '/avatars/staff1.png'),
  ('陈顾问', '美容顾问', '13900139006', 'chenguwen@example.com', '/avatars/staff2.png'),
  ('王医生', '医美医师', '13700137007', 'wangyisheng@example.com', '/avatars/staff3.png'),
  ('李助理', '助理美容师', '13600136008', 'lizhuli@example.com', '/avatars/staff4.png')
ON CONFLICT (phone) DO NOTHING;

-- 显示创建结果
SELECT 'customers' as table, COUNT(*) as rows FROM customers
UNION ALL
SELECT 'services', COUNT(*) FROM services
UNION ALL
SELECT 'staff', COUNT(*) FROM staff
UNION ALL
SELECT 'appointments', COUNT(*) FROM appointments
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles;