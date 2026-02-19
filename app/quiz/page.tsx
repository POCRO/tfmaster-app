'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Word } from '@/src/types/word';
import { generateDistractors, shuffleOptions } from '@/src/lib/quiz';
import { speak } from '@/src/lib/speech';
import { useAuth } from '@/src/lib/auth-context';
import { getTodayWords, recordAnswer } from '@/src/lib/user-progress';
import { supabase } from '@/src/lib/supabase';

export default function QuizPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const [words, setWords] = useState<Word[]>([]);
  const [allWords, setAllWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState<Word[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadWords();
    }
  }, [user, mode]);

  const loadWords = async () => {
    if (!user) return;

    const { data: all } = await supabase.from('words').select('*');
    setAllWords(all || []);

    const { reviewWords, newWords } = await getTodayWords(user.id, 20);

    let wordsToStudy: Word[] = [];
    if (mode === 'learn') {
      wordsToStudy = newWords;
    } else if (mode === 'review') {
      wordsToStudy = reviewWords;
    } else {
      wordsToStudy = [...reviewWords, ...newWords].slice(0, 20);
    }

    setWords(wordsToStudy);
    setLoading(false);
  };

  const currentWord = words[currentIndex];

  useEffect(() => {
    if (currentWord && allWords.length > 0) {
      const distractors = generateDistractors(currentWord, allWords);
      const allOptions = shuffleOptions([currentWord, ...distractors]);
      setOptions(allOptions);
      speak(currentWord.word);
    }
  }, [currentIndex, allWords, currentWord]);

  const handleSelect = useCallback(async (word: Word) => {
    if (selectedId || !user) return;

    setSelectedId(word.id);
    const correct = word.id === currentWord.id;
    setIsCorrect(correct);

    if (correct) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setScore(prev => ({ ...prev, wrong: prev.wrong + 1 }));
    }

    await recordAnswer(user.id, currentWord.id, correct);

    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSelectedId(null);
      setIsCorrect(null);
    }, 600);
  }, [selectedId, currentWord, user]);

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

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <p className="text-slate-300">加载中...</p>
      </div>
    );
  }

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
          {options.map((option, index) => {
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
                className={`${bgColor} p-5 rounded-xl border-2 text-left text-xl font-semibold transition-all disabled:cursor-not-allowed flex items-center gap-4`}
              >
                <span className="text-slate-400 font-mono text-sm">{index + 1}</span>
                {option.translation}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
