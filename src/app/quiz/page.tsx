'use client';

import { useState, useEffect, useCallback } from 'react';
import { words } from '@/data/words';
import { Word } from '@/types/word';
import { generateDistractors, shuffleOptions } from '@/lib/quiz';
import { speak } from '@/lib/speech';

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

  const handleSelect = useCallback((word: Word) => {
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
      if (currentIndex < words.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedId(null);
        setIsCorrect(null);
      }
    }, 1500);
  }, [selectedId, currentWord, currentIndex]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();

      if (key === ' ') {
        e.preventDefault();
        speak(currentWord.word);
      } else if (['1', '2', '3', '4'].includes(key) && !selectedId) {
        const index = parseInt(key) - 1;
        if (options[index]) handleSelect(options[index]);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentWord, options, selectedId, handleSelect]);

  if (currentIndex >= words.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">完成！</h1>
          <p className="text-xl">正确: {score.correct} / 错误: {score.wrong}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="text-sm text-gray-500 mb-2">
            {currentIndex + 1} / {words.length}
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">{currentWord.word}</h1>
          <button onClick={() => speak(currentWord.word)} className="text-3xl hover:scale-110 transition-transform">🔊</button>
        </div>

        <div className="grid gap-4">
          {options.map((option, index) => {
            const isSelected = selectedId === option.id;
            const isCurrentCorrect = option.id === currentWord.id;

            let bgColor = 'bg-white hover:bg-gray-50';
            if (isSelected && isCorrect) bgColor = 'bg-green-100';
            if (isSelected && !isCorrect) bgColor = 'bg-red-100';
            if (selectedId && isCurrentCorrect && !isSelected) bgColor = 'bg-green-100';

            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option)}
                disabled={!!selectedId}
                className={`${bgColor} p-6 rounded-lg border-2 border-gray-200 text-left text-xl transition-all disabled:cursor-not-allowed flex items-center gap-4`}
              >
                <span className="text-gray-400 font-mono text-sm">{index + 1}</span>
                {option.translation}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
