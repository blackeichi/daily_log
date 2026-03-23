// 환경변수를 안전하게 접근하는 유틸리티

export const env = {
  // 클라이언트 사이드에서 접근 가능한 환경변수
  get apiUrl() {
    const url = process.env.NEXT_PUBLIC_API_URL;
    if (!url) {
      throw new Error("NEXT_PUBLIC_API_URL 환경변수가 설정되지 않았습니다.");
    }
    return url;
  },

  get nodeEnv() {
    return process.env.NODE_ENV || "development";
  },

  get isDevelopment() {
    return this.nodeEnv === "development";
  },

  get isProduction() {
    return this.nodeEnv === "production";
  },
} as const;

// 서버 사이드에서만 접근 가능한 환경변수
export const serverEnv = {
  get apiUrl() {
    const url = process.env.API_URL;
    if (!url) {
      throw new Error("API_URL 환경변수가 설정되지 않았습니다.");
    }
    return url;
  },
} as const;
