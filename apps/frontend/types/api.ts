// 백엔드 응답 형식에 맞는 공통 타입 정의
export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

// 에러 응답 형식
export interface ApiErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message:
    | string
    | string[]
    | { message: string | string[]; error: string; statusCode: number };
}

// 기존 데이터 타입들 (백엔드와 동일하게)
export type User = {
  name: string;
  email: string;
  defaultLogObj: string[];
  goalCalorie: number;
  maximumCalorie: number;
};

export type Todo = {
  id: number;
  text: string;
  isDone: boolean;
  isDisabled?: boolean;
  description?: string;
  children?: Todo[];
  type?: "todo" | "section";
};

export type GetTodosType = {
  id: number;
  updatedAt: string;
  todayList: Todo[];
  weekList: Todo[];
  monthList: Todo[];
  yearList: Todo[];
  breakLimitList: Todo[];
};

export type TodoVersion = {
  id: number;
  updatedAt: string;
} | null;

export type GetLogsType = {
  id: number;
  title: string;
  logDate: string;
  todayLog: Record<string, string>;
  score?: number;
};

export type GetLogExcelData = {
  logs: GetLogsType[];
  todos: GetTodosType | null;
};

export type GetLogDetail = {
  id: number;
  title: string;
  todayLog: Record<string, string>;
  logDate: string;
  score?: number;
};

export type GetAllCalories = {
  id: number;
  memo: string;
  totalCalorie: number;
  goalCalorie: number;
  maximumCalorie: number;
  date: string;
  isSuccess: boolean;
};

export type GetCalorie = {
  id: number;
  eatenList: { name: string; cal: number; index: number }[];
  memo: string;
  totalCalorie: number;
  goalCalorie: number;
  maximumCalorie: number;
  date: string;
  isSuccess: boolean;
};

export type Routine = {
  id: number;
  dailyRoutines: { id: number; text: string }[];
  weeklyRoutines: { id: number; text: string }[];
  monthlyRoutines: { id: number; text: string }[];
};

export type StockQuote = {
  currentPrice: number;
  changeAmount: number;
  changePercent: number;
  week52High: number;
  week52HighDate: string;
  drawdownPercent: number;
};

export type StockWatchlistItem = {
  id: number;
  symbol: string;
  name: string;
  market: string;
  position: number;
  quote: StockQuote | null;
  quoteError?: string;
};

export type StockWatchlistResponse = {
  items: StockWatchlistItem[];
  marketDataStatus: "ready" | "partial" | "unconfigured";
  updatedAt: string;
};

export type StockSearchResult = {
  symbol: string;
  name: string;
  market: "KOSPI" | "KOSDAQ";
};

export type UpdateStockWatchlistRequest = {
  symbols: string[];
};

export type BudgetItem = {
  id: string;
  name: string;
  amount: number;
  category?: string;
};

export type Budget = {
  id: number;
  salary: number;
  fixedIncomes: BudgetItem[];
  fixedExpenses: BudgetItem[];
  updatedAt: string | null;
};

export type UpdateBudgetRequest = Pick<
  Budget,
  "salary" | "fixedIncomes" | "fixedExpenses"
>;

// 인증 관련 타입
export type LoginRequest = {
  email: string;
  password: string;
};

export type SignupRequest = {
  email: string;
  name: string;
  password: string;
  secretKey: string;
};

export type AuthResponse = {
  accessToken: string;
};

// 요청 타입들 (백엔드 DTO와 일치)
export type UpdateCaloriesRequest = {
  eatenList?: { name: string; cal: number }[];
  memo?: string;
  date?: string;
  totalCalorie?: number;
  goalCalorie?: number;
  maximumCalorie?: number;
};

export type UpdateTodoRequest = {
  name: "todayList" | "weekList" | "monthList" | "yearList" | "breakLimitList";
  data: Todo[];
};

export type UpdateAllTodosRequest = Pick<
  GetTodosType,
  "todayList" | "weekList" | "monthList" | "yearList" | "breakLimitList"
>;

export type UpdateRoutineRequest = {
  name: "dailyRoutines" | "weeklyRoutines" | "monthlyRoutines";
  data: { id: number; text: string }[];
};

export type UpdateLogRequest = {
  todayLog?: Record<string, string>;
  title?: string;
  logDate?: string;
  score?: number;
};
