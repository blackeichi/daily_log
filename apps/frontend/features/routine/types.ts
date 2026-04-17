export type ListName = "dailyRoutines" | "weeklyRoutines" | "monthlyRoutines";
export type RoutineItem = { id: number; text: string };

export interface RoutineData {
  id: number;
  dailyRoutines: RoutineItem[];
  weeklyRoutines: RoutineItem[];
  monthlyRoutines: RoutineItem[];
}
