"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { LoginRequest, SignupRequest } from "@/app/types/api";

interface LoginResponse {
  message: string;
}

interface LogoutResponse {
  message: string;
}

interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) =>
      apiClient<LoginResponse>("/auth/login", { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient<LogoutResponse>("/auth/logout", { method: "POST" }),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: (data: SignupRequest) =>
      apiClient<{ message: string }>("/auth/signup", {
        method: "POST",
        body: data,
      }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) =>
      apiClient<{ message: string }>("/auth/change-password", {
        method: "POST",
        body: data,
      }),
  });
}
