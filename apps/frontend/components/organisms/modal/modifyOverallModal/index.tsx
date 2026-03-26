import {
  useOverall,
  useCreateOverall,
  useUpdateOverall,
} from "@/lib/hooks/useOverall";
import Button from "@/components/atoms/button";
import { TextArea } from "@/components/atoms/textArea";
import { OkCancelBtns } from "@/components/molecules/okCancelBtns";
import { MODAL_BOX } from "@/constants/styles";
import { confirmAtom } from "@/lib/atom";
import { GetOverallT, OverallCalendarData } from "@/types/data";
import { useSetAtom } from "jotai";
import { useCallback, useState } from "react";
import { GetAiAdvice } from "./getAiAdvice";
import { COLOR_THEME } from "@/constants/system";
import Title from "@/components/atoms/Title";

const emotionList = ["😄", "😊", "😐", "😭", "😡"];

const ModifyOverallModal = ({
  isEdit,
  date,
  onClose,
  callBack,
}: {
  isEdit: boolean;
  date: string;
  onClose: () => void;
  callBack: (val?: OverallCalendarData) => void;
}) => {
  const { data } = useOverall(isEdit ? date : undefined);
  if (isEdit && !data) {
    return <div className="p-4">로딩중...</div>;
  }
  return (
    <ActualUI
      data={data ?? null}
      date={date}
      onClose={onClose}
      callBack={callBack}
    />
  );
};

const ActualUI = ({
  data,
  date,
  onClose,
  callBack,
}: {
  data: GetOverallT | null;
  date: string;
  onClose: () => void;
  callBack: (val?: OverallCalendarData) => void;
}) => {
  const setConfirm = useSetAtom(confirmAtom);
  const [id, setId] = useState<number | undefined>(data?.id);
  const createOverallMutation = useCreateOverall();
  const updateOverallMutation = useUpdateOverall(id ?? 0);
  const loading =
    createOverallMutation.isPending || updateOverallMutation.isPending;
  const onModifyOverall = (
    overallData: {
      emotion: string;
      reviewDate: string;
      memo?: string;
      isGetAdvice?: boolean;
    },
    shouldClose = false,
  ) => {
    const mutation = id ? updateOverallMutation : createOverallMutation;
    mutation.mutate(overallData, {
      onSuccess: (res) => {
        callBack({ [date]: { emotion: overallData.emotion } });
        if (res?.id) setId(res.id);
        if (shouldClose) onClose();
      },
    });
  };
  const [emotion, setEmotion] = useState<string>(
    data?.emotion ?? emotionList[2] ?? "",
  );
  const [memo, setMemo] = useState(data?.memo ?? "");
  const [isGetAdvice, setIsGetAdvice] = useState(data?.isGetAdvice || false);
  const [toggleGetAdvice, setToggleGetAdvice] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const onGetAdvice = useCallback(
    (advice?: string) => {
      if (!advice) return;
      const memoWithAdvice = memo ? `${advice}\n${memo}` : advice;
      const saveData = () => {
        const trimmedMemo = memoWithAdvice.slice(0, 500);
        onModifyOverall({
          emotion,
          ...(trimmedMemo && { memo: trimmedMemo }),
          reviewDate: date,
          isGetAdvice: true,
        });
      };
      if (memoWithAdvice.length > 500) {
        setConfirm({
          title: "메모가 너무 길어요!",
          message:
            "AI 조언을 추가하면 메모가 500자를 초과해요. 확인을 누르면 초과된 부분은 삭제됩니다!",
          confirmEvent: saveData,
        });
      } else {
        saveData();
      }
      setMemo(memoWithAdvice);
      setIsGetAdvice(true);
      setIsPending(false);
    },
    [memo, emotion, date, onModifyOverall, setConfirm],
  );
  return (
    <div
      className={MODAL_BOX}
      style={{
        alignItems: "flex-start",
        gap: 20,
      }}
    >
      <div className="flex items-center justify-between w-full">
        <Title className="mt-2">🌛하루의 마무리</Title>
        {!isGetAdvice && (
          <>
            <Button
              text={toggleGetAdvice ? "AI 조언 생성중..." : "🤖 AI 조언 듣기"}
              onClick={() =>
                setConfirm({
                  title: "오늘 하루 잘 마무리하셨나요?",
                  message:
                    "AI가 생성한 조언이 메모에 추가됩니다. \n 로그에 적힌 내용을 참고하여 작성됩니다. 로그를 작성하지 않았다면 조언이 부적절할 수 있습니다. \n (날짜당 한 번만 신청할 수 있으니, 신중하게 선택해주세요!)",
                  confirmEvent: () => setToggleGetAdvice(true),
                })
              }
              isLoading={isPending || toggleGetAdvice}
              width={100}
              height={30}
              style={{
                backgroundColor: COLOR_THEME.BLUE_COLOR,
              }}
            />
            {toggleGetAdvice && (
              <GetAiAdvice
                date={date}
                setIsPending={setIsPending}
                onGetAdvice={onGetAdvice}
                setToggleGetAdvice={setToggleGetAdvice}
              />
            )}
          </>
        )}
      </div>
      <div className="w-full p-2 bg-white rounded-xl border border-stone-500">
        <span className="text-sm pl-1">오늘의 감정</span>
        <div className="flex gap-2 mb-3 mt-2">
          {emotionList.map((emo) => (
            <button
              key={emo}
              type="button"
              onClick={() => setEmotion(emo)}
              className={`text-2xl cursor-pointer hover:scale-110 ${
                emo === emotion ? "" : "opacity-30"
              }`}
            >
              {emo}
            </button>
          ))}
        </div>
      </div>
      <div className="w-full flex flex-col items-end">
        <TextArea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          label="MEMO"
          width="100%"
          height={170}
        />
        <span className="text-xs p-0.5">{memo.length}/500자</span>
      </div>
      <OkCancelBtns
        className="flex w-full justify-center my-2"
        submitText="저장"
        onSubmit={() => {
          if (memo.length > 500) {
            setConfirm({
              title: "메모가 너무 길어요!",
              message:
                "메모는 500자 이내로 작성해야 해요. 초과된 부분은 삭제 후 저장됩니다.",
              confirmEvent: () => {
                const trimmedMemo = memo.slice(0, 500);
                onModifyOverall(
                  {
                    emotion,
                    ...(trimmedMemo && { memo: trimmedMemo }),
                    reviewDate: date,
                    isGetAdvice,
                  },
                  true,
                );
              },
            });
            return;
          }
          const trimmedMemo = memo.slice(0, 500);
          onModifyOverall(
            {
              emotion,
              ...(trimmedMemo && { memo: trimmedMemo }),
              reviewDate: date,
              isGetAdvice,
            },
            true,
          );
        }}
        cancelText="닫기"
        onCancel={onClose}
        isLoading={loading || isPending || toggleGetAdvice}
      />
    </div>
  );
};

export default ModifyOverallModal;
