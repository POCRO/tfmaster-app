'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { words } from '@/src/data/words';
import { Word } from '@/src/types/word';
import { generateDistractors, shuffleOptions } from '@/src/lib/quiz';
import { speak } from '@/src/lib/speech';

export default function QuizPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState<Word[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });

  const currentWord = words[currentIndex];

  useEffect(() => {
    if (currentWord) {
      const distractors = generateDistractors(currentWord, words);
      const allOptions = shuffleOptions([currentWord, ...distractors]);
      setOptions(allOptions);
      speak(currentWord.word);
    }
  }, [currentIndex]);

  const handleSelect = (word: Word) => {
    if (selectedId) return;

    setSelectedId(word.id);
    const correct = word.id === currentWord.id;
    setIsCorrect(correct);

    if (correct) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setScore(prev => ({ ...prev, wrong: prev.wrong + 1 }));
    }

    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSelectedId(null);
      setIsCorrect(null);
    }, 1500);
  };

  if (currentIndex >= words.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center bg-slate-800 p-12 rounded-2xl border-2 border-slate-700">
          <h1 className="text-5xl font-bold mb-6 text-white">🎉 完成！</h1>
          <div className="text-2xl space-y-2 mb-8">
            <p className="text-green-400 font-semibold">正确: {score.correct}</p>
            <p className="text-red-400 font-semibold">错误: {score.wrong}</p>
            <p className="text-slate-300 mt-4">准确率: {Math.round((score.correct / words.length) * 100)}%</p>
          </div>
          <Link
            href="/"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="text-sm font-medium text-slate-300 mb-2">
            {currentIndex + 1} / {words.length}
          </div>
          <div className="w-full bg-slate-700 h-3 rounded-full">
            <div
              className="bg-gradient-to-r from-blue-400 to-cyan-400 h-3 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-2 text-white">{currentWord.word}</h1>
          {currentWord.ipa && (
            <p className="text-xl text-slate-400 mb-4">{currentWord.ipa}</p>
          )}
          <button onClick={() => speak(currentWord.word)} className="text-4xl hover:scale-110 transition-transform">🔊</button>
        </div>

        <div className="grid gap-3">
          {options.map((option) => {
            const isSelected = selectedId === option.id;
            const isCurrentCorrect = option.id === currentWord.id;

            let bgColor = 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-white';
            if (isSelected && isCorrect) bgColor = 'bg-green-500 border-green-400 text-white';
            if (isSelected && !isCorrect) bgColor = 'bg-red-500 border-red-400 text-white';
            if (selectedId && isCurrentCorrect && !isSelected) bgColor = 'bg-green-500 border-green-400 text-white';

            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option)}
                disabled={!!selectedId}
                className={`${bgColor} p-5 rounded-xl border-2 text-left text-xl font-semibold transition-all disabled:cursor-not-allowed`}
              >
                {option.translation}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
