'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email) {
      setError('璇疯緭鍏ラ偖绠卞湴鍧€');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || '鍙戦€侀噸缃偖浠跺け璐ワ紝璇烽噸璇?);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl mb-6">
          <div className="text-xl"></div>
        </div>
        <h1 className="font-bold mb-2">閭欢宸插彂閫侊紒</h1>
        <p className="text-gray-700 mb-6">
          鎴戜滑宸插悜 <strong>{email}</strong> 鍙戦€佷簡涓€灏佸瘑鐮侀噸缃偖浠躲€傝鐐瑰嚮閭欢涓殑閾炬帴璁剧疆鏂板瘑鐮併€?        </p>
        <p className="text-gray-600 text-sm mb-8">
          濡傛灉鎮ㄦ病鏈夋敹鍒伴偖浠讹紝璇锋鏌ュ瀮鍦鹃偖浠舵枃浠跺す锛屾垨绋嶅悗閲嶈瘯銆?        </p>
        <div className="space-y-4">
          <Link
            href="/auth/login"
            className="block px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-lg hover:opacity-90 transition"
          >
            杩斿洖鐧诲綍
          </Link>
          <Link
            href="/"
            className="block px-6 py-3 border border-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-50 transition"
          >
            杩斿洖棣栭〉
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl mb-6">
          <div className="text-xl"></div>
        </div>
        <h1 className="font-bold mb-2">閲嶇疆瀵嗙爜</h1>
        <p className="text-gray-600">
          杈撳叆鎮ㄧ殑閭鍦板潃锛屾垜浠皢鍙戦€侀噸缃摼鎺?        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-medium text-gray-800 mb-2">
            閭鍦板潃
          </label>
          <input
            type="email"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a87c] focus:border-transparent"
            placeholder="璇疯緭鍏ラ偖绠?
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <p className="mt-2 text-sm text-gray-500">
            璇疯緭鍏ユ偍娉ㄥ唽鏃朵娇鐢ㄧ殑閭鍦板潃
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <p className="font-semibold">鍙戦€佸け璐?/p>
            <p>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-gradient-to-r from-[#c9a87c] to-[#e8d5b8] text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              鍙戦€佷腑...
            </span>
          ) : '鍙戦€侀噸缃摼鎺?}
        </button>
      </form>

      <div className="mt-8 text-center text-gray-600">
        <Link href="/auth/login" className="text-[#a88a5c] font-semibold hover:underline">
          鈫?杩斿洖鐧诲綍
        </Link>
      </div>

      <div className="mt-12 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
        <h3 className="font-semibold text-gray-800 mb-2">娉ㄦ剰浜嬮」</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>鈥?閲嶇疆閾炬帴鏈夋晥鏈?<strong>24 灏忔椂</strong>锛岃灏藉揩鎿嶄綔</li>
          <li>鈥?濡傛灉鏀朵笉鍒伴偖浠讹紝璇锋鏌ュ瀮鍦鹃偖浠舵枃浠跺す</li>
          <li>鈥?閲嶇疆鍚庢偍鍙互浣跨敤鏂板瘑鐮佺珛鍗崇櫥褰?/li>
          <li>鈥?濡傛湁闂锛岃鑱旂郴瀹㈡湇 support@example.com</li>
        </ul>
      </div>
    </div>
  );
}