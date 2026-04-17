# HEARTBEAT.md - 自主任务清单

更新时间：2026-04-17 13:10

## ✅ 本轮完成（12:20-13:10）

### 首页灵动岛风格重写
- 极简品牌区，大量留白，金色小标题
- 移除数据展示板块（100%天然成分等）
- 底部固定栏改为灵动岛风格胶囊（白底毛玻璃 + 左侧小圆点 + 预约按钮）
- 商家后台入口简化

### 未登录引导
- orders/page.tsx：访客看到"登录/注册 + 先去逛逛"引导
- profile/page.tsx：访客看到"登录后查看预约 + 登录/注册 + 立即预约"
- 已登录用户看到通用空状态

### 技术修复
- products/page.tsx 模板字符串 `$\{product.id\}` → `${product.id}` 修复

### 构建部署
- 构建：✅ 32页通过
- 部署：✅ https://434ba8c2.lizixiu-beauty.pages.dev（主站 production.lizixiu-beauty.pages.dev）
- GitHub: commit `fd2f210`

## 已部署
- **https://434ba8c2.lizixiu-beauty.pages.dev**（最新，2026-04-17 13:10）
- https://lizixiu-beauty.pages.dev（主站）

## GitHub 状态
- 最新 commit：`fd2f210`
- 工作区干净

## ⚠️ 需用户手动处理

1. **收款码上传**：/admin/payment 上传微信+支付宝二维码
2. **产品图片**：/admin/products 为产品上传真实图片
3. **测试完整流程**：下单→提交凭证→后台核验

## P2 完成状态
- [x] 首页灵动岛风格完善
- [x] 未登录提示优化
- [x] 英文报错扫描（结果：用户可见英文已很少，全中文）
- [x] 服务管理细节打磨（admin/services 有完整 CRUD）
- [x] 排班日历打磨（admin/schedule 功能完整）
- [ ] 页面卡顿优化（可后续根据实际测试决定）

## P3 长期
- [ ] admin/staff 密码 localStorage → Supabase Auth 改造
- [ ] admin/customers 完整客户管理
- [ ] Storage 安全性（service key 不应暴露在客户端）
- [ ] 产品详情页 /product SEO 优化
- [ ] 员工独立账号系统（员工可登录+查看工作台）
- [ ] 商家管理员工（增删员工、分配权限）
- [ ] 访客端与客户合并
