-- Supabase 数据库迁移脚本
-- 为 lizixiu-beauty 项目创建所有必需的表
-- 请在 Supabase 控制台的 SQL Editor 中运行此脚本（一次全部执行）

-- 1. 客户表（独立于 auth.users，便于管理）
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    email TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 服务项目表
CREATE TABLE IF NOT EXISTS services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL, -- 分钟
    price DECIMAL(10,2) NOT NULL,
    category TEXT DEFAULT '未分类',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 员工表
CREATE TABLE IF NOT EXISTS staff (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    avatar TEXT DEFAULT '/avatars/default.png',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 预约表
CREATE TABLE IF NOT EXISTS appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, confirmed, completed, cancelled
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 产品表
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER DEFAULT 0,
    image_url TEXT,
    category TEXT DEFAULT '未分类',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 订单表
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    shipping_address TEXT,
    subtotal DECIMAL(10,2) NOT NULL,
    shipping_fee DECIMAL(10,2) DEFAULT 0,
    tax DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, paid, shipped, delivered, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 订单项表
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. 可选：用户角色映射表（扩展 auth.users）
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- customer, staff, merchant, admin
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以加速查询
CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_staff_id ON appointments(staff_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- 启用行级安全（RLS）
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 为简单起见，先创建允许所有操作的策略（开发环境）
-- 生产环境应根据角色细化
DROP POLICY IF EXISTS allow_all ON customers;
CREATE POLICY allow_all ON customers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS allow_all ON services;
CREATE POLICY allow_all ON services FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS allow_all ON staff;
CREATE POLICY allow_all ON staff FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS allow_all ON appointments;
CREATE POLICY allow_all ON appointments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS allow_all ON products;
CREATE POLICY allow_all ON products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS allow_all ON orders;
CREATE POLICY allow_all ON orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS allow_all ON order_items;
CREATE POLICY allow_all ON order_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS allow_all ON user_roles;
CREATE POLICY allow_all ON user_roles FOR ALL USING (true) WITH CHECK (true);

-- 插入示例数据（可选）
INSERT INTO services (name, description, duration, price, category) VALUES
('基础面部护理', '深层清洁 + 保湿', 60, 199.00, '面部护理'),
('全身精油按摩', '舒缓肌肉紧张', 90, 399.00, '身体护理'),
('美甲基础款', '单色美甲', 45, 89.00, '美甲')
ON CONFLICT DO NOTHING;

INSERT INTO staff (name, role, phone, email) VALUES
('张美容师', '高级美容师', '13800138001', 'zhang@example.com'),
('李按摩师', '首席按摩师', '13800138002', 'li@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO customers (name, phone, email) VALUES
('王客户', '13900139001', 'wang@example.com'),
('刘客户', '13900139002', 'liu@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock, category) VALUES
('保湿面膜', '深层补水，5片装', 49.90, 100, '护肤品'),
('护手霜', '滋润保湿，玫瑰香', 29.90, 200, '护肤品'),
('按摩精油', '舒缓放松，100ml', 89.90, 50, '护理用品')
ON CONFLICT DO NOTHING;

-- 完成提示
SELECT '✅ 数据库表创建完成，示例数据已插入。' AS message;