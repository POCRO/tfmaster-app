import { Word } from '../types/word';

export function generateDistractors(correctWord: Word, allWords: Word[], count: number = 3): Word[] {
  const filtered = allWords.filter(w => w.id !== correctWord.id);

  // 优先选择同词性的词
  const samePos = filtered.filter(w => w.partOfSpeech === correctWord.partOfSpeech);
  const others = filtered.filter(w => w.partOfSpeech !== correctWord.partOfSpeech);

  const candidates = [...samePos, ...others];
  const shuffled = candidates.sort(() => Math.random() - 0.5);

  return shuffled.slice(0, count);
}

export function shuffleOptions(options: Word[]): Word[] {
  return [...options].sort(() => Math.random() - 0.5);
}
