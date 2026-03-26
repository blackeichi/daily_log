// 환경변수 타입 정의
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly NODE_ENV: "development" | "production" | "test";
      readonly NEXT_PUBLIC_API_URL: string;
      readonly API_URL: string;
    }
  }
}

export {};
