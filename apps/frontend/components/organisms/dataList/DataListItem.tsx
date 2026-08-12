import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MdDelete, MdNotes } from "react-icons/md";
import { IoIosMenu } from "react-icons/io";
import { FaLock, FaUnlock } from "react-icons/fa";
import { memo, useCallback, useMemo, useState } from "react";
import { COLOR_THEME } from "@/constants/system";
import { DEBOUNCE_DELAYS } from "@/constants/timing";
import { useSetAtom } from "jotai";
import { confirmAtom } from "@/lib/atom";
import CheckBox from "@/components/atoms/checkBox";
import IconButton from "@/components/molecules/iconButton";
import { Input } from "@/components/atoms/input";
import { DataListItemType } from "./dataList";
import Overlay from "@/components/atoms/overlay";
import { TextArea } from "@/components/atoms/textArea";

const MAX_DESCRIPTION_LENGTH = 10000;
const MAX_SUB_TODOS = 50;

function TodoDetailsModal({
  item,
  isEditing,
  onClose,
  onSave,
}: {
  item: DataListItemType;
  isEditing: boolean;
  onClose: () => void;
  onSave: (item: DataListItemType) => void;
}) {
  const [description, setDescription] = useState(item.description ?? "");
  const [children, setChildren] = useState(item.children ?? []);
  const [newChild, setNewChild] = useState("");

  const updateChild = (childIndex: number, patch: Partial<DataListItemType>) => {
    setChildren((prev) =>
      prev.map((child, index) =>
        index === childIndex ? { ...child, ...patch } : child,
      ),
    );
  };

  const handleAddChild = () => {
    const text = newChild.trim();
    if (!text || children.length >= MAX_SUB_TODOS) return;
    setChildren((prev) => [
      ...prev,
      { id: Date.now(), text, isDone: false, type: "todo" },
    ]);
    setNewChild("");
  };

  const handleSave = () => {
    const nextItem = { ...item };
    const trimmedDescription = description.trim();

    if (trimmedDescription) nextItem.description = trimmedDescription;
    else delete nextItem.description;

    if (children.length > 0) nextItem.children = children;
    else delete nextItem.children;

    onSave(nextItem);
    onClose();
  };

  return (
    <Overlay
      isOpen
      onClick={onClose}
      ariaLabel={`${item.text} 상세`}
      style={{ width: "min(92vw, 640px)" }}
      zIndex={70}
    >
      <div className="flex max-h-[90vh] flex-col gap-4 bg-white p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 border-b border-stone-200 pb-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-stone-500">TODO 상세</p>
            <h2 className="break-words text-base font-semibold text-stone-900">
              {item.text}
            </h2>
          </div>
          <button
            type="button"
            className="shrink-0 rounded px-2 py-1 text-stone-500 hover:bg-stone-100"
            onClick={onClose}
            aria-label="팝업 닫기"
          >
            ✕
          </button>
        </div>

        <div className="flex min-h-0 flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-stone-700">설명</span>
            {isEditing && (
              <span className="text-[10px] text-stone-400">
                {description.length.toLocaleString()} / {MAX_DESCRIPTION_LENGTH.toLocaleString()}
              </span>
            )}
          </div>
          {isEditing ? (
            <TextArea
              value={description}
              setValue={setDescription}
              width="100%"
              height={180}
              maxLength={MAX_DESCRIPTION_LENGTH}
              placeholder="상세한 설명, 참고 링크, 메모 등을 입력하세요."
            />
          ) : (
            <p className="max-h-52 min-h-20 overflow-y-auto whitespace-pre-wrap break-words rounded-md bg-stone-50 p-3 text-sm leading-6 text-stone-700">
              {description || "등록된 설명이 없습니다."}
            </p>
          )}
        </div>

        <div className="flex min-h-0 flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-stone-700">하위 투두</span>
            <span className="text-[10px] text-stone-400">
              {children.length} / {MAX_SUB_TODOS}
            </span>
          </div>
          {isEditing && (
            <div className="flex gap-2">
              <input
                value={newChild}
                onChange={(event) => setNewChild(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleAddChild();
                  }
                }}
                maxLength={1000}
                disabled={children.length >= MAX_SUB_TODOS}
                className="min-w-0 flex-1 rounded border border-stone-300 px-3 py-2 outline-none focus:border-stone-600"
                placeholder="하위 투두를 입력하세요."
              />
              <button
                type="button"
                onClick={handleAddChild}
                disabled={!newChild.trim() || children.length >= MAX_SUB_TODOS}
                className="rounded bg-stone-700 px-3 py-2 text-white disabled:bg-stone-300"
              >
                추가
              </button>
            </div>
          )}
          <div className="max-h-56 space-y-2 overflow-y-auto">
            {children.length === 0 ? (
              <p className="rounded-md bg-stone-50 p-3 text-stone-400">하위 투두가 없습니다.</p>
            ) : (
              children.map((child, childIndex) => (
                <div key={child.id} className="rounded-md border border-stone-200 p-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={child.isDone ?? false}
                      disabled={isEditing}
                      onChange={(event) => {
                        const next = children.map((current, index) =>
                          index === childIndex
                            ? { ...current, isDone: event.target.checked }
                            : current,
                        );
                        setChildren(next);
                        onSave({ ...item, children: next });
                      }}
                      aria-label={`${child.text} 완료 여부`}
                    />
                    {isEditing ? (
                      <input
                        value={child.text}
                        onChange={(event) => updateChild(childIndex, { text: event.target.value })}
                        maxLength={1000}
                        className="min-w-0 flex-1 rounded border border-stone-300 px-2 py-1.5 outline-none focus:border-stone-600"
                      />
                    ) : (
                      <span className={`min-w-0 flex-1 break-words ${child.isDone ? "text-stone-400 line-through" : ""}`}>
                        {child.text}
                      </span>
                    )}
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => setChildren((prev) => prev.filter((_, index) => index !== childIndex))}
                        className="rounded p-1 text-stone-500 hover:bg-red-50 hover:text-red-700"
                        aria-label={`${child.text} 삭제`}
                      >
                        <MdDelete size={18} />
                      </button>
                    )}
                  </div>
                  {isEditing ? (
                    <textarea
                      value={child.description ?? ""}
                      onChange={(event) => updateChild(childIndex, { description: event.target.value })}
                      maxLength={MAX_DESCRIPTION_LENGTH}
                      rows={2}
                      className="mt-2 w-full resize-y rounded border border-stone-200 px-2 py-1.5 text-xs outline-none focus:border-stone-500"
                      placeholder="하위 투두 설명 (선택)"
                    />
                  ) : child.description ? (
                    <p className="mt-2 whitespace-pre-wrap break-words pl-6 text-xs leading-5 text-stone-500">
                      {child.description}
                    </p>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-stone-200 pt-3">
          <button type="button" onClick={onClose} className="rounded border border-stone-300 px-4 py-2">
            {isEditing ? "취소" : "닫기"}
          </button>
          {isEditing && (
            <button type="button" onClick={handleSave} className="rounded bg-stone-700 px-4 py-2 text-white">
              적용
            </button>
          )}
        </div>
      </div>
    </Overlay>
  );
}

function DataListItemComponent({
  title,
  item,
  index,
  isEditing,
  enableDrag = false,
  debounce,
  immediateTextChange = false,
  onChangeText,
  onUpdateItem,
  onDeleteItem,
  onToggleDisabled,
  onChangeDone,
  needCheckBox,
  needDisableButton,
  maxLength,
  enableTodoDetails = false,
}: {
  title: string;
  item: DataListItemType;
  index: number;
  isEditing: boolean;
  enableDrag?: boolean;
  debounce: (func: () => void, delay: number) => void;
  immediateTextChange?: boolean;
  onChangeText: (index: number, text: string) => void;
  onUpdateItem: (index: number, item: DataListItemType) => void;
  onDeleteItem: (index: number) => void;
  onToggleDisabled: (index: number) => void;
  onChangeDone: (index: number, isDone: boolean) => void;
  needCheckBox: boolean;
  needDisableButton: boolean;
  maxLength?: number | undefined;
  enableTodoDetails?: boolean;
}) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
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
        <button
          type="button"
          className={`flex flex-1 items-center gap-2 pl-2 text-left ${!isSection && enableTodoDetails ? "cursor-pointer hover:text-stone-600" : "cursor-default"}`}
          onClick={() => {
            if (!isSection && enableTodoDetails) setIsDetailsOpen(true);
          }}
        >
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
          {!isSection && enableTodoDetails && (item.description || item.children?.length) ? (
            <MdNotes className="shrink-0 text-stone-400" size={16} aria-hidden="true" />
          ) : null}
        </button>
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
          {enableTodoDetails && !isSection && (
            <IconButton
              icon={MdNotes}
              className="h-7 w-7 rounded-full"
              bgColor="transparent"
              color={COLOR_THEME.DARK_GRAY}
              onClick={() => setIsDetailsOpen(true)}
              size={18}
              ariaLabel="설명 및 하위 투두 편집"
            />
          )}
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
      {isDetailsOpen && !isSection && (
        <TodoDetailsModal
          item={item}
          isEditing={isEditing}
          onClose={() => setIsDetailsOpen(false)}
          onSave={(nextItem) => onUpdateItem(index, nextItem)}
        />
      )}
    </form>
  );
}

export const DataListItem = memo(DataListItemComponent);
