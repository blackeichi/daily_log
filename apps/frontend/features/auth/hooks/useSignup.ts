"use client";

import { useCallback, useState } from "react";
import { useSetAtom } from "jotai";
import { alertAtom, errorAtom } from "@/lib/atom";
import { SignupFormValues } from "../types";

const initialForm: SignupFormValues = {
  id: "",
  password: "",
  passwordConfirm: "",
  name: "",
};

export function useSignup() {
  const setAlert = useSetAtom(alertAtom);
  const setError = useSetAtom(errorAtom);

  const [form, setForm] = useState<SignupFormValues>(initialForm);
  const [loading, setLoading] = useState(false);

  const setField = useCallback(
    <K extends keyof SignupFormValues>(key: K, value: SignupFormValues[K]) => {
      setForm((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [],
  );

  const validate = useCallback(() => {
    if (!form.id.trim()) {
      setError("아이디를 입력해주세요.");
      return false;
    }

    if (!form.name.trim()) {
      setError("이름을 입력해주세요.");
      return false;
    }

    if (!form.password.trim()) {
      setError("비밀번호를 입력해주세요.");
      return false;
    }

    if (form.password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return false;
    }

    if (form.password !== form.passwordConfirm) {
      setError("비밀번호 확인이 일치하지 않습니다.");
      return false;
    }

    return true;
  }, [form, setError]);

  const submit = useCallback(async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      // 여기 부분은 네 기존 회원가입 API/액션으로 교체
      // 예:
      // await signupMutation.mutateAsync({
      //   id: form.id,
      //   password: form.password,
      //   name: form.name,
      // });

      setAlert("회원가입이 완료되었습니다.");
      setForm(initialForm);
    } catch (error) {
      console.error(error);
      setError("회원가입 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [form, setAlert, setError, validate]);

  return {
    form,
    loading,
    setField,
    submit,
  };
}
