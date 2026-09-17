import type { Locale } from "../domain";

const LOCALE_TAGS: Record<Locale, string> = {
  id: "id-ID",
  en: "en-US",
  ar: "ar-SA",
};

export const supportsSpeech = (): boolean =>
  typeof window !== "undefined" &&
  "speechSynthesis" in window &&
  typeof SpeechSynthesisUtterance !== "undefined";

export const speakPhoneme = (
  phoneme: string,
  locale: Locale,
  enabled = true,
): boolean => {
  if (!enabled || phoneme.length === 0 || !supportsSpeech()) return false;
  const utterance = new SpeechSynthesisUtterance(phoneme);
  utterance.lang = LOCALE_TAGS[locale];
  utterance.rate = 0.75;
  utterance.pitch = 1.25;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return true;
};
