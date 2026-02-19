'use client';

import Link from 'next/link';
import { useAuth } from '@/src/lib/auth-context';

export default function Home() {
  const { user, signOut, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <p className="text-gray-600">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 text-gray-800">TFMaster</h1>
        <p className="text-xl text-gray-600 mb-8">德福词汇学习平台</p>

        {user ? (
          <>
            <p className="text-sm text-gray-500 mb-4">欢迎，{user.email}</p>
            <Link
              href="/quiz"
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors"
            >
              开始学习
            </Link>
            <button
              onClick={signOut}
              className="block mx-auto mt-4 text-gray-500 hover:text-gray-700"
            >
              退出登录
            </button>
          </>
        ) : (
          <Link
            href="/auth"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors"
          >
            登录/注册
          </Link>
        )}

        <div className="mt-8 text-gray-500">
          <p>20 个核心词汇</p>
          <p>4 选 1 测验模式</p>
        </div>
      </div>
    </div>
  );
}
