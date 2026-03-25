"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { GetTodosType, UpdateTodoRequest } from "@/app/types/api";

export const todoKeys = {
  all: () => ["todos"] as const,
};

export function useTodos(options?: { initialData?: GetTodosType }) {
  return useQuery({
    queryKey: todoKeys.all(),
    queryFn: () => apiClient<GetTodosType>("/todos"),
    initialData: options?.initialData,
  });
}

export function useCreateTodos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: unknown) =>
      apiClient<{ message: string }>("/todos", { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all() });
    },
  });
}

export function useUpdateTodos(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTodoRequest) =>
      apiClient<GetTodosType>(`/todos/${id}`, { method: "PUT", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all() });
    },
  });
}
