import type { GetTodosType } from "@/types/api";

const DAILY_LOG_REMEMBER_ME = "DAILY_LOG_REMEMBER_ME" as const;
const DAILY_LOG_SAVED_SENTENCE = "DAILY_LOG_SAVED_SENTENCE" as const;
const DAILY_LOG_TODOS = "DAILY_LOG_TODOS_V1" as const;

export type LocalTodoSnapshot = {
  data: GetTodosType;
  updatedAt: string;
};

// 브라우저 환경인지 체크하는 헬퍼 함수
const isBrowser = () => typeof window !== "undefined";

export const localStorageUtilites = {
  setTodos: (snapshot: LocalTodoSnapshot) => {
    if (!isBrowser()) return;
    localStorage.setItem(DAILY_LOG_TODOS, JSON.stringify(snapshot));
  },
  getTodos: (): LocalTodoSnapshot | null => {
    if (!isBrowser()) return null;
    try {
      const value = localStorage.getItem(DAILY_LOG_TODOS);
      if (!value) return null;

      const snapshot = JSON.parse(value) as LocalTodoSnapshot;
      const data = snapshot?.data;
      if (
        !snapshot.updatedAt ||
        !data ||
        !Array.isArray(data.todayList) ||
        !Array.isArray(data.weekList) ||
        !Array.isArray(data.monthList) ||
        !Array.isArray(data.yearList) ||
        !Array.isArray(data.breakLimitList)
      ) {
        return null;
      }
      return snapshot;
    } catch {
      return null;
    }
  },
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
