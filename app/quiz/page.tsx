'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Word } from '@/src/types/word';
import { generateDistractors, shuffleOptions } from '@/src/lib/quiz';
import { speak } from '@/src/lib/speech';
import { useAuth } from '@/src/lib/auth-context';
import { getTodayWords, recordAnswer } from '@/src/lib/user-progress';
import { supabase } from '@/src/lib/supabase';
import { PageBackground } from '@/src/components/PageBackground';

function QuizContent() {
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
  const [showWordDetail, setShowWordDetail] = useState(false);
  // 追踪每个单词的连续正确次数 {wordId: correctCount}
  const [wordCorrectCounts, setWordCorrectCounts] = useState<Record<string, number>>({});
  // 追踪完全学会的单词集合
  const [masteredWords, setMasteredWords] = useState<Set<string>>(new Set());
  // 存储单词的复习时间信息
  const [wordReviewDates, setWordReviewDates] = useState<Record<string, string>>({});

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

    const { reviewWords, newWords } = await getTodayWords(user.id, 10);

    let wordsToStudy: Word[] = [];
    if (mode === 'learn') {
      wordsToStudy = newWords;
    } else if (mode === 'review') {
      wordsToStudy = reviewWords;
    } else {
      wordsToStudy = [...reviewWords, ...newWords].slice(0, 10);
    }

    setWords(wordsToStudy);
    setLoading(false);
  };

  // 当前单词
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

      // 更新连续正确次数
      const currentCount = wordCorrectCounts[currentWord.id] || 0;
      const newCount = currentCount + 1;
      setWordCorrectCounts(prev => ({ ...prev, [currentWord.id]: newCount }));

      // 如果连续两次正确，标记为完全学会
      const newMasteredWords = new Set(masteredWords);
      if (newCount >= 2) {
        newMasteredWords.add(currentWord.id);
        setMasteredWords(newMasteredWords);
      }

      await recordAnswer(user.id, currentWord.id, correct);

      // 获取更新后的复习时间
      if (newCount >= 2) {
        const { data: progress } = await supabase
          .from('user_progress')
          .select('next_review')
          .eq('user_id', user.id)
          .eq('word_id', currentWord.id)
          .single();

        if (progress?.next_review) {
          setWordReviewDates(prev => ({ ...prev, [currentWord.id]: progress.next_review }));
        }
      }

      setTimeout(() => {
        // 检查是否还有未学会的单词需要继续练习
        const unmasteredWordIndex = words.findIndex(w => !newMasteredWords.has(w.id));

        if (currentIndex < words.length - 1) {
          // 还有后续单词，继续下一个
          setCurrentIndex(prev => prev + 1);
        } else if (unmasteredWordIndex !== -1) {
          // 已经到最后一个单词，但还有未学会的单词，跳回第一个未学会的单词
          setCurrentIndex(unmasteredWordIndex);
        } else {
          // 所有单词都学会了，继续到下一个索引（会触发完成页面）
          setCurrentIndex(prev => prev + 1);
        }

        setSelectedId(null);
        setIsCorrect(null);
      }, 600);
    } else {
      setScore(prev => ({ ...prev, wrong: prev.wrong + 1 }));

      // 选错时重置连续正确次数
      setWordCorrectCounts(prev => ({ ...prev, [currentWord.id]: 0 }));

      await recordAnswer(user.id, currentWord.id, correct);

      // 选错后显示详细释义页面
      setTimeout(() => {
        setShowWordDetail(true);
      }, 600);
    }
  }, [selectedId, currentWord, user, wordCorrectCounts]);

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

  // 如果 currentWord 不存在（索引超出范围），显示完成页面
  if (!currentWord || (currentIndex >= words.length && masteredWords.size >= words.length)) {
    return (
      <div className="min-h-screen flex items-center justify-center relative p-8">
        <PageBackground page="quiz" />

        <div className="w-full max-w-5xl relative z-20">
          <div className="text-center bg-slate-800/90 backdrop-blur-sm p-12 rounded-2xl border-2 border-slate-700 mb-8 shadow-xl">
            <h1 className="text-5xl font-bold mb-6 text-white">🎉 完成！</h1>
            <div className="text-2xl space-y-2 mb-8">
              <p className="text-blue-400 font-semibold">完全学会: {masteredWords.size} / {words.length}</p>
              <p className="text-green-400 font-semibold">正确: {score.correct}</p>
              <p className="text-red-400 font-semibold">错误: {score.wrong}</p>
              <p className="text-slate-300 mt-4">准确率: {Math.round((score.correct / (score.correct + score.wrong)) * 100)}%</p>
            </div>
          </div>

          {/* 今日学习单词列表 */}
          <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl border-2 border-slate-700 overflow-hidden mb-8 shadow-xl">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-2xl font-bold text-white">今日学习单词</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">单词</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">释义</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">下次复习时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {words.map((word) => {
                    const reviewDate = wordReviewDates[word.id];
                    const formattedDate = reviewDate
                      ? new Date(reviewDate).toLocaleDateString('zh-CN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : '待定';

                    return (
                      <tr key={word.id} className="hover:bg-slate-750">
                        <td className="px-6 py-4 text-white font-semibold">{word.word}</td>
                        <td className="px-6 py-4 text-slate-300">{word.translation}</td>
                        <td className="px-6 py-4 text-slate-400">{formattedDate}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="inline-block bg-blue-500/90 hover:bg-blue-600/90 backdrop-blur-sm text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors shadow-lg"
            >
              返回首页
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 显示单词详细释义页面
  if (showWordDetail) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative p-4">
        <PageBackground page="quiz" />

        <div className="w-full max-w-2xl relative z-20">
          {/* 进度条 - 与背诵页面一致 */}
          <div className="mb-8 text-center">
            <div className="text-sm font-medium text-slate-300 mb-2">
              完全学会: {masteredWords.size} / {words.length}
            </div>
            <div className="w-full bg-slate-700 h-3 rounded-full">
              <div
                className="bg-gradient-to-r from-blue-400 to-cyan-400 h-3 rounded-full transition-all"
                style={{ width: `${(masteredWords.size / words.length) * 100}%` }}
              />
            </div>
          </div>

          {/* 单词显示区域 - 与背诵页面一致 */}
          <div className="text-center mb-12">
            <h1
              className="text-6xl font-bold mb-2 text-white cursor-pointer hover:text-blue-300 transition-colors font-[family-name:var(--font-atkinson)]"
              onClick={() => speak(currentWord.word)}
            >
              {currentWord.word}
            </h1>
            {currentWord.ipa && (
              <p className="text-xl text-slate-400 mb-4">{currentWord.ipa}</p>
            )}
          </div>

          {/* 详细释义区域 - 替代选项位置 */}
          <div className="grid gap-3">
            {/* 答错提示 */}
            <div className="bg-red-500/90 border-red-400 p-5 rounded-xl border-2 text-center backdrop-blur-sm shadow-lg">
              <p className="text-white text-xl font-semibold">❌ 答错了，再看看这个单词</p>
            </div>

            {/* 中文释义 */}
            <div className="bg-slate-800/90 border-slate-600 p-5 rounded-xl border-2 backdrop-blur-sm shadow-lg">
              <h3 className="text-sm font-semibold text-slate-400 mb-2">中文释义</h3>
              <p className="text-xl text-white font-semibold">{currentWord.translation}</p>
            </div>

            {/* 词性和性别 */}
            {(currentWord.partOfSpeech || currentWord.gender) && (
              <div className="bg-slate-800/90 border-slate-600 p-5 rounded-xl border-2 backdrop-blur-sm shadow-lg">
                <div className="flex gap-6">
                  {currentWord.partOfSpeech && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-400 mb-2">词性</h3>
                      <p className="text-lg text-white">{currentWord.partOfSpeech}</p>
                    </div>
                  )}
                  {currentWord.gender && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-400 mb-2">性别</h3>
                      <p className="text-lg text-white">{currentWord.gender}</p>
                    </div>
                  )}
                  {currentWord.plural && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-400 mb-2">复数</h3>
                      <p className="text-lg text-white">{currentWord.plural}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 例句 */}
            {currentWord.exampleSentence && (
              <div className="bg-slate-800/90 border-slate-600 p-5 rounded-xl border-2 backdrop-blur-sm shadow-lg">
                <h3 className="text-sm font-semibold text-slate-400 mb-2">例句</h3>
                <p className="text-lg text-white mb-2">{currentWord.exampleSentence}</p>
                {currentWord.exampleTranslation && (
                  <p className="text-base text-slate-400 mt-2">{currentWord.exampleTranslation}</p>
                )}
              </div>
            )}

            {/* 继续学习按钮 */}
            <button
              onClick={() => {
                setShowWordDetail(false);
                setCurrentIndex(prev => prev + 1);
                setSelectedId(null);
                setIsCorrect(null);
              }}
              className="bg-blue-500/90 hover:bg-blue-600/90 text-white font-bold py-4 rounded-xl text-xl transition-colors mt-4 backdrop-blur-sm shadow-lg"
            >
              继续学习 →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative p-4">
      <PageBackground page="quiz" />

      <div className="w-full max-w-2xl relative z-20">
        <div className="mb-8 text-center">
          <div className="text-sm font-medium text-slate-300 mb-2">
            完全学会: {masteredWords.size} / {words.length}
          </div>
          <div className="w-full bg-slate-700 h-3 rounded-full">
            <div
              className="bg-gradient-to-r from-blue-400 to-cyan-400 h-3 rounded-full transition-all"
              style={{ width: `${(masteredWords.size / words.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-6 mb-2">
            <h1
              className="text-6xl font-bold text-white cursor-pointer hover:text-blue-300 transition-colors font-[family-name:var(--font-atkinson)]"
              onClick={() => speak(currentWord.word)}
            >
              {currentWord.word}
            </h1>
            {/* 进度指示器 - 两个上下排列的小点 */}
            <div className="flex flex-col gap-2">
              <div className={`w-3 h-3 rounded-full transition-colors ${
                (wordCorrectCounts[currentWord.id] || 0) >= 2 ? 'bg-green-400' : 'bg-slate-600'
              }`} />
              <div className={`w-3 h-3 rounded-full transition-colors ${
                (wordCorrectCounts[currentWord.id] || 0) >= 1 ? 'bg-green-400' : 'bg-slate-600'
              }`} />
            </div>
          </div>
          {currentWord.ipa && (
            <p className="text-xl text-slate-400 mb-4">{currentWord.ipa}</p>
          )}
        </div>

        <div className="grid gap-3">
          {options.map((option, index) => {
            const isSelected = selectedId === option.id;
            const isCurrentCorrect = option.id === currentWord.id;

            let bgColor = 'bg-slate-800/90 hover:bg-slate-700/90 backdrop-blur-sm border-slate-600 text-white shadow-lg';
            if (isSelected && isCorrect) bgColor = 'bg-green-500/90 border-green-400 text-white backdrop-blur-sm shadow-lg';
            if (isSelected && !isCorrect) bgColor = 'bg-red-500/90 border-red-400 text-white backdrop-blur-sm shadow-lg';
            if (selectedId && isCurrentCorrect && !isSelected) bgColor = 'bg-green-500/90 border-green-400 text-white backdrop-blur-sm shadow-lg';

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

export default function QuizPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <p className="text-slate-300">加载中...</p>
      </div>
    }>
      <QuizContent />
    </Suspense>
  );
}
