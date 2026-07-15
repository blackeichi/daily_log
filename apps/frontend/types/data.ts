// 이 파일은 deprecated 됩니다. 새로운 타입은 api.ts를 사용하세요.
// 기존 컴포넌트들의 호환성을 위해 임시로 유지

export type {
  User,
  Todo,
  GetTodosType,
  GetLogsType,
  GetLogDetail,
  GetAllCalories,
  GetCalorie,
} from "./api";

export type DietCalendarData = {
  [key: string]: {
    isChecked: boolean;
    calorie: number;
    goalCalorie: number;
    maximumCalorie: number;
  };
};

export type EachRoutineT = {
  id: number;
  text: string;
  isDone: boolean;
};

// 기존 Routine 타입 유지 (하위 호환성)
export type Routine = {
  dailyRoutines: EachRoutineT[];
  weeklyRoutines: EachRoutineT[];
  monthlyRoutines: EachRoutineT[];
};

export type Eaten = { name: string; cal: number; index: number };
