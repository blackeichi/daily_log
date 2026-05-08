/**
 * Debounce delay constants used throughout the application
 */
export const DEBOUNCE_DELAYS = {
  /** For text input fields (500ms) */
  INPUT: 500,
  /** For checkbox interactions (1500ms) */
  CHECKBOX: 1500,
  /** Default debounce delay (1000ms) */
  DEFAULT: 1000,
} as const;

export const QUERY_TIMES = {
  REALTIME: {
    STALE: 0,
    GC: 0,
  },
  DAILY: {
    STALE: 1000 * 60 * 2, // 2분
    GC: 1000 * 60 * 10, // 10분
  },
  USER: {
    STALE: 1000 * 60 * 10, // 10분
    GC: 1000 * 60 * 30, // 30분
  },
  LONG: {
    STALE: 1000 * 60 * 60, // 1시간
    GC: 1000 * 60 * 60 * 2, // 2시간
  },
} as const;
