'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/src/lib/auth-context';
import { getTaskCounts } from '@/src/lib/user-progress';
import { PageBackground } from '@/src/components/PageBackground';

export default function Home() {
  const { user, signOut, loading } = useAuth();
  const [taskCounts, setTaskCounts] = useState({ reviewCount: 0, newWordCount: 0 });

  useEffect(() => {
    if (user) {
      getTaskCounts(user.id).then(setTaskCounts);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <p className="text-slate-300">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative p-4">
      <PageBackground page="home" />

      {/* 内容层 */}
      <div className="relative z-20 w-full flex flex-col items-center justify-center">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 text-white drop-shadow-lg">Fischfutter fürs Gehirn</h1>
          <p className="text-xl text-slate-100 drop-shadow-md">给大脑的鱼食 · 德福词汇学习平台</p>
          {user ? (
            <div className="mt-4">
              <p className="text-sm text-slate-200">欢迎，{user.email}</p>
              <button onClick={signOut} className="text-sm text-slate-300 hover:text-white mt-2">
                退出登录
              </button>
            </div>
          ) : (
            <Link href="/auth" className="inline-block mt-4 text-blue-300 hover:text-blue-200">
              登录/注册
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full">
          <Link
            href="/quiz?mode=learn"
            className="bg-slate-800/90 hover:bg-slate-700/90 backdrop-blur-sm border-2 border-slate-600 rounded-2xl p-8 transition-all hover:scale-105 shadow-xl"
          >
            <div className="text-center">
              <div className="text-5xl mb-4">📚</div>
              <h2 className="text-3xl font-bold text-white mb-3">学习</h2>
              <p className="text-slate-200 mb-4">学习新词汇</p>
              {user && (
                <p className="text-blue-300 text-2xl font-bold">{taskCounts.newWordCount} 个新词</p>
              )}
            </div>
          </Link>

          <Link
            href="/quiz?mode=review"
            className="bg-slate-800/90 hover:bg-slate-700/90 backdrop-blur-sm border-2 border-slate-600 rounded-2xl p-8 transition-all hover:scale-105 shadow-xl"
          >
            <div className="text-center">
              <div className="text-5xl mb-4">🔄</div>
              <h2 className="text-3xl font-bold text-white mb-3">复习</h2>
              <p className="text-slate-200 mb-4">复习已学词汇</p>
              {user && (
                <p className="text-green-300 text-2xl font-bold">{taskCounts.reviewCount} 个待复习</p>
              )}
            </div>
          </Link>

          <Link
            href="/reading"
            className="bg-slate-800/90 hover:bg-slate-700/90 backdrop-blur-sm border-2 border-slate-600 rounded-2xl p-8 transition-all hover:scale-105 shadow-xl"
          >
            <div className="text-center">
              <div className="text-5xl mb-4">🎙️</div>
              <h2 className="text-3xl font-bold text-white mb-3">范文跟读</h2>
              <p className="text-slate-200 mb-4">德福口语写作范文</p>
              <p className="text-slate-300 text-sm">即将推出</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
