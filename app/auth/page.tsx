'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/lib/auth-context';
import { supabase } from '@/src/lib/supabase';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        const { data: code } = await supabase
          .from('invite_codes')
          .select('*')
          .eq('code', inviteCode)
          .eq('used', false)
          .single();

        if (!code) {
          throw new Error('邀请码无效或已被使用');
        }

        await signUp(email, password);

        await supabase
          .from('invite_codes')
          .update({ used: true, used_at: new Date().toISOString() })
          .eq('code', inviteCode);
      }
      router.push('/');
    } catch (err: any) {
      setError(err.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-slate-800 p-8 rounded-2xl border-2 border-slate-700 w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          {isLogin ? '登录' : '注册'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-700 text-white border-2 border-slate-600 focus:border-blue-400 outline-none"
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-700 text-white border-2 border-slate-600 focus:border-blue-400 outline-none"
              required
            />
          </div>

          {!isLogin && (
            <div>
              <input
                type="text"
                placeholder="邀请码"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full p-3 rounded-lg bg-slate-700 text-white border-2 border-slate-600 focus:border-blue-400 outline-none"
                required
              />
            </div>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? '处理中...' : isLogin ? '登录' : '注册'}
          </button>
        </form>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="w-full mt-4 text-slate-400 hover:text-white transition-colors"
        >
          {isLogin ? '没有账号？注册' : '已有账号？登录'}
        </button>
      </div>
    </div>
  );
}
