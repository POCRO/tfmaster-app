'use client';

import { useState } from 'react';
import Link from 'next/link';
import { modelTexts } from '@/src/data/modelTexts';
import { speak } from '@/src/lib/speech';

export default function ReadingPage() {
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);

  const modelText = modelTexts[0];
  const currentSentence = modelText.sentences[currentSentenceIndex];

  const goToNext = () => {
    if (currentSentenceIndex < modelText.sentences.length - 1) {
      setCurrentSentenceIndex(prev => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentSentenceIndex > 0) {
      setCurrentSentenceIndex(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-slate-400 hover:text-slate-300 mb-4 inline-block">
            ← 返回首页
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

        {/* Sentences */}
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

        {/* Translation */}
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

        {/* Controls */}
        <div className="bg-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPrevious}
              disabled={currentSentenceIndex === 0}
              className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ◀ 上一句
            </button>

            <button
              onClick={() => speak(currentSentence.german)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg text-xl"
            >
              🔊 播放
            </button>

            <button
              onClick={goToNext}
              disabled={currentSentenceIndex === modelText.sentences.length - 1}
              className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一句 ▶
            </button>
          </div>

          <div className="text-center text-slate-400">
            进度: {currentSentenceIndex + 1} / {modelText.sentences.length}
          </div>
        </div>
      </div>
    </div>
  );
}
