import { useApiRequest } from "@/app/libs/hooks/useFetch";
import { GetAllOverallT, GetOverallT } from "@/app/types/data";

export const GetAllOverall = (startDate: string, endDate: string) => {
  const res = useApiRequest<GetAllOverallT[] | null>(
    `/overall/all?startDate=${startDate}&endDate=${endDate}`,
    "GET"
  );
  return res;
};

export const GetOverall = (date?: string) => {
  const res = useApiRequest<GetOverallT | null>(
    `/overall?date=${date || ""}`,
    "GET"
  );
  return res;
};

export const ModifyOverall = (id?: number) => {
  const res = useApiRequest<
    {
      message: string;
      id?: number;
    },
    {
      emotion: string;
      reviewDate: string;
      memo?: string;
      isGetAdvice?: boolean;
    }
  >(`/overall${id ? `/${id}` : ""}`, id ? "PUT" : "POST");
  return res;
};
