import { useApiRequest } from "@/app/libs/hooks/useFetch";
import { GetAllCalories, GetCalorie } from "@/app/types/data";

export const GetAllDiet = (startDate: string, endDate: string) => {
  const res = useApiRequest<GetAllCalories[] | null>(
    `/calories/all?startDate=${startDate}&endDate=${endDate}`,
    "GET"
  );
  return res;
};

export const GetDiet = (date?: string) => {
  const res = useApiRequest<GetCalorie | null>(
    `/calories?date=${date || ""}`,
    "GET"
  );
  return res;
};

export const ModifyDiet = (id?: number) => {
  const res = useApiRequest<
    {
      message: string;
      data: {
        isSuccess: boolean;
        totalCalorie: number;
      };
    },
    {
      eatenList?: { name: string; cal: number }[];
      memo?: string;
      date?: string;
    }
  >(`/calories${id ? `/${id}` : ""}`, id ? "PUT" : "POST");
  return res;
};
