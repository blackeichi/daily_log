import Button from "@/app/components/atoms/button";
import { Input } from "@/app/components/atoms/input";
import IconButton from "@/app/components/molecules/iconButton";
import { COLOR_THEME, DEFAULT_LOG_OBJS } from "@/app/constants/system";
import { User } from "@/app/types/data";
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useUpdateMe } from "@/app/libs/hooks/useUser";

export default function UpdateUserInfo({
  user,
  setUser,
  setAlert,
}: {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setAlert: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const updateMeMutation = useUpdateMe();
  const onUpdateMe = (data: Parameters<typeof updateMeMutation.mutate>[0]) => {
    updateMeMutation.mutate(data, {
      onSuccess: (res) => {
        if (res?.message) {
          setAlert(res.message);
          if (res.data) {
            setUser(res.data);
          }
        }
      },
    });
  };
  const [goalCalorie, setGoalCalorie] = useState<number>(
    user?.goalCalorie || 0,
  );
  const [maximumCalorie, setMaximumCalorie] = useState<number>(
    user?.maximumCalorie || 0,
  );
  const [logCategories, setLogCategories] = useState<string[]>([
    ...(user?.defaultLogObj || []),
  ]);
  useEffect(() => {
    if (user) {
      setGoalCalorie(user.goalCalorie);
      setMaximumCalorie(user.maximumCalorie);
      setLogCategories(user.defaultLogObj);
    }
  }, [user]);
  let newCategory = "";
  return (
    <>
      <div className="w-full p-4 border border-stone-300 rounded-xl max-w-[600px] flex flex-col gap-3">
        <span className="text-lg font-bold mb-2">🍽️ 나의 식단 정보 설정</span>
        <div className="w-full flex gap-2 items-end">
          <Input
            id="goalCalorie_input"
            title="하루 goal 칼로리는?"
            type="number"
            value={goalCalorie}
            setValue={setGoalCalorie}
            icon={"🔥"}
            height={30}
            width="100%"
            disabled={!user}
          />
          <Input
            id="maximumCalorie_input"
            title="하루 max 칼로리는?"
            type="number"
            value={maximumCalorie}
            setValue={setMaximumCalorie}
            icon={"✅"}
            height={30}
            width="100%"
            disabled={!user}
          />
          <Button
            text="저장"
            onClick={() =>
              onUpdateMe({
                goalCalorie: Number(goalCalorie),
                maximumCalorie: Number(maximumCalorie),
              })
            }
            height={30}
            width={50}
            style={{ flexShrink: 0 }}
            isLoading={!user}
          />
        </div>
      </div>
      <div className="w-full p-4 border border-stone-300 rounded-xl max-w-[600px] flex flex-col gap-3">
        <span className="text-lg font-bold mb-2 flex justify-between">
          📝 로그 카테고리
          <div className="flex items-center gap-2">
            <Button
              text="새로고침"
              onClick={() => {
                setLogCategories(user?.defaultLogObj || []);
              }}
              height={30}
              width={60}
              style={{ backgroundColor: COLOR_THEME.PASTEL_GREEN_COLOR }}
              isLoading={!user}
            />
            <Button
              text="기본값"
              onClick={() => {
                setLogCategories(DEFAULT_LOG_OBJS);
              }}
              height={30}
              width={50}
              style={{ backgroundColor: COLOR_THEME.PASTEL_RED_COLOR }}
              isLoading={!user}
            />
          </div>
        </span>
        <div className="w-full flex flex-col gap-3 h-40 overflow-y-auto pr-2 show_scrollbar">
          {!user ? (
            // 스켈레톤 UI
            <>
              {[1, 2, 3].map((i) => (
                <div className="flex items-center gap-2" key={i}>
                  <div className="h-[30px] bg-stone-200 rounded flex-1 animate-pulse"></div>
                  <div className="w-7 h-7 bg-stone-300 rounded-full animate-pulse"></div>
                </div>
              ))}
            </>
          ) : (
            logCategories.map((logObj, index) => (
              <div className="flex items-center gap-2" key={logObj}>
                <Input
                  id={logObj}
                  defaultValue={logObj}
                  setValue={(val: string) => {
                    const newLogCategories = [...logCategories];
                    newLogCategories[index] = val;
                    setLogCategories(newLogCategories);
                  }}
                  height={30}
                  width="100%"
                />
                <IconButton
                  icon={MdDelete}
                  className="w-7 h-7 rounded-full"
                  bgColor="transparent"
                  color={COLOR_THEME.DARK_GRAY}
                  onClick={() => {
                    const newLogCategories = [...logCategories];
                    newLogCategories.splice(index, 1);
                    setLogCategories(newLogCategories);
                  }}
                  size={18}
                  disabled={!user}
                  ariaLabel="카테고리 삭제하기"
                />
              </div>
            ))
          )}
        </div>
        <div className="flex items-end gap-2">
          <Input
            id={`add_logObj`}
            defaultValue={""}
            setValue={(val: string) => {
              newCategory = val;
            }}
            height={30}
            width="100%"
            title="카테고리 추가"
            placeholder="추가할 내용을 입력해주세요."
          />
          <IconButton
            icon={FaPlus}
            className="w-7 h-7 rounded-full"
            bgColor="transparent"
            color={COLOR_THEME.DARK_GRAY}
            onClick={() => {
              setLogCategories([...logCategories, newCategory]);
              newCategory = "";
            }}
            size={15}
            disabled={!user}
            ariaLabel="카테고리 추가하기"
          />
        </div>
        <div className="flex justify-end mt-2">
          <Button
            text="저장하기"
            onClick={() => {
              if (logCategories.length === 0) {
                setAlert("로그 카테고리를 최소 하나 이상 설정해주세요.");
                return;
              } else if (new Set(logCategories).size !== logCategories.length) {
                setAlert("중복된 로그 카테고리는 허용되지 않습니다.");
                return;
              }
              onUpdateMe({
                defaultLogObj: logCategories,
              });
            }}
            width={80}
            height={45}
            isLoading={!user}
          />
        </div>
      </div>
    </>
  );
}
