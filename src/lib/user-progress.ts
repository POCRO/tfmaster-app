import { supabase } from './supabase';
import { calculateNextReview } from './srs';

export async function getTaskCounts(userId: string) {
  const today = new Date().toISOString().split('T')[0];

  const { count: reviewCount } = await supabase
    .from('user_words')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .lte('next_review_date', today);

  const { data: learnedWords } = await supabase
    .from('user_words')
    .select('word_id')
    .eq('user_id', userId);

  const learnedIds = learnedWords?.map(w => w.word_id) || [];

  const { count: totalWords } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true });

  const newWordCount = (totalWords || 0) - learnedIds.length;

  return { reviewCount: reviewCount || 0, newWordCount };
}

export async function getTodayWords(userId: string, newWordLimit: number = 10) {
  const { data: reviewWords } = await supabase
    .from('user_words')
    .select('*, words(*)')
    .eq('user_id', userId)
    .lte('next_review_date', new Date().toISOString().split('T')[0])
    .order('next_review_date', { ascending: true });

  const { data: newWords } = await supabase
    .from('words')
    .select('*')
    .not('id', 'in', `(SELECT word_id FROM user_words WHERE user_id = '${userId}')`)
    .limit(newWordLimit);

  return {
    reviewWords: reviewWords?.map(uw => uw.words) || [],
    newWords: newWords || [],
  };
}

export async function recordAnswer(
  userId: string,
  wordId: string,
  correct: boolean
) {
  const { data: existing } = await supabase
    .from('user_words')
    .select('*')
    .eq('user_id', userId)
    .eq('word_id', wordId)
    .single();

  const srsData = calculateNextReview(correct, existing || undefined);

  if (existing) {
    await supabase
      .from('user_words')
      .update({
        ease_factor: srsData.easeFactor,
        interval: srsData.interval,
        repetitions: srsData.repetitions,
        next_review_date: srsData.nextReviewDate.toISOString().split('T')[0],
        last_review_date: new Date().toISOString().split('T')[0],
        total_reviews: existing.total_reviews + 1,
        correct_count: existing.correct_count + (correct ? 1 : 0),
        wrong_count: existing.wrong_count + (correct ? 0 : 1),
      })
      .eq('id', existing.id);
  } else {
    await supabase.from('user_words').insert({
      user_id: userId,
      word_id: wordId,
      ease_factor: srsData.easeFactor,
      interval: srsData.interval,
      repetitions: srsData.repetitions,
      next_review_date: srsData.nextReviewDate.toISOString().split('T')[0],
      last_review_date: new Date().toISOString().split('T')[0],
      total_reviews: 1,
      correct_count: correct ? 1 : 0,
      wrong_count: correct ? 0 : 1,
    });
  }
}
