import Button from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { errorAtom } from "@/lib/atom";
import { useSetAtom } from "jotai";
import { useState } from "react";
import { GiConfirmed } from "react-icons/gi";
import { RiLockPasswordLine } from "react-icons/ri";
import { useChangePassword } from "@/lib/hooks/useAuth";

export const UpdatePassword = ({
  setAlert,
}: {
  setAlert: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
  const setError = useSetAtom(errorAtom);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const changePasswordMutation = useChangePassword();
  return (
    <div className="w-full p-4 border border-stone-300 rounded-xl flex flex-col gap-3 max-w-[600px]">
      <span className="text-lg font-bold mb-2">🔒 비밀번호 변경</span>
      <Input
        id="oldPassword"
        value={oldPassword}
        setValue={setOldPassword}
        placeholder="현재 비밀번호를 입력해주세요."
        required
        title="현재 비밀번호"
        type="password"
        width="100%"
        height={45}
      />
      <Input
        id="newPassword"
        value={newPassword}
        setValue={setNewPassword}
        placeholder="새 비밀번호를 입력해주세요."
        required
        title="새 비밀번호"
        type="password"
        icon={<RiLockPasswordLine size={18} />}
        width="100%"
        height={45}
      />
      <Input
        id="confirmPassword"
        value={confirmPassword}
        setValue={setConfirmPassword}
        placeholder="새 비밀번호를 다시 입력해주세요."
        required
        title="새 비밀번호 확인"
        type="password"
        icon={
          <GiConfirmed
            color={
              confirmPassword && confirmPassword === newPassword ? "green" : ""
            }
            size={18}
          />
        }
        width="100%"
        height={45}
      />
      <div className="flex justify-end mt-2">
        <Button
          width={100}
          height={45}
          text="비밀번호 변경"
          onClick={() => {
            if (!oldPassword || !newPassword || !confirmPassword) {
              setError("모든 항목을 입력해주세요.");
              return;
            }
            if (newPassword !== confirmPassword) {
              setError("새 비밀번호와 비밀번호 확인이 일치하지 않습니다.");
              return;
            }
            changePasswordMutation.mutate(
              { oldPassword, newPassword },
              {
                onSuccess: (res) => {
                  if (res?.message) {
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setAlert(res.message);
                  }
                },
                onError: (err) => {
                  setError(
                    (err as Error).message || "비밀번호 변경에 실패했습니다.",
                  );
                },
              },
            );
          }}
        />
      </div>
    </div>
  );
};
