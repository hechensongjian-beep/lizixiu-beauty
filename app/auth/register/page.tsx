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
      setError('璇峰～鍐欐墍鏈夊繀濉瓧娈?);
      setLoading(false);
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('閭鏍煎紡涓嶆纭?);
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('瀵嗙爜鑷冲皯6浣?);
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('涓ゆ瀵嗙爜杈撳叆涓嶄竴鑷?);
      setLoading(false);
      return;
    }
    if (!/^[0-9]{11}$/.test(phone)) {
      setError('鎵嬫満鍙峰繀椤绘槸11浣嶆暟瀛?);
      setLoading(false);
      return;
    }
    if (!agreed) {
      setError('璇峰厛闃呰骞跺悓鎰忔湇鍔℃潯娆?);
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
            role: 'customer', // 寮哄埗瀹㈡埛瑙掕壊锛屼笉鍏佽娉ㄥ唽鍟嗗
          },
        },
      });

      if (authError) throw authError;

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || '娉ㄥ唽澶辫触锛岃閲嶈瘯');
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
        <h1 className="font-bold mb-2">娉ㄥ唽鎴愬姛锛?/h1>
        <p className="text-gray-700 mb-2">
          鎴戜滑宸插悜 <strong>{email}</strong> 鍙戦€佷簡涓€灏侀獙璇侀偖浠躲€?        </p>
        <p className="text-gray-600 text-sm mb-8">
          璇风偣鍑婚偖浠朵腑鐨勯摼鎺ラ獙璇侀偖绠憋紝鐒跺悗鍗冲彲鐧诲綍銆?        </p>
        <div className="space-y-4">
          <button onClick={() => router.push('/auth/login')}
            className="block w-full px-6 py-3 bg-gradient-to-r from-[#c9a87c] to-[#e8d5b8] text-white font-semibold rounded-lg hover:opacity-90 transition">
            鍓嶅線鐧诲綍
          </button>
          <Link href="/"
            className="block px-6 py-3 border border-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-50 transition">
            杩斿洖棣栭〉
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
        <h1 className="font-bold mb-2">鍒涘缓璐﹀彿</h1>
        <p className="text-gray-600">
          娉ㄥ唽鍚庡嵆鍙绾︾編瀹规湇鍔°€佹煡鐪嬭鍗?        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-medium text-gray-800 mb-2">閭鍦板潃 *</label>
          <input type="email" required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a87c]"
            placeholder="鐢ㄤ簬鐧诲綍鍜屾帴鏀堕€氱煡"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading} />
        </div>

        <div>
          <label className="block font-medium text-gray-800 mb-2">璁剧疆瀵嗙爜 *</label>
          <input type="password" required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a87c]"
            placeholder="鑷冲皯6浣嶅瓧绗?
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading} />
        </div>

        <div>
          <label className="block font-medium text-gray-800 mb-2">纭瀵嗙爜 *</label>
          <input type="password" required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a87c]"
            placeholder="鍐嶆杈撳叆瀵嗙爜"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading} />
        </div>

        <div>
          <label className="block font-medium text-gray-800 mb-2">鎵嬫満鍙?*</label>
          <input type="tel" required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a87c]"
            placeholder="11浣嶆暟瀛楋紝浠呯敤浜庤仈绯?
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={loading} />
          <p className="mt-1 text-sm text-gray-500">鎴戜滑涓嶄細鍏紑鎮ㄧ殑鎵嬫満鍙?/p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <p className="font-semibold text-sm">娉ㄥ唽澶辫触</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 flex-shrink-0" />
            <span className="text-sm text-gray-700">
              鎴戝凡闃呰骞跺悓鎰?<a href="#" className="text-[#a88a5c] hover:underline">鏈嶅姟鏉℃</a> 涓?<a href="#" className="text-[#a88a5c] hover:underline">闅愮鏀跨瓥</a>
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
              娉ㄥ唽涓?..
            </span>
          ) : '绔嬪嵆娉ㄥ唽'}
        </button>
      </form>

      <div className="mt-8 text-center text-gray-600">
        宸叉湁璐﹀彿锛焮' '}
        <Link href="/auth/login" className="text-[#a88a5c] font-semibold hover:underline">
          鐩存帴鐧诲綍
        </Link>
      </div>
    </div>
  );
}
