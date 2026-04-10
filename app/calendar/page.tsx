import Link from 'next/link';

export default function CalendarPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl mb-6">
          <div className="text-3xl">📅</div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">日历视图</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          可视化预约日历，直观查看每日预约安排、员工排班、房间占用情况。
        </p>
      </div>

      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-8 mb-12">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">功能即将推出</h2>
            <p className="text-gray-700">
              日历视图模块正在紧密开发中，预计下周上线。您将可以：
            </p>
            <ul className="mt-3 text-gray-700 list-disc pl-5 space-y-1">
              <li>日/周/月视图切换，直观查看预约分布</li>
              <li>拖拽调整预约时间、更换服务员工</li>
              <li>颜色区分预约状态（待确认、已确认、已完成）</li>
              <li>员工排班与房间占用可视化</li>
              <li>一键导出日历到 Google Calendar / Outlook</li>
            </ul>
          </div>
          <div className="bg-white rounded-xl p-6 border border-amber-300 shadow-sm">
            <div className="text-sm font-medium text-amber-800 mb-2">当前进度</div>
            <div className="w-64 bg-gray-200 rounded-full h-2.5 mb-3">
              <div className="bg-amber-600 h-2.5 rounded-full" style={{ width: '30%' }}></div>
            </div>
            <div className="text-xs text-gray-500">数据库设计完成 • 前端UI就绪 • 后端API开发中</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-800 mb-4">日历预览（静态示例）</h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 text-sm font-medium text-gray-700">
              2026年4月8日 星期三
            </div>
            <div className="divide-y divide-gray-100">
              <div className="px-4 py-3 flex items-center">
                <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">张美琳 · 深层清洁面部护理</div>
                  <div className="text-sm text-gray-600">客户：李女士 · 10:00‑11:00</div>
                </div>
                <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">待确认</span>
              </div>
              <div className="px-4 py-3 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">李俊逸 · 日式美甲艺术</div>
                  <div className="text-sm text-gray-600">客户：王小姐 · 14:30‑15:45</div>
                </div>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">已确认</span>
              </div>
              <div className="px-4 py-3 flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">王思雨 · 全身精油SPA</div>
                  <div className="text-sm text-gray-600">客户：刘先生 · 16:00‑17:30</div>
                </div>
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">已完成</span>
              </div>
              <div className="px-4 py-3 flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">陈浩 · 客户咨询</div>
                  <div className="text-sm text-gray-600">客户：赵女士 · 18:00‑18:30</div>
                </div>
                <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">已确认</span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-800 mb-4">功能亮点</h3>
          <ul className="space-y-4">
            <li className="flex items-start">
              <div className="text-amber-600 mr-3">📱</div>
              <div>
                <div className="font-medium text-gray-800">多视图适配</div>
                <p className="text-gray-600 text-sm">桌面端完整日历，移动端紧凑列表，无缝切换。</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="text-amber-600 mr-3">🔔</div>
              <div>
                <div className="font-medium text-gray-800">智能提醒</div>
                <p className="text-gray-600 text-sm">预约前自动提醒员工与客户，减少爽约率。</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="text-amber-600 mr-3">👥</div>
              <div>
                <div className="font-medium text-gray-800">团队协作</div>
                <p className="text-gray-600 text-sm">员工端查看个人日程，店长端统览全局。</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="text-amber-600 mr-3">📊</div>
              <div>
                <div className="font-medium text-gray-800">数据洞察</div>
                <p className="text-gray-600 text-sm">高峰时段分析、员工负荷统计、房间利用率。</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-12">
        <h3 className="font-semibold text-gray-800 mb-4">集成能力</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white border border-gray-200 rounded-lg">
            <div className="text-2xl mb-2">📧</div>
            <div className="text-sm font-medium text-gray-800">邮件提醒</div>
          </div>
          <div className="text-center p-4 bg-white border border-gray-200 rounded-lg">
            <div className="text-2xl mb-2">💬</div>
            <div className="text-sm font-medium text-gray-800">微信通知</div>
          </div>
          <div className="text-center p-4 bg-white border border-gray-200 rounded-lg">
            <div className="text-2xl mb-2">📱</div>
            <div className="text-sm font-medium text-gray-800">短信提醒</div>
          </div>
          <div className="text-center p-4 bg-white border border-gray-200 rounded-lg">
            <div className="text-2xl mb-2">🔄</div>
            <div className="text-sm font-medium text-gray-800">日历同步</div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-lg hover:opacity-90 transition"
        >
          ← 返回仪表板
        </Link>
        <p className="mt-4 text-gray-500 text-sm">
          急需日历功能？<a href="mailto:support@example.com" className="text-amber-600 hover:underline">联系我们</a>获取优先开发支持。
        </p>
      </div>
    </div>
  );
}