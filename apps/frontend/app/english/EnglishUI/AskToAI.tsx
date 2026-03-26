import { sendLangMessage } from "@/actions/server/chat";
import Button from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import Overlay from "@/components/atoms/overlay";
import { OkCancelBtns } from "@/components/molecules/okCancelBtns";
import { alertAtom, errorAtom } from "@/lib/atom";
import { localStorageUtilites } from "@/lib/utils/storage";
import { useSetAtom } from "jotai";
import { useEffect, useState, useTransition } from "react";
import { useIncrementAiCount } from "@/lib/hooks/useUser";

export default function AskToAI({ selectedType }: { selectedType: 0 | 1 | 2 }) {
  const incrementAiCountMutation = useIncrementAiCount();
  const setError = useSetAtom(errorAtom);
  const setAlert = useSetAtom(alertAtom);
  const [koreanInput, setKoreanInput] = useState<string>("");
  const [engInput, setEngInput] = useState<string>("");
  const [result, setResult] = useState("");
  const [isPending, startTransition] = useTransition();
  useEffect(() => {
    setKoreanInput("");
    setEngInput("");
  }, [selectedType]);
  const handleSend = () => {
    if (!koreanInput) {
      document.getElementById("korean-input")?.focus();
      return setError("한글 문장을 입력해주세요.");
    }
    if (selectedType === 0 && !engInput) {
      document.getElementById("eng-input")?.focus();
      return setError("영어로 작문한 문장을 입력해주세요.");
    }
    if (isPending) return;
    if (incrementAiCountMutation.isPending) return;
    incrementAiCountMutation.mutate(undefined, {
      onSuccess: () => {
        const message = engInput
          ? `한국어로 '${koreanInput}'를 내가 영어로 '${engInput}'이렇게 작문해봤어. 어때?`
          : `'${koreanInput}'를 영어로 번역해줘.`;
        startTransition(async () => {
          const res = await sendLangMessage(message);
          setResult(res ?? "응답이 없어요...");
        });
      },
    });
  };
  return (
    <div className="flex flex-col gap-3 w-full">
      <Input
        id="korean-input"
        value={koreanInput}
        setValue={setKoreanInput}
        label="한글 문장"
        width="100%"
        height={45}
        placeholder={
          selectedType === 0
            ? "영어로 작문할 문장을 입력해주세요."
            : "번역이 필요한 문장을 입력해주세요."
        }
      />
      {selectedType === 0 && (
        <Input
          id="eng-input"
          value={engInput}
          setValue={setEngInput}
          label="My English Sentence"
          width="100%"
          height={45}
          placeholder="영어로 작문을 해주세요."
        />
      )}
      <Button
        onClick={handleSend}
        text={
          isPending || incrementAiCountMutation.isPending
            ? "선생님이 대답하는 중..."
            : "AI 선생님 호출하기"
        }
        width="100%"
        disabled={isPending || incrementAiCountMutation.isPending}
      />
      {result && (
        <Overlay isOpen={true} onClick={() => setResult("")}>
          <div className="p-4 bg-white rounded-lg w-full max-w-[600px] text-center flex flex-col gap-4">
            <span className="text-4xl">🧑‍🏫 </span>
            <p className="mt-2">{result}</p>
            <OkCancelBtns
              className="mt-3 justify-center"
              cancelText="닫기"
              submitText="저장하기"
              onCancel={() => setResult("")}
              onSubmit={() => {
                localStorageUtilites.addSavedSentence(koreanInput + result);
                setAlert("문장이 저장되었어요.");
                setResult("");
              }}
            />
          </div>
        </Overlay>
      )}
    </div>
  );
}
