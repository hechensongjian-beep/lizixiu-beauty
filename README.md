# 丽姿秀预约管理系统

专为美容工作室设计的现代化预约管理平台，基于 Next.js + Supabase + Tailwind CSS 构建。

## 功能特性

- 📋 **预约管理**：完整的 CRUD 操作，实时状态更新，搜索过滤
- 👥 **客户管理**：客户信息管理（占位页面，待接入数据库）
- 💅 **服务项目管理**：服务列表、价格、时长管理（占位页面）
- 👩‍💼 **员工管理**：员工信息、排班、权限管理（占位页面）
- 📅 **日历视图**：可视化预约日历（占位页面）
- 🎨 **现代化 UI**：响应式设计，粉色→紫色渐变主题，Tailwind CSS
- 🔄 **实时同步**：Supabase 实时订阅，数据变更自动更新
- 🔒 **数据安全**：Supabase 行级安全 (RLS)，云端备份

## 技术栈

- **前端框架**：Next.js 16.2.2 (App Router)
- **开发语言**：TypeScript
- **样式**：Tailwind CSS
- **数据库**：Supabase (PostgreSQL)
- **部署**：Vercel（推荐）

## 本地开发

### 环境要求

- Node.js 18+（已使用便携版安装于 D:\Nodejs）
- npm 或 yarn
- Git（可选）

### 启动步骤

1. **克隆项目**（如果尚未克隆）
   ```bash
   git clone <repository-url>
   cd lizixiu-beauty
   ```

2. **安装依赖**
   ```bash
   npm install
   # 或使用 yarn
   yarn install
   ```

3. **配置环境变量**
   复制 `.env.local.example` 为 `.env.local`，并填写您的 Supabase 凭证：
   ```
   NEXT_PUBLIC_SUPABASE_URL=您的 Supabase 项目 URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=您的 Supabase 匿名密钥
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   # 或
   yarn dev
   ```

5. **打开浏览器**
   访问 [http://localhost:3000](http://localhost:3000)

### 数据库准备

本项目使用 Supabase 作为后端数据库。您需要：

1. 在 [Supabase](https://supabase.com) 创建新项目
2. 在 SQL 编辑器中运行以下 SQL 创建 `appointments` 表：
   ```sql
   CREATE TABLE appointments (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     customer_name TEXT NOT NULL,
     phone TEXT NOT NULL,
     service_type TEXT NOT NULL,
     appointment_time TIMESTAMPTZ NOT NULL,
     status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```
3. 启用行级安全 (RLS) 并添加策略（可选）
4. 启用实时订阅：在 Supabase 控制台，进入 Database → Replication，为 `appointments` 表启用复制

## 部署到 Vercel

### 自动部署（推荐）

1. 将代码推送到 GitHub 仓库
2. 登录 [Vercel](https://vercel.com)
3. 点击 "New Project"，导入您的仓库
4. 添加环境变量（同 `.env.local`）
5. 点击 "Deploy"

### 手动部署

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 项目结构

```
lizixiu-beauty/
├── app/                    # Next.js App Router 页面
│   ├── layout.tsx         # 全局布局（导航栏 + 页脚）
│   ├── page.tsx           # 主仪表板
│   ├── customers/         # 客户管理页面
│   ├── services/          # 服务项目管理页面
│   ├── staff/             # 员工管理页面
│   └── calendar/          # 日历视图页面
├── components/            # React 组件
│   └── AppointmentManager.tsx  # 核心预约组件
├── lib/
│   └── supabase.ts        # Supabase 客户端配置
├── public/                # 静态资源
├── .env.local            # 本地环境变量（不提交到 Git）
├── tailwind.config.ts    # Tailwind CSS 配置
├── next.config.ts        # Next.js 配置
└── package.json          # 依赖清单
```

## 待办事项（下一步开发）

- [ ] **接入客户管理**：创建 `customers` 表并实现 CRUD
- [ ] **接入服务管理**：创建 `services` 表并实现 CRUD
- [ ] **接入员工管理**：创建 `staff` 表并实现 CRUD
- [ ] **身份验证**：集成 Supabase Auth，添加商家登录
- [ ] **实时通知**：通过微信/短信发送预约提醒
- [ ] **支付集成**：集成 Stripe 或支付宝
- [ ] **数据分析**：营业额统计、客户画像
- [ ] **多语言**：支持中英文切换

## 常见问题

### 1. 无法连接到 Supabase
   - 检查 `.env.local` 中的 URL 和密钥是否正确
   - 确认 Supabase 项目已启动且网络可访问
   - 检查浏览器控制台错误信息

### 2. 实时订阅不工作
   - 确保在 Supabase 控制台中为表启用了复制
   - 检查网络连接，可能需要配置 CORS

### 3. 样式不正常
   - 确认 Tailwind CSS 已正确安装
   - 运行 `npm run build` 检查编译错误

### 4. 部署后环境变量失效
   - 在 Vercel 项目设置中重新添加环境变量
   - 确保变量名与代码中一致（`NEXT_PUBLIC_*`）

## 联系方式

如有问题，请通过 OpenClaw 联系开发者。

## 许可证

本项目为丽姿秀美容工作室内部使用，保留所有权利。