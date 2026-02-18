export interface Sentence {
  id: string;
  german: string;
  chinese: string;
}

export interface ModelText {
  id: string;
  title: string;
  topic: string;
  level: 'B2' | 'C1';
  sentences: Sentence[];
}
