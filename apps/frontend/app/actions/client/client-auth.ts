"use client";

import { useApiRequest } from "@/app/libs/hooks/useFetch";
import { AuthResponse, LoginRequest } from "@/app/types/api";

export function LoginUser() {
  const res = useApiRequest<AuthResponse, LoginRequest>("/auth/login", "POST");
  return res;
}

export function Logout() {
  const res = useApiRequest<{ message: string }>("/auth/logout", "POST");
  return res;
}

export function ChangePassword() {
  const res = useApiRequest<
    { message: string },
    { oldPassword: string; newPassword: string }
  >("/auth/change-password", "POST");
  return res;
}
