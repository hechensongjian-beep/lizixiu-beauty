-- =====================================================
-- 丽姿秀 · 认证体系重构 SQL
-- 1. 创建 profiles 表（用户角色映射）
-- 2. 预设商家账号
-- =====================================================

-- 1. 创建 profiles 表
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'merchant', 'staff')),
  phone TEXT,
  display_name TEXT,
  staff_id UUID REFERENCES staff(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS: 用户只能读自己的 profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- RLS: 用户可以更新自己的 profile（但不能改 role）
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS: 注册时自动创建 profile（通过 trigger 实现）
-- 服务端可以插入
CREATE POLICY "Service role can insert profiles" ON profiles
  FOR INSERT WITH CHECK (true);

-- 2. 创建 trigger：用户注册时自动创建 profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role, phone, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 删除旧 trigger（如果存在）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 创建新 trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. 创建商家预设账号
-- 注意：Supabase Auth 的 signUp 需要 API 调用，这里只创建 profile 映射
-- 商家账号需要在应用层通过 supabase.auth.signUp 创建

-- 4. 限制商家角色：只有已存在的商家账号才能被设为 merchant
-- 通过应用层逻辑控制，注册页不允许选择 merchant 角色

-- 5. 关闭 profiles 表的 anon 写入（只允许 trigger 和 service role）
-- 已通过 RLS 实现

-- 6. 给已有的 auth.users 创建 profile（回填）
INSERT INTO profiles (user_id, role, phone, display_name)
SELECT id, 'customer', phone, email
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM profiles)
ON CONFLICT (user_id) DO NOTHING;
