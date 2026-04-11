-- 丽姿秀预约管理系统数据库架构
-- 在 Supabase SQL 编辑器中运行此脚本创建所需表

-- appointments 预约表
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  service_type TEXT NOT NULL,
  appointment_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 为实时订阅启用复制
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;

-- customers 客户表（示例，待实现）
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  gender TEXT,
  birth_date DATE,
  membership_level TEXT DEFAULT '普通',
  total_spent DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- services 服务项目表（示例，待实现）
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- staff 员工表（示例，待实现）
CREATE TABLE IF NOT EXISTS staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  work_schedule JSONB, -- 存储排班信息
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_appointments_time ON appointments(appointment_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);

-- 启用行级安全 (RLS)
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- 示例策略：允许所有人读取 appointments（可根据需要调整）
CREATE POLICY "允许所有人读取预约" ON appointments
  FOR SELECT USING (true);

CREATE POLICY "允许所有人插入预约" ON appointments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "允许所有人更新预约" ON appointments
  FOR UPDATE USING (true);

CREATE POLICY "允许所有人删除预约" ON appointments
  FOR DELETE USING (true);

-- 提示：实际生产环境应根据业务需求设计更严格的 RLS 策略