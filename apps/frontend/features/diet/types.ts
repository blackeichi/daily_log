import { GetAllCalories } from "@/types/data";

export interface DietUIProps {
  initialData?: GetAllCalories[];
  initialDateRange?: [string, string];
}
