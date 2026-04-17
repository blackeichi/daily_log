"use client";

import { useCallback, useEffect, useState } from "react";
import { useSetAtom } from "jotai";
import { alertAtom, errorAtom } from "@/lib/atom";
import { LoginFormValues } from "../types";

const SAVED_ID_KEY = "saved-login-id";

export function useLogin() {
  const setAlert = useSetAtom(alertAtom);
  const setError = useSetAtom(errorAtom);

  const [form, setForm] = useState<LoginFormValues>({
    id: "",
    password: "",
  });
  const [rememberId, setRememberId] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedId = localStorage.getItem(SAVED_ID_KEY);

    if (!savedId) return;

    setForm((prev) => ({
      ...prev,
      id: savedId,
    }));
    setRememberId(true);
  }, []);

  const setField = useCallback(
    <K extends keyof LoginFormValues>(key: K, value: LoginFormValues[K]) => {
      setForm((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [],
  );

  const submit = useCallback(async () => {
    if (!form.id.trim()) {
      setError("아이디를 입력해주세요.");
      return;
    }

    if (!form.password.trim()) {
      setError("비밀번호를 입력해주세요.");
      return;
    }

    try {
      setLoading(true);

      // 여기 부분은 네 기존 로그인 API/액션으로 교체
      // 예:
      // await loginMutation.mutateAsync({ id: form.id, password: form.password });

      if (rememberId) {
        localStorage.setItem(SAVED_ID_KEY, form.id);
      } else {
        localStorage.removeItem(SAVED_ID_KEY);
      }

      setAlert("로그인되었습니다.");
    } catch (error) {
      console.error(error);
      setError("로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [form.id, form.password, rememberId, setAlert, setError]);

  return {
    form,
    loading,
    rememberId,
    setRememberId,
    setField,
    submit,
  };
}
