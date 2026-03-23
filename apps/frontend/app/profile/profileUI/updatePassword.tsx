import { ChangePassword } from "@/app/actions/client/client-auth";
import Button from "@/app/components/atoms/button";
import { Input } from "@/app/components/atoms/input";
import { errorAtom } from "@/app/libs/atom";
import { useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { GiConfirmed } from "react-icons/gi";
import { RiLockPasswordLine } from "react-icons/ri";

export const UpdatePassword = ({
  setAlert,
}: {
  setAlert: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
  const setError = useSetAtom(errorAtom);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [{ data }, onChangePassword] = ChangePassword();
  useEffect(() => {
    if (data?.message) {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setAlert(data.message);
    }
  }, [data]);
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
            onChangePassword({ oldPassword, newPassword });
          }}
        />
      </div>
    </div>
  );
};
