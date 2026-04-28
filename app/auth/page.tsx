'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function AuthIndexPage() {
  useEffect(() => { document.title = '账户登录 - 丽姿秀'; }, []);
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-[#e8d5b8] to-[#c9a87c] rounded-xl mb-8">
          <div className="text-xl"></div>
        </div>
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-4">欢迎来到丽姿秀</h1>
        <p className="text-[var(--foreground-muted)] text-lg max-w-2xl mx-auto">
          无论您是寻找美丽服务的客户，还是管理预约的商家，这里都有您需要的工具。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="bg-white border rgba(201,168,124,0.2) rounded-2xl p-8 hover:shadow-lg transition">
          <div className="text-2xl mb-6">‍</div>
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">我是客户</h2>
          <p className="text-[var(--foreground)] mb-6">
            查找附近的美容服务，在线预约您心仪的项目，管理您的预约记录，接收贴心提醒。
          </p>
          <ul className="space-y-3 mb-8">
            <li className="flex items-center">
              <div className="w-2 h-2 bg-[#c9a87c] rounded-full mr-3"></div>
              <span>浏览服务项目与价格</span>
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-[#c9a87c] rounded-full mr-3"></div>
              <span>在线预约，灵活选择时间</span>
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-[#c9a87c] rounded-full mr-3"></div>
              <span>查看历史预约与消费记录</span>
            </li>
          </ul>
          <div className="space-y-4">
            <Link
              href="/auth/login"
              className="block w-full px-6 py-3 text-white font-bold rounded-lg hover:bg-[#3a6050] transition text-center shadow-md"
              style={{background:'#2d4a3e'}}
            >
              客户登录
            </Link>
            <Link
              href="/auth/register"
              className="block px-6 py-3 border rgba(201,168,124,0.3) text-[var(--foreground)] font-semibold rounded-lg hover:bg-[var(--background-card)] transition text-center"
            >
              注册客户账号
            </Link>
          </div>
        </div>

        <div className="bg-white border rgba(201,168,124,0.2) rounded-2xl p-8 hover:shadow-lg transition">
          <div className="text-2xl mb-6"></div>
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">我是商家</h2>
          <p className="text-[var(--foreground)] mb-6">
            管理您的店铺预约、员工排班、服务项目，通过数据分析优化经营，提升客户满意度。
          </p>
          <ul className="space-y-3 mb-8">
            <li className="flex items-center">
              <div className="w-2 h-2 bg-[#c9a87c] rounded-full mr-3"></div>
              <span>可视化预约日历，拖拽调整</span>
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-[#c9a87c] rounded-full mr-3"></div>
              <span>员工排班与绩效统计</span>
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-[#c9a87c] rounded-full mr-3"></div>
              <span>客户关系管理与营销工具</span>
            </li>
          </ul>
          <div className="space-y-4">
            <Link
              href="/auth/staff-login"
              className="block w-full px-6 py-3 text-white font-bold rounded-lg hover:bg-[#3a6050] transition text-center shadow-md"
              style={{background:'#2d4a3e'}}
            >
              商家登录
            </Link>
            <Link
              href="/auth/register"
              className="block px-6 py-3 border rgba(201,168,124,0.3) text-[var(--foreground)] font-semibold rounded-lg hover:bg-[var(--background-card)] transition text-center"
            >
              注册商家账号
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-8">
        <h3 className="text-xl font-semibold text-[var(--foreground)] mb-4"> 不知道如何选择？</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl mb-2 font-bold text-[#c9a87c]">免费</div>
            <div className="font-medium text-[var(--foreground)]">完全免费</div>
            <p className="text-sm text-[var(--foreground-muted)]">注册、使用、基础功能全部免费</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2"></div>
            <div className="font-medium text-[var(--foreground)]">快速启动</div>
            <p className="text-sm text-[var(--foreground-muted)]">1分钟注册，立即开始使用</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2"></div>
            <div className="font-medium text-[var(--foreground)]">多端适配</div>
            <p className="text-sm text-[var(--foreground-muted)]">电脑、手机、平板都能流畅使用</p>
          </div>
        </div>
      </div>
    </div>
  );
}