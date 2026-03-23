import { useApiRequest } from "@/app/libs/hooks/useFetch";
import { Routine, UpdateRoutineRequest } from "@/app/types/api";

export function GetRoutines() {
  const res = useApiRequest<Routine | null>("/routines", "GET");
  return res;
}
export function ModifyRoutines() {
  const res = useApiRequest<{ message: string } | null, UpdateRoutineRequest>(
    "/routines",
    "PUT",
  );
  return res;
}
