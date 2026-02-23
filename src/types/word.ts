export interface Word {
  id: string;
  word: string;
  translation: string;
  partOfSpeech: string;
  ipa?: string;
  gender?: string;
  plural?: string;
  exampleSentence?: string;
  exampleTranslation?: string;
}
