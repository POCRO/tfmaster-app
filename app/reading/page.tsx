'use client';

import Link from 'next/link';
import { modelTexts } from '@/src/data/modelTexts';

export default function ReadingListPage() {
  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-slate-400 hover:text-slate-300 mb-4 inline-block">
            ← 返回首页
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">范文跟读</h1>
          <p className="text-slate-300">选择一篇范文开始练习</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modelTexts.map((text) => (
            <Link
              key={text.id}
              href={`/reading/${text.id}`}
              className="bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 rounded-2xl p-6 transition-all hover:scale-105"
            >
              <h2 className="text-2xl font-bold text-white mb-3">{text.title}</h2>
              <div className="flex gap-2 mb-3">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                  {text.topic}
                </span>
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                  {text.level}
                </span>
              </div>
              <p className="text-slate-400 text-sm">{text.sentences.length} 个句子</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
