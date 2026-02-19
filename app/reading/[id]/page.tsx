'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
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
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/reading" className="text-slate-400 hover:text-slate-300 mb-4 inline-block">
            ← 返回列表
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">{modelText.title}</h1>
          <div className="flex gap-2">
            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
              {modelText.topic}
            </span>
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
              {modelText.level}
            </span>
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl p-8 mb-6">
          {modelText.sentences.map((sentence, index) => (
            <p
              key={sentence.id}
              className={`text-xl mb-4 transition-all ${
                index === currentSentenceIndex
                  ? 'text-white bg-slate-700 p-4 rounded-lg font-semibold'
                  : 'text-slate-400'
              }`}
            >
              {sentence.german}
            </p>
          ))}
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 mb-6">
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className="text-slate-300 hover:text-white mb-3"
          >
            {showTranslation ? '隐藏' : '显示'}中文翻译
          </button>
          {showTranslation && (
            <p className="text-slate-300 text-lg">{currentSentence.chinese}</p>
          )}
        </div>

        <div className="bg-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPrevious}
              disabled={currentSentenceIndex === 0 || isAutoPlaying}
              className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ◀ 上一句
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => speak(currentSentence.german)}
                disabled={isAutoPlaying}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg text-xl disabled:opacity-50"
              >
                🔊 播放
              </button>
              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className={`${isAutoPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white px-6 py-3 rounded-lg`}
              >
                {isAutoPlaying ? '⏸ 停止' : '▶ 自动播放'}
              </button>
            </div>

            <button
              onClick={goToNext}
              disabled={currentSentenceIndex === modelText.sentences.length - 1 || isAutoPlaying}
              className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一句 ▶
            </button>
          </div>

          <div className="text-center text-slate-400">
            进度: {currentSentenceIndex + 1} / {modelText.sentences.length}
          </div>
        </div>

        <div className="text-center text-slate-500 text-sm mt-4">
          快捷键: A-上一句 | D-下一句 | 空格-播放 | C-切换翻译
        </div>
      </div>
    </div>
  );
}
