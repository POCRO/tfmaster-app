export interface Word {
  id: string;
  word: string;
  translation: string;
  partOfSpeech: string;
  topic: string[];
  level: string;
  ipa?: string;
}
