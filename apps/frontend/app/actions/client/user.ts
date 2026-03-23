import { useApiRequest } from "@/app/libs/hooks/useFetch";
import { User } from "@/app/types/data";

export function GetMe() {
  const res = useApiRequest<User | null>("/users/me", "GET");
  return res;
}

export function GetAllData(date: string) {
  const res = useApiRequest<{
    /* todos: Todo[] | null;
    calorie: GetCalorie | null; */
    log: Record<string, string> | null;
  }>(`/users/all-data/${date}`, "GET");
  return res;
}

export function UpdateMe() {
  const res = useApiRequest<
    {
      message: string;
      data: {
        email: string;
        name: string;
        defaultLogObj: string[];
        goalCalorie: number;
        maximumCalorie: number;
      };
    } | null,
    { goalCalorie?: number; maximumCalorie?: number; defaultLogObj?: string[] }
  >("/users/me", "PUT");
  return res;
}

export function UpdateAiCount() {
  const res = useApiRequest("/users/increment-ai-count", "POST");
  return res;
}
