'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function IconLock({ className }: { className?: string }) {
  return <svg className={className} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a88a5c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
}
function IconUser({ className }: { className?: string }) {
  return <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function IconStore({ className }: { className?: string }) {
  return <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
}

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
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push('/');
      router.refresh();
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
      const { error } = await supabase.auth.signInWithPassword({ email: demoEmail, password: demoPassword });
      if (error) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: demoEmail,
          password: demoPassword,
          options: { data: { phone: '13800138000', role } },
        });
        if (signUpError) throw signUpError;
        const { error: loginError } = await supabase.auth.signInWithPassword({ email: demoEmail, password: demoPassword });
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
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6" style={{"background":'linear-gradient(135deg,#c9a87c22 0%,#e8d5b822 100%)'}}>
          <IconLock />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">登录账号</h1>
        <p className="text-gray-600">使用邮箱密码登录，管理您的预约或店铺</p>
      </div>

      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-500 mb-4">快速体验（无需注册）</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleDemoLogin('customer')}
            disabled={loading}
            className="px-4 py-5 border border-gray-200 rounded-xl hover:border-[#c9a87c] hover:bg-[#faf8f5] transition disabled:opacity-50 text-center"
          >
            <div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center" style={{"background":'#e8d5b8'}}>
              <IconUser className="text-[#a88a5c]" />
            </div>
            <div className="font-medium text-gray-800 text-sm">客户演示</div>
            <div className="text-xs text-gray-500">体验预约流程</div>
          </button>
          <button
            onClick={() => handleDemoLogin('merchant')}
            disabled={loading}
            className="px-4 py-5 border border-gray-200 rounded-xl hover:border-[#c9a87c] hover:bg-[#faf8f5] transition disabled:opacity-50 text-center"
          >
            <div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center" style={{"background":'#2d4a3e'}}>
              <IconStore className="text-white" />
            </div>
            <div className="font-medium text-gray-800 text-sm">商家演示</div>
            <div className="text-xs text-gray-500">体验后台管理</div>
          </button>
        </div>
        <p className="mt-3 text-xs text-gray-500">演示账户数据为临时生成，重启服务后会重置</p>
      </div>

      <div className="relative mb-8">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">或使用正式账户登录</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">邮箱地址</label>
          <input
            type="email"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a87c]"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">密码</label>
          <input
            type="password"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a87c]"
            placeholder="输入您的密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <div className="mt-2 text-right">
            <Link href="/auth/forgot-password" className="text-sm hover:underline" style={{color:'#a88a5c'}}>
              忘记密码？
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <p className="font-semibold">登录失败</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 font-bold text-lg rounded-lg text-white transition disabled:opacity-50"
          style={{"background":'linear-gradient(135deg,#c9a87c 0%,#e8d5b8 100%)',"boxShadow":'0 4px 15px rgba(201,168,124,0.3)'}}
        >
          {loading ? '登录中...' : '登录'}
        </button>
      </form>

      <div className="mt-8 text-center text-gray-600">
        还没有账号？{' '}
        <Link href="/auth/register" className="font-semibold hover:underline" style={{color:'#a88a5c'}}>
          立即注册
        </Link>
      </div>

      <div className="mt-12 p-6 rounded-xl" style={{"background":'#faf8f5',"border":'1px solid rgba(201,168,124,0.2)'}}>
        <h3 className="font-semibold text-gray-800 mb-3">登录后您可以</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start gap-2">
            <svg className="mt-0.5 flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c9a87c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span><strong>客户</strong>：查看个人预约记录、管理预约、修改资料</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="mt-0.5 flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c9a87c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span><strong>商家</strong>：管理所有预约、查看员工排班、统计收入</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="mt-0.5 flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c9a87c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span><strong>通用</strong>：接收邮件通知、设置提醒偏好、导出数据</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
