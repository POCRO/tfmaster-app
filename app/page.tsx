import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-4">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold mb-4 text-white">Fischfutter fürs Gehirn</h1>
        <p className="text-xl text-slate-300">给大脑的鱼食 · 德福词汇学习平台</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        <Link
          href="/quiz"
          className="bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 rounded-2xl p-8 transition-all hover:scale-105"
        >
          <div className="text-center">
            <div className="text-5xl mb-4">📚</div>
            <h2 className="text-3xl font-bold text-white mb-3">背单词</h2>
            <p className="text-slate-300 mb-4">4选1测验模式</p>
            <p className="text-slate-400 text-sm">20个核心词汇</p>
          </div>
        </Link>

        <Link
          href="/reading"
          className="bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 rounded-2xl p-8 transition-all hover:scale-105"
        >
          <div className="text-center">
            <div className="text-5xl mb-4">🎙️</div>
            <h2 className="text-3xl font-bold text-white mb-3">范文跟读</h2>
            <p className="text-slate-300 mb-4">德福口语写作范文</p>
            <p className="text-slate-400 text-sm">即将推出</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
