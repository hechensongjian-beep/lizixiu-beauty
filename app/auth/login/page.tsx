'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError('请输入邮箱和密码');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // 登录成功，跳转到首页或仪表板
      router.push('/');
      router.refresh(); // 刷新服务端组件中的会话
    } catch (err: any) {
      setError(err.message || '登录失败，请检查邮箱或密码');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'customer' | 'merchant') => {
    setLoading(true);
    setError(null);
    const demoEmail = role === 'customer' ? 'customer@demo.com' : 'merchant@demo.com';
    const demoPassword = 'demo123456';

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      });

      if (error) {
        // 如果演示账户不存在，则先注册（仅用于演示）
        const { error: signUpError } = await supabase.auth.signUp({
          email: demoEmail,
          password: demoPassword,
          options: {
            data: {
              phone: '13800138000',
              role,
            },
          },
        });
        if (signUpError) throw signUpError;
        // 注册后自动登录
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: demoEmail,
          password: demoPassword,
        });
        if (loginError) throw loginError;
      }

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError('演示登录失败: ' + err.message);
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl mb-6">
          <div className="text-3xl">🔐</div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">登录账号</h1>
        <p className="text-gray-600">
          使用邮箱密码登录，管理您的预约或店铺
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-800 mb-4">快速体验（无需注册）</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleDemoLogin('customer')}
            disabled={loading}
            className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 text-center"
          >
            <div className="text-lg mb-1">👩‍🦰</div>
            <div className="font-medium text-gray-800">客户演示</div>
            <div className="text-xs text-gray-500">体验预约流程</div>
          </button>
          <button
            onClick={() => handleDemoLogin('merchant')}
            disabled={loading}
            className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 text-center"
          >
            <div className="text-lg mb-1">🏪</div>
            <div className="font-medium text-gray-800">商家演示</div>
            <div className="text-xs text-gray-500">体验后台管理</div>
          </button>
        </div>
        <p className="mt-3 text-xs text-gray-500">演示账户数据为临时生成，重启服务后会重置</p>
      </div>

      <div className="relative mb-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">或使用正式账户登录</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">
            邮箱地址
          </label>
          <input
            type="email"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">
            密码
          </label>
          <input
            type="password"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="输入您的密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <div className="mt-2 text-right">
            <Link href="/auth/forgot-password" className="text-sm text-pink-600 hover:underline">
              忘记密码？
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <p className="font-semibold">登录失败</p>
            <p>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              登录中...
            </span>
          ) : '登录'}
        </button>
      </form>

      <div className="mt-8 text-center text-gray-600">
        还没有账号？{' '}
        <Link href="/auth/register" className="text-pink-600 font-semibold hover:underline">
          立即注册
        </Link>
      </div>

      <div className="mt-12 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
        <h3 className="font-semibold text-gray-800 mb-2">💡 登录后您可以</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• <strong>客户</strong>：查看个人预约记录、管理预约、修改资料</li>
          <li>• <strong>商家</strong>：管理所有预约、查看员工排班、统计收入</li>
          <li>• <strong>通用</strong>：接收邮件通知、设置提醒偏好、导出数据</li>
        </ul>
      </div>
    </div>
  );
}