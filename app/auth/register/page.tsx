'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password || !phone || !confirmPassword) {
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
    if (password !== confirmPassword) {
      setError('两次密码输入不一致');
      setLoading(false);
      return;
    }
    if (!/^[0-9]{11}$/.test(phone)) {
      setError('手机号必须是11位数字');
      setLoading(false);
      return;
    }
    if (!agreed) {
      setError('请先阅读并同意服务条款');
      setLoading(false);
      return;
    }

    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            phone,
            role: 'customer', // 强制客户角色，不允许注册商家
          },
        },
      });

      if (authError) throw authError;

      setSuccess(true);
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
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl mb-6">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h1 className="text-xl font-medium text-gray-900 mb-4">注册成功！</h1>
        <p className="text-gray-700 mb-2">
          我们已向 <strong>{email}</strong> 发送了一封验证邮件。
        </p>
        <p className="text-gray-600 text-sm mb-8">
          请点击邮件中的链接验证邮箱，然后即可登录。
        </p>
        <div className="space-y-4">
          <button onClick={() => router.push('/auth/login')}
            className="block w-full px-6 py-3 bg-gradient-to-r from-[#c9a87c] to-[#e8d5b8] text-white font-semibold rounded-lg hover:opacity-90 transition">
            前往登录
          </button>
          <Link href="/"
            className="block px-6 py-3 border border-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-50 transition">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-[#e8d5b8] rounded-2xl mb-6">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#a88a5c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <h1 className="text-xl font-medium text-gray-900 mb-3">创建账号</h1>
        <p className="text-gray-600">
          注册后即可预约美容服务、查看订单
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-medium text-gray-800 mb-2">邮箱地址 *</label>
          <input type="email" required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a87c]"
            placeholder="用于登录和接收通知"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading} />
        </div>

        <div>
          <label className="block font-medium text-gray-800 mb-2">设置密码 *</label>
          <input type="password" required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a87c]"
            placeholder="至少6位字符"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading} />
        </div>

        <div>
          <label className="block font-medium text-gray-800 mb-2">确认密码 *</label>
          <input type="password" required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a87c]"
            placeholder="再次输入密码"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading} />
        </div>

        <div>
          <label className="block font-medium text-gray-800 mb-2">手机号 *</label>
          <input type="tel" required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a87c]"
            placeholder="11位数字，仅用于联系"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={loading} />
          <p className="mt-1 text-sm text-gray-500">我们不会公开您的手机号</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <p className="font-semibold text-sm">注册失败</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 flex-shrink-0" />
            <span className="text-sm text-gray-700">
              我已阅读并同意 <a href="#" className="text-[#a88a5c] hover:underline">服务条款</a> 与 <a href="#" className="text-[#a88a5c] hover:underline">隐私政策</a>
            </span>
          </label>
        </div>

        <button type="submit" disabled={loading}
          className="w-full px-6 py-3 bg-gradient-to-r from-[#c9a87c] to-[#e8d5b8] text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              注册中...
            </span>
          ) : '立即注册'}
        </button>
      </form>

      <div className="mt-8 text-center text-gray-600">
        已有账号？{' '}
        <Link href="/auth/login" className="text-[#a88a5c] font-semibold hover:underline">
          直接登录
        </Link>
      </div>
    </div>
  );
}
