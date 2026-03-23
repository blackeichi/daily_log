"use client";

import { useApiRequest } from "@/app/libs/hooks/useFetch";
import { GetTodosType, UpdateTodoRequest } from "@/app/types/api";

export function GetTodos() {
  const res = useApiRequest<GetTodosType | null>("/todos", "GET");
  return res;
}
export function CreateTodos() {
  const res = useApiRequest("/todos", "POST");
  return res;
}
export function UpdateTodos(id: number) {
  const res = useApiRequest<GetTodosType, UpdateTodoRequest>(
    `/todos/${id}`,
    "PUT",
  );
  return res;
}
