import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MdDelete } from "react-icons/md";
import { IoIosMenu } from "react-icons/io";
import { useCallback, useEffect, useMemo, useState } from "react";
import { COLOR_THEME } from "@/constants/system";
import { DEBOUNCE_DELAYS } from "@/constants/timing";
import { useSetAtom } from "jotai";
import { confirmAtom } from "@/lib/atom";
import CheckBox from "@/components/atoms/checkBox";
import IconButton from "@/components/molecules/iconButton";
import { Input } from "@/components/atoms/input";

export type DataListItem = {
  id: number;
  text: string;
  isDone?: boolean;
  type?: "todo" | "section" | undefined;
};

export function DataListItem({
  title,
  item,
  index,
  dataList,
  setDataList,
  isEditing,
  enableDrag = false,
  debounce,
  onSaveDataList,
  needCheckBox,
}: {
  title: string;
  item: DataListItem;
  index: number;
  dataList: DataListItem[];
  setDataList: (val: DataListItem[], delay?: number) => void;
  isEditing: boolean;
  enableDrag?: boolean;
  debounce: (func: () => void, delay: number) => void;
  onSaveDataList: (val: DataListItem[]) => void;
  needCheckBox: boolean;
}) {
  const setConfirmMgs = useSetAtom(confirmAtom);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });
  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
    }),
    [transform, transition],
  );
  const [checked, setChecked] = useState(item.isDone || false);
  const [isDone, setIsDone] = useState(item.isDone || false);
  const isSection = item?.type === "section";
  const dragEnabled = isEditing && enableDrag;

  const handleCheckboxChange = useCallback((val: boolean) => {
    setChecked(val);
    setIsDone(val);
  }, []);

  const handleInputChange = useCallback(
    (val: string) => {
      const newList = [...dataList];
      if (newList[index]) {
        newList[index].text = val;
        debounce(() => {
          setDataList(newList);
        }, DEBOUNCE_DELAYS.INPUT);
      }
    },
    [dataList, index, debounce, setDataList],
  );

  const handleDelete = useCallback(() => {
    setConfirmMgs({
      title: "항목 삭제",
      message: `"${item.text}" 를 삭제하시겠습니까?`,
      confirmEvent: () => {
        const newList = [...dataList];
        newList.splice(index, 1);
        setDataList(newList, 0);
      },
    });
  }, [item.text, dataList, index, setDataList, setConfirmMgs]);

  useEffect(() => {
    if (!isSection && needCheckBox && isDone !== item.isDone) {
      const newList = [...dataList];
      if (newList[index]) {
        newList[index].isDone = isDone;
        setDataList(newList);
        debounce(() => {
          onSaveDataList(newList);
        }, DEBOUNCE_DELAYS.CHECKBOX);
      }
    }
  }, [
    isDone,
    needCheckBox,
    isSection,
    item.isDone,
    dataList,
    index,
    setDataList,
    debounce,
    onSaveDataList,
  ]);

  return (
    <form
      ref={dragEnabled ? setNodeRef : undefined}
      style={dragEnabled ? style : undefined}
      {...(dragEnabled ? attributes : {})}
      className={`flex min-h-12 items-center shadow-xs shadow-stone-500 pl-3 pr-1 py-1 ${
        isSection ? "bg-stone-200 border-l-4 border-stone-600" : "bg-white"
      }`}
      onSubmit={(e) => e.preventDefault()}
    >
      {!isEditing && needCheckBox && !isSection && (
        <CheckBox
          id={item.id.toString()}
          value={checked}
          setValue={handleCheckboxChange}
        />
      )}
      {!isEditing ? (
        <div className="flex-1 pl-2 flex items-center gap-2">
          {isSection && (
            <span className="rounded-full bg-stone-700 px-2 py-0.5 text-[10px] font-semibold text-white">
              SECTION
            </span>
          )}
          <span
            className={
              isSection
                ? "font-semibold tracking-wide text-stone-800"
                : checked
                  ? "line-through"
                  : ""
            }
          >
            {item.text}
          </span>
        </div>
      ) : (
        <div className="flex-1">
          <Input
            id={`edit-newData-${item.id}`}
            defaultValue={item.text}
            setValue={handleInputChange}
            width="100%"
            placeholder={
              isSection
                ? "섹터 제목을 입력하세요."
                : `${title}을(를) 입력하세요.`
            }
            maxLength={200}
          />
        </div>
      )}
      {isEditing && (
        <div className="flex gap-0.5 z-10 items-center ml-2">
          <IconButton
            icon={MdDelete}
            className="w-7 h-7 rounded-full"
            bgColor="transparent"
            color={COLOR_THEME.DARK_GRAY}
            onClick={handleDelete}
            size={18}
          />
          <IoIosMenu
            size={22}
            className="cursor-grab w-7 touch-none"
            {...(dragEnabled ? listeners : {})}
          />
        </div>
      )}
    </form>
  );
}
