'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'customer' | 'merchant'>('customer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 基本验证
    if (!email || !password || !phone) {
      setError('请填写所有必填字段');
      setLoading(false);
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('邮箱格式不正确');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('密码至少6位');
      setLoading(false);
      return;
    }
    if (!/^[0-9]{11}$/.test(phone)) {
      setError('手机号必须是11位数字');
      setLoading(false);
      return;
    }

    try {
      // 1. 注册用户到 Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            phone,
            role,
          },
        },
      });

      if (authError) throw authError;

      // 2. 在公共 profiles 表中创建记录（通过数据库触发器自动处理，这里仅作提示）
      // 触发器已在 schema.sql 中定义，会同步创建 profile

      setSuccess(true);
      setEmail('');
      setPassword('');
      setPhone('');
      setRole('customer');
    } catch (err: any) {
      setError(err.message || '注册失败，请重试');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl mb-6">
          <div className="text-3xl">📬</div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">注册成功！</h1>
        <p className="text-gray-700 mb-6">
          我们已向 <strong>{email}</strong> 发送了一封验证邮件。请点击邮件中的链接验证您的邮箱，然后即可登录。
        </p>
        <p className="text-gray-600 text-sm mb-8">
          如果您没有收到邮件，请检查垃圾邮件文件夹，或稍后重试。
        </p>
        <div className="space-y-4">
          <Link
            href="/auth/login"
            className="block px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-lg hover:opacity-90 transition"
          >
            前往登录
          </Link>
          <Link
            href="/"
            className="block px-6 py-3 border border-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-50 transition"
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl mb-6">
          <div className="text-3xl">👤</div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">创建账号</h1>
        <p className="text-gray-600">
          注册后即可预约服务或管理您的店铺
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">
            邮箱地址 *
          </label>
          <input
            type="email"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className="mt-1 text-sm text-gray-500">用于登录和接收重要通知</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">
            设置密码 *
          </label>
          <input
            type="password"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="至少6位字符"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">
            手机号 *
          </label>
          <input
            type="tel"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="11位数字，仅用于联系"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <p className="mt-1 text-sm text-gray-500">我们不会公开您的手机号</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">
            我是 *
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className={`px-4 py-3 border rounded-lg text-center transition ${role === 'customer' ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-gray-300 hover:bg-gray-50'}`}
              onClick={() => setRole('customer')}
            >
              <div className="text-lg mb-1">👩‍🦰</div>
              <div className="font-medium">客户</div>
              <div className="text-xs text-gray-500">预约美容服务</div>
            </button>
            <button
              type="button"
              className={`px-4 py-3 border rounded-lg text-center transition ${role === 'merchant' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-300 hover:bg-gray-50'}`}
              onClick={() => setRole('merchant')}
            >
              <div className="text-lg mb-1">🏪</div>
              <div className="font-medium">商家</div>
              <div className="text-xs text-gray-500">管理店铺与预约</div>
            </button>
          </div>
          <input type="hidden" name="role" value={role} />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <p className="font-semibold">注册失败</p>
            <p>{error}</p>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="flex items-start">
            <input
              type="checkbox"
              required
              className="mt-1 mr-3"
            />
            <span className="text-sm text-gray-700">
              我已阅读并同意 <a href="#" className="text-pink-600 hover:underline">服务条款</a> 与 <a href="#" className="text-pink-600 hover:underline">隐私政策</a>
            </span>
          </label>
        </div>

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
              注册中...
            </span>
          ) : '立即注册'}
        </button>
      </form>

      <div className="mt-8 text-center text-gray-600">
        已有账号？{' '}
        <Link href="/auth/login" className="text-pink-600 font-semibold hover:underline">
          直接登录
        </Link>
      </div>
    </div>
  );
}