import { RiEdit2Fill } from "react-icons/ri";
import Title from "../../atoms/Title";
import { MdOutlineNoteAdd } from "react-icons/md";
import { useLog, useCreateLog, useUpdateLog } from "@/lib/hooks/useLog";
import { useMemo, useState } from "react";
import { GetLogDetail } from "@/types/data";
import { Input } from "../../atoms/input";
import DateInput from "../../atoms/dateInput";
import moment from "moment";
import { TextArea } from "../../atoms/textArea";
import { OkCancelBtns } from "../../molecules/okCancelBtns";
import { useAtomValue, useSetAtom } from "jotai";
import { errorAtom, userAtom } from "@/lib/atom";
import { MODAL_BOX } from "@/constants/styles";
import { ComponentLoader } from "../../atoms/componentLoader";

const ModifyLogModal = ({
  isEdit,
  id,
  onClose,
  callBack,
}: {
  isEdit: boolean;
  id?: number;
  onClose: () => void;
  callBack: (title?: string) => void;
}) => {
  const { data } = useLog(isEdit ? id : undefined);
  if (isEdit && !data) {
    return <div className="p-4">로딩중...</div>;
  }
  return (
    <ActualUI
      id={id}
      isEdit={isEdit}
      data={data ?? null}
      onClose={onClose}
      callBack={callBack}
    />
  );
};

const ActualUI = ({
  id,
  isEdit,
  data,
  onClose,
  callBack,
}: {
  id?: number | undefined;
  isEdit: boolean;
  data: GetLogDetail | null;
  onClose: () => void;
  callBack: (title?: string) => void;
}) => {
  const setError = useSetAtom(errorAtom);
  const createLogMutation = useCreateLog();
  const updateLogMutation = useUpdateLog(id);
  const createLoading = createLogMutation.isPending;
  const updateLoading = updateLogMutation.isPending;
  const onCreateLog = (logData: {
    title: string;
    todayLog: Record<string, string>;
    logDate: string;
  }) => {
    createLogMutation.mutate(logData, {
      onSuccess: () => {
        callBack(logData.title);
        onClose();
      },
    });
  };
  const onUpdateLog = (logData: {
    title: string;
    todayLog: Record<string, string>;
    logDate: string;
  }) => {
    updateLogMutation.mutate(logData, {
      onSuccess: () => {
        callBack(logData.title);
        onClose();
      },
    });
  };
  const [title, setTitle] = useState(data?.title || "");
  const [logDate, setLogDate] = useState(
    data?.logDate || moment().format("YYYY-MM-DD"),
  );
  const user = useAtomValue(userAtom);
  const [todayLog, setTodayLog] = useState(data?.todayLog || {});
  const ObjKeys = useMemo(
    () => [
      ...new Set([...(user?.defaultLogObj || []), ...Object.keys(todayLog)]),
    ],
    [user, todayLog],
  );
  return (
    <div className={MODAL_BOX}>
      <Title className="flex gap-2 items-center text-lg w-full py-2">
        {isEdit ? <RiEdit2Fill size={25} /> : <MdOutlineNoteAdd size={25} />}
        {isEdit ? "로그 수정하기" : "로그 추가하기"}
      </Title>
      <Input
        id="title"
        value={title}
        setValue={setTitle}
        width="100%"
        height={40}
        label="제목"
        required
      />
      <DateInput
        date={logDate}
        setDate={(date) => setLogDate(date)}
        width="100%"
        height={40}
        label="날짜"
        required
        disabled={isEdit}
      />
      {user ? (
        ObjKeys.map((objKey) => (
          <TextArea
            key={objKey}
            value={todayLog[objKey] || ""}
            setValue={(value: string) =>
              setTodayLog((prev) => ({
                ...prev,
                [objKey]: value,
              }))
            }
            width="100%"
            height={100}
            label={objKey}
          />
        ))
      ) : (
        <ComponentLoader />
      )}
      <OkCancelBtns
        onSubmit={() => {
          if (!title) {
            setError("제목을 입력해주세요.");
            return document.getElementById("title")?.focus();
          }
          if (isEdit && id) {
            onUpdateLog({
              title,
              logDate,
              todayLog,
            });
          } else {
            onCreateLog({
              title,
              logDate,
              todayLog,
            });
          }
        }}
        onCancel={onClose}
        submitText="저장"
        cancelText="닫기"
        className="my-2"
        isLoading={createLoading || updateLoading}
      />
    </div>
  );
};

export default ModifyLogModal;
