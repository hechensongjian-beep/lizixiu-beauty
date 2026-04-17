# HEARTBEAT.md - 2026-04-17

## ✅ 核心架构重构完成（15:21-15:44）

### 🔴 本次重磅修复

| # | 文件 | 问题 | 修复 |
|---|------|------|------|
| 1 | layout.tsx | 假角色（localStorage 可切换） | 替换为 AuthProvider，基于真实 Supabase Auth |
| 2 | app/auth/register | 注册可选商家（安全漏洞） | 移除角色选择，强制 `role: 'customer'` |
| 3 | app/auth/staff-login | 密码存 localStorage，假登录 | 重写为真实 Supabase Auth，检查 profiles 表 |
| 4 | app/staff/workbench | useRole 改 useAuth | 路由守卫改为 useAuth |
| 5 | 6个页面 | RoleProvider 假角色 | 统一改用 useAuth |
| 6 | AuthProvider.tsx | 缺 'admin' 类型 | 已补充 |
| 7 | RoleProvider.tsx | 旧假角色系统 | 已删除 |

### 构建部署
- ✅ 32页构建成功
- ✅ 部署 https://6083ef5f.lizixiu-beauty.pages.dev
- ✅ GitHub commit `86fdfd3`（生产别名：https://production.lizixiu-beauty.pages.dev）

## 已部署地址
- **https://6083ef5f.lizixiu-beauty.pages.dev**（最新，2026-04-17 15:44）
- https://production.lizixiu-beauty.pages.dev（主站别名）

## ✅ 架构重构结果
- 角色系统由 Supabase Auth session 驱动，不再可任意切换
- 注册强制 customer 角色，无法注册商家账号
- 员工登录走真实 Auth，检查 profiles 表 role='staff'
- 导航自动适配真实角色（无假切换下拉框）

## ⚠️ 待用户操作
- [ ] 商家账号：在 Supabase → Authentication 创建 admin 用户，profiles 表设置 role='merchant'/'admin'
- [ ] 收款码上传 /admin/payment
- [ ] 产品图片上传 /admin/products

## 🔴 仍需处理
- [ ] 员工账号创建（需商家后台支持，或手动在 profiles 表创建）
- [ ] admin/payment supabaseAdmin 改 api.ts（Service Key）
- [ ] 路由守卫（middleware 或 AuthGuard 组件）

## P2/P3 待做
- [ ] 首页灵动岛风格完善
- [ ] 员工独立账号系统（商家后台创建员工）
- [ ] 产品详情页 /products/[id]
- [ ] 未登录提示优化
