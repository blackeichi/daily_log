"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import type {
  GetTodosType,
  TodoVersion,
  UpdateAllTodosRequest,
  UpdateTodoRequest,
} from "@/types/api";

export const todoKeys = {
  all: () => ["todos"] as const,
  version: () => ["todos", "version"] as const,
};

export function useTodoVersion() {
  return useQuery({
    queryKey: todoKeys.version(),
    queryFn: ({ signal }) =>
      apiClient<TodoVersion>("/todos/version", { signal }),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });
}

export function useServerTodos() {
  return useQuery({
    queryKey: todoKeys.all(),
    queryFn: ({ signal }) => apiClient<GetTodosType>("/todos", { signal }),
    enabled: false,
    gcTime: 0,
  });
}

export function useSyncTodos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAllTodosRequest) =>
      apiClient<GetTodosType>("/todos/sync", { method: "PUT", body: data }),
    onSuccess: (data) => {
      queryClient.setQueryData(todoKeys.all(), data);
      queryClient.setQueryData(todoKeys.version(), {
        id: data.id,
        updatedAt: data.updatedAt,
      });
    },
  });
}

export function useTodos(options?: { initialData?: GetTodosType }) {
  return useQuery({
    queryKey: todoKeys.all(),
    queryFn: ({ signal }) => apiClient<GetTodosType>("/todos", { signal }),
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

export function useUpdateAllTodos(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAllTodosRequest) =>
      apiClient<GetTodosType>(`/todos/${id}/all`, {
        method: "PUT",
        body: data,
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(todoKeys.all(), data);
    },
  });
}
