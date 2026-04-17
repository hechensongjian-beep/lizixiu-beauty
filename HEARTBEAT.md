# HEARTBEAT.md - 自主任务清单

更新时间：2026-04-17 13:25

## ✅ 本轮完成（13:00-13:25）

### 产品详情页增强
- 增加"搭配服务推荐"模块（展示前3项服务，点击跳转预约）
- 静态导入 getServices，正常工作

### 服务页重构
- 从管理表格改为精美卡片网格展示
- 分类筛选按钮（全部/面部护理/身体护理/特殊护理/手足护理）
- 点击服务卡片弹出详情弹窗（价格、时长、热度、预约按钮）
- 已下架服务单独列出
- 热门标签（热度>=4自动标记）

### 构建部署
- 构建：✅ 32页通过
- 部署：✅ https://d18e0f2e.lizixiu-beauty.pages.dev（主站 production.lizixiu-beauty.pages.dev）
- GitHub: commit `4e22e8b`

## 已部署
- **https://d18e0f2e.lizixiu-beauty.pages.dev**（最新，2026-04-17 13:25）
- https://lizixiu-beauty.pages.dev（主站）

## GitHub 状态
- 最新 commit：`4e22e8b`
- 工作区干净

## ⚠️ 需用户手动处理

1. **收款码上传**：/admin/payment 上传微信+支付宝二维码
2. **产品图片**：/admin/products 为产品上传真实图片
3. **测试完整流程**：下单→提交凭证→后台核验

## P2 完成状态
- [x] 首页灵动岛风格完善
- [x] 未登录提示优化
- [x] 服务管理细节打磨（服务页重构为卡片+详情弹窗）
- [x] 产品详情页增强（搭配服务推荐）
- [x] 排班日历打磨（admin/schedule 功能完整）
- [x] 英文报错扫描（全中文）

## P3 长期
- [ ] admin/staff 密码 localStorage → Supabase Auth 改造
- [ ] admin/customers 完整客户管理
- [ ] Storage 安全性（service key 不应暴露在客户端）
- [ ] 员工独立账号系统（员工可登录+查看工作台）
- [ ] 商家管理员工（增删员工、分配权限）
- [ ] 访客端与客户合并
