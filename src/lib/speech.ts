export function speak(text: string, lang: string = 'de-DE'): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 1.0;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}
