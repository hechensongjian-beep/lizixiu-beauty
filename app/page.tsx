import AppointmentManager from '@/components/AppointmentManager';

export default function Home() {
  return (
    <>
      {/* 页面标题与概览 */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          欢迎回来，丽姿秀管理员！
        </h1>
        <p className="text-gray-600">
          今日共有 <span className="font-bold text-pink-600">12</span> 个待处理预约，总收入预计 <span className="font-bold text-green-600">¥ 8,640</span>。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧：快速操作与统计 */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📊 今日概览</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">待处理预约</span>
                <span className="font-bold text-blue-600">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">已完成</span>
                <span className="font-bold text-green-600">28</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">总收入</span>
                <span className="font-bold text-purple-600">¥ 8,640</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">客户满意度</span>
                <span className="font-bold text-yellow-600">98%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">🚀 快速操作</h2>
            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition">
                ＋ 新建预约
              </button>
              <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition">
                👥 客户管理
              </button>
              <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition">
                📅 日历视图
              </button>
              <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition">
                📈 营业报表
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">⏰ 即将到来</h3>
            <ul className="space-y-3">
              <li className="flex items-center justify-between">
                <span className="text-gray-700">张女士 · 美甲</span>
                <span className="text-sm font-medium text-gray-500">14:30</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-gray-700">李小姐 · 清洁</span>
                <span className="text-sm font-medium text-gray-500">16:00</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-gray-700">王太太 · 烫染</span>
                <span className="text-sm font-medium text-gray-500">明日 10:00</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 右侧：预约管理主面板 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">📋 预约管理</h2>
              <span className="text-sm text-gray-500">实时同步 · 云端存储</span>
            </div>
            <AppointmentManager />
          </div>

          <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">💡 使用提示</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• 点击“新建预约”快速添加客户预约，系统自动检测时间冲突。</li>
              <li>• 支持短信/微信提醒，提前1小时自动通知客户。</li>
              <li>• 所有数据安全存储于 Supabase 云端，支持多端同步。</li>
              <li>• 集成 Stripe 支付（即将上线）。</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}