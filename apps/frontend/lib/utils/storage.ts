const DAILY_LOG_REMEMBER_ME = "DAILY_LOG_REMEMBER_ME" as const;
const DAILY_LOG_SAVED_SENTENCE = "DAILY_LOG_SAVED_SENTENCE" as const;

// 브라우저 환경인지 체크하는 헬퍼 함수
const isBrowser = () => typeof window !== "undefined";

export const localStorageUtilites = {
  setRememberMe: (value: string | null) => {
    if (!isBrowser()) return;
    localStorage.setItem(DAILY_LOG_REMEMBER_ME, JSON.stringify(value));
  },
  getRememberMe: () => {
    if (!isBrowser()) return false;
    const value = localStorage.getItem(DAILY_LOG_REMEMBER_ME);
    return value ? JSON.parse(value) : false;
  },
  addSavedSentence: (newValue: string) => {
    if (!isBrowser()) return;
    const savedSentences = [
      newValue,
      ...localStorageUtilites.getSavedSentence(),
    ].slice(0, 50);
    localStorage.setItem(
      DAILY_LOG_SAVED_SENTENCE,
      JSON.stringify(savedSentences)
    );
  },
  getSavedSentence: () => {
    if (!isBrowser()) return [];
    const value = localStorage.getItem(DAILY_LOG_SAVED_SENTENCE);
    return value ? JSON.parse(value) : [];
  },
  removeSavedSentence: (index: number) => {
    if (!isBrowser()) return [];
    const sentences = localStorageUtilites.getSavedSentence();
    sentences.splice(index, 1);
    localStorage.setItem(DAILY_LOG_SAVED_SENTENCE, JSON.stringify(sentences));
    return sentences;
  },
};
