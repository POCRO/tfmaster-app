// SM-2 Spaced Repetition Algorithm

export interface SRSData {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: Date;
}

export function calculateNextReview(
  correct: boolean,
  currentData?: SRSData
): SRSData {
  const easeFactor = currentData?.easeFactor ?? 2.5;
  const interval = currentData?.interval ?? 0;
  const repetitions = currentData?.repetitions ?? 0;

  if (!correct) {
    return {
      easeFactor,
      interval: 0,
      repetitions: 0,
      nextReviewDate: new Date(),
    };
  }

  const newRepetitions = repetitions + 1;
  let newInterval: number;

  if (newRepetitions === 1) {
    newInterval = 1;
  } else if (newRepetitions === 2) {
    newInterval = 6;
  } else {
    newInterval = Math.round(interval * easeFactor);
  }

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + newInterval);

  return {
    easeFactor,
    interval: newInterval,
    repetitions: newRepetitions,
    nextReviewDate: nextDate,
  };
}
