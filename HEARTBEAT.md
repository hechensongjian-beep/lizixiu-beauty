# HEARTBEAT.md - 自主任务清单

更新时间：2026-04-17 12:25

## ✅ 本轮完成（12:18-12:25）

- **产品详情页** ✅
  - 方案：改用 `/product?id=xxx` 静态路由，彻底绕过 `generateStaticParams` 问题
  - `app/product/` 目录（静态路由，无需 generateStaticParams）
  - `ProductDetailClient.tsx`：useSearchParams 读 id，useEffect 动态加载产品数据，Suspense 包裹
  - `AddToCartButton.tsx`：保留原有购物车逻辑
  - `products/page.tsx`：两处链接改为 `/product?id=${product.id}`
- 构建成功 ✅ 32页
- 部署成功 ✅ https://57af0e55.lizixiu-beauty.pages.dev
- GitHub: commit `a265b4a` ✅

## 已部署
- **https://57af0e55.lizixiu-beauty.pages.dev**（最新，2026-04-17 12:25）
- https://lizixiu-beauty.pages.dev（主站）

## GitHub 状态
- 最新 commit：`a265b4a`（产品详情页 query params 方案）
- 工作区干净

## ⚠️ 需用户手动处理
1. **收款码上传**：/admin/payment 上传微信+支付宝二维码
2. **产品图片**：/admin/products 为产品上传真实图片
3. **测试完整流程**：产品列表→点击商品→详情页→加入购物车→结算

## P2 待做
- [ ] 首页 CTA 优化（灵动岛风格完善）
- [ ] 服务管理细节打磨
- [ ] 未登录提示优化
- [ ] 英文报错→中文翻译

## P3 长期
- [ ] admin/staff 密码 localStorage → Supabase Auth 改造
- [ ] admin/customers 完整客户管理
- [ ] Storage 安全性（service key 不应暴露在客户端）
- [ ] 员工独立账号系统
