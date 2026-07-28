import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MdDelete } from "react-icons/md";
import { IoIosMenu } from "react-icons/io";
import { FaLock, FaUnlock } from "react-icons/fa";
import { memo, useCallback, useMemo } from "react";
import { COLOR_THEME } from "@/constants/system";
import { DEBOUNCE_DELAYS } from "@/constants/timing";
import { useSetAtom } from "jotai";
import { confirmAtom } from "@/lib/atom";
import CheckBox from "@/components/atoms/checkBox";
import IconButton from "@/components/molecules/iconButton";
import { Input } from "@/components/atoms/input";
import { DataListItemType } from "./dataList";

function DataListItemComponent({
  title,
  item,
  index,
  isEditing,
  enableDrag = false,
  debounce,
  immediateTextChange = false,
  onChangeText,
  onDeleteItem,
  onToggleDisabled,
  onChangeDone,
  needCheckBox,
  needDisableButton,
  maxLength,
}: {
  title: string;
  item: DataListItemType;
  index: number;
  isEditing: boolean;
  enableDrag?: boolean;
  debounce: (func: () => void, delay: number) => void;
  immediateTextChange?: boolean;
  onChangeText: (index: number, text: string) => void;
  onDeleteItem: (index: number) => void;
  onToggleDisabled: (index: number) => void;
  onChangeDone: (index: number, isDone: boolean) => void;
  needCheckBox: boolean;
  needDisableButton: boolean;
  maxLength?: number | undefined;
}) {
  const setConfirmMgs = useSetAtom(confirmAtom);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: item.id,
      disabled: !enableDrag || !isEditing,
    });
  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
    }),
    [transform, transition],
  );
  const isSection = item?.type === "section";
  const dragEnabled = isEditing && enableDrag;

  const handleCheckboxChange = useCallback(
    (val: boolean) => {
      onChangeDone(index, val);
    },
    [index, onChangeDone],
  );

  const handleToggleDisabled = useCallback(() => {
    onToggleDisabled(index);
  }, [index, onToggleDisabled]);

  const handleInputChange = useCallback(
    (val: string) => {
      if (immediateTextChange) {
        onChangeText(index, val);
        return;
      }

      debounce(() => {
        onChangeText(index, val);
      }, DEBOUNCE_DELAYS.INPUT);
    },
    [debounce, immediateTextChange, index, onChangeText],
  );

  const handleDelete = useCallback(() => {
    setConfirmMgs({
      title: "항목 삭제",
      message: `"${item.text}" 를 삭제하시겠습니까?`,
      confirmEvent: () => {
        onDeleteItem(index);
      },
    });
  }, [item.text, index, onDeleteItem, setConfirmMgs]);

  return (
    <form
      ref={dragEnabled ? setNodeRef : undefined}
      style={dragEnabled ? style : undefined}
      {...(dragEnabled ? attributes : {})}
      className={`flex min-h-12 items-center shadow-xs shadow-stone-500 pl-3 pr-1 py-1 ${
        isSection ? "bg-stone-200 border-l-4 border-stone-600" : "bg-white"
      } ${item.isDisabled ? "opacity-60" : ""}`}
      onSubmit={(e) => e.preventDefault()}
    >
      {!isEditing && needCheckBox && !isSection && (
        <CheckBox
          id={item.id.toString()}
          value={item.isDone || false}
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
                : item.isDone
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
            disabled={!!item.isDisabled}
            placeholder={
              isSection
                ? "섹터 제목을 입력하세요."
                : `${title}을(를) 입력하세요.`
            }
            maxLength={maxLength ?? 300}
          />
        </div>
      )}
      {needDisableButton && !isEditing && !isSection && (
        <IconButton
          icon={item.isDisabled ? FaLock : FaUnlock}
          className="w-7 h-7 rounded-full ml-2"
          bgColor="transparent"
          color={item.isDisabled ? "#b91c1c" : COLOR_THEME.DARK_GRAY}
          onClick={handleToggleDisabled}
          size={15}
          tooltip={item.isDisabled ? "항목 활성화" : "항목 비활성화"}
          ariaLabel={item.isDisabled ? "항목 활성화" : "항목 비활성화"}
        />
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
            disabled={!!item.isDisabled}
            ariaLabel="항목 삭제"
          />
          <IoIosMenu
            size={22}
            className="w-7 cursor-grab touch-none"
            aria-label="항목 순서 변경"
            role="button"
            tabIndex={dragEnabled ? 0 : -1}
            {...(dragEnabled ? listeners : {})}
          />
        </div>
      )}
    </form>
  );
}

export const DataListItem = memo(DataListItemComponent);
