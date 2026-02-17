import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 text-gray-800">TFMaster</h1>
        <p className="text-xl text-gray-600 mb-8">德福词汇学习平台</p>
        <Link
          href="/quiz"
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors"
        >
          开始学习
        </Link>
        <div className="mt-8 text-gray-500">
          <p>20 个核心词汇</p>
          <p>4 选 1 测验模式</p>
        </div>
      </div>
    </div>
  );
}
