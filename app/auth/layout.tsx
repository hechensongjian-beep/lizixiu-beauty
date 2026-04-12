import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* 顶部导航 */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg"></div>
              <span className="text-xl font-bold text-gray-900">丽姿秀</span>
            </Link>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600 font-medium">账户中心</span>
          </div>
          <div className="text-sm text-gray-600">
            需要帮助？{' '}
            <a href="mailto:support@example.com" className="text-pink-600 hover:underline">
              联系客服
            </a>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="py-8">
        {children}
      </main>

      {/* 页脚 */}
      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2026 丽姿秀美容预约系统 · 保留所有权利</p>
          <p className="mt-2">
            <Link href="/privacy" className="hover:underline">隐私政策</Link>
            {' · '}
            <Link href="/terms" className="hover:underline">服务条款</Link>
            {' · '}
            <Link href="/contact" className="hover:underline">联系我们</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}