'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { modelTexts } from '@/src/data/modelTexts';
import { speak } from '@/src/lib/speech';

export default function ReadingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const modelText = modelTexts.find(t => t.id === id);

  if (!modelText) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-300 mb-4">范文不存在</p>
          <Link href="/reading" className="text-blue-400 hover:text-blue-300">
            返回列表
          </Link>
        </div>
      </div>
    );
  }

  const currentSentence = modelText.sentences[currentSentenceIndex];

  useEffect(() => {
    if (isAutoPlaying && modelText) {
      speak(currentSentence.german);
      const timer = setTimeout(() => {
        if (currentSentenceIndex < modelText.sentences.length - 1) {
          setCurrentSentenceIndex(prev => prev + 1);
        } else {
          setIsAutoPlaying(false);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isAutoPlaying, currentSentenceIndex, currentSentence, modelText]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();

      if (key === ' ') {
        e.preventDefault();
        if (!isAutoPlaying) speak(currentSentence.german);
      } else if (key === 'a') {
        goToPrevious();
      } else if (key === 'd') {
        goToNext();
      } else if (key === 'c') {
        setShowTranslation(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSentence, isAutoPlaying]);

  const goToNext = () => {
    if (currentSentenceIndex < modelText.sentences.length - 1) {
      setCurrentSentenceIndex(prev => prev + 1);
      setShowTranslation(false);
    }
  };

  const goToPrevious = () => {
    if (currentSentenceIndex > 0) {
      setCurrentSentenceIndex(prev => prev - 1);
      setShowTranslation(false);
    }
  };

  return (
    <div className="h-screen bg-slate-900 flex flex-col">
      {/* 顶部标题栏 */}
      <div className="p-4 border-b border-slate-700">
        <Link href="/reading" className="text-slate-400 hover:text-slate-300 mb-2 inline-block">
          ← 返回列表
        </Link>
        <h1 className="text-2xl font-bold text-white mb-2">{modelText.title}</h1>
        <div className="flex gap-2 flex-wrap">
          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">{modelText.topic}</span>
          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">{modelText.level}</span>
          {modelText.examYear && <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">真题 {modelText.examYear}</span>}
          {modelText.examLocation && <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm">{modelText.examLocation}</span>}
        </div>
      </div>

      {/* 主内容区：左右分栏 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧栏：考题原文 */}
        {modelText.examPrompt && (
          <div className="w-1/4 border-r border-slate-700 overflow-y-auto p-4">
            <div className="bg-slate-800 border-2 border-yellow-500 rounded-xl p-4 sticky top-0">
              <h2 className="text-xl font-bold text-yellow-400 mb-3">📝 考题原文</h2>
              <div className="text-slate-200 text-base prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{modelText.examPrompt}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {/* 右侧栏：范文内容 */}
        <div className="flex-1 overflow-y-auto p-4 pb-48">
          <div className="bg-slate-800 rounded-xl p-6">
            {modelText.sentences.map((sentence, index) => (
              <p key={sentence.id} className={`text-lg mb-3 transition-all ${index === currentSentenceIndex ? 'text-white bg-slate-700 p-3 rounded-lg font-semibold' : 'text-slate-400'}`}>
                {sentence.german}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* 底部固定控制栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 p-4">
        <div className="max-w-6xl mx-auto">
          {showTranslation && (
            <div className="bg-slate-700 rounded-lg p-3 mb-3">
              <p className="text-slate-200 text-center text-lg">{currentSentence.chinese}</p>
            </div>
          )}
          <div className="flex items-center justify-between gap-3 mb-3">
            <button onClick={goToPrevious} disabled={currentSentenceIndex === 0 || isAutoPlaying} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">
              ◀ 上一句
            </button>
            <div className="flex gap-2">
              <button onClick={() => speak(currentSentence.german)} disabled={isAutoPlaying} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50">
                🔊 播放
              </button>
              <button onClick={() => setIsAutoPlaying(!isAutoPlaying)} className={`${isAutoPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white px-4 py-2 rounded-lg`}>
                {isAutoPlaying ? '⏸ 停止' : '▶ 自动'}
              </button>
              <button onClick={() => setShowTranslation(!showTranslation)} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg">
                {showTranslation ? '隐藏' : '显示'}翻译
              </button>
            </div>
            <button onClick={goToNext} disabled={currentSentenceIndex === modelText.sentences.length - 1 || isAutoPlaying} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">
              下一句 ▶
            </button>
          </div>
          <div className="text-center text-slate-400 text-sm">
            进度: {currentSentenceIndex + 1} / {modelText.sentences.length} | 快捷键: A-上一句 | D-下一句 | 空格-播放 | C-切换翻译
          </div>
        </div>
      </div>
    </div>
  );
}
