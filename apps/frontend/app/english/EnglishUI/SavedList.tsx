import IconButton from "@/components/molecules/iconButton";
import { COLOR_THEME } from "@/constants/system";
import { confirmAtom } from "@/lib/atom";
import { localStorageUtilites } from "@/lib/utils/storage";
import { useSetAtom } from "jotai";
import { useState } from "react";
import { MdDelete } from "react-icons/md";

export default function SavedList() {
  const [list, setList] = useState<string[]>(
    localStorageUtilites.getSavedSentence()
  );
  const setConfirm = useSetAtom(confirmAtom);
  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4">
        저장된 문장들 ({list.length}/50)
      </h2>
      <div className="w-full flex flex-col gap-1">
        {list.map((sentence: string, index: number) => (
          <div
            key={index}
            className="w-full p-4 px-2 bg-white rounded-lg shadow-sm break-words flex items-center justify-between gap-2"
          >
            <div className="flex gap-0.5">
              <span>{index + 1}.</span>
              <span>{sentence}</span>
            </div>
            <IconButton
              icon={MdDelete}
              className="w-7 h-7 rounded-full"
              bgColor="transparent"
              color={COLOR_THEME.DARK_GRAY}
              onClick={() => {
                setConfirm({
                  title: "정말로 삭제하시겠습니까?",
                  message: "삭제한 문장은 복구할 수 없습니다.",
                  confirmEvent: () => {
                    const val = localStorageUtilites.removeSavedSentence(index);
                    setList(val);
                  },
                });
              }}
              size={18}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
