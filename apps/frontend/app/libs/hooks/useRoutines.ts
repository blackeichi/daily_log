"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { Routine, UpdateRoutineRequest } from "@/app/types/api";

export const routineKeys = {
  all: () => ["routines"] as const,
};

export function useRoutines(options?: { initialData?: Routine }) {
  return useQuery({
    queryKey: routineKeys.all(),
    queryFn: () => apiClient<Routine>("/routines"),
    initialData: options?.initialData,
  });
}

export function useUpdateRoutines() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateRoutineRequest) =>
      apiClient<{ message: string }>("/routines", {
        method: "PUT",
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routineKeys.all() });
    },
  });
}
