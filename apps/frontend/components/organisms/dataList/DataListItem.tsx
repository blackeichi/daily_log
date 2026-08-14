import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  MdContentCopy,
  MdDelete,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdNotes,
} from "react-icons/md";
import { IoIosMenu } from "react-icons/io";
import { FaLock, FaUnlock } from "react-icons/fa";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useSetAtom } from "jotai";

import CheckBox from "@/components/atoms/checkBox";
import { Input } from "@/components/atoms/input";
import Overlay from "@/components/atoms/overlay";
import { TextArea } from "@/components/atoms/textArea";
import IconButton from "@/components/molecules/iconButton";
import { COLOR_THEME } from "@/constants/system";
import { DEBOUNCE_DELAYS } from "@/constants/timing";
import { confirmAtom, errorAtom } from "@/lib/atom";
import { DataListItemType, setChildTodoDone } from "./dataList";
import { type TodoPlacement } from "./todoSections";

const MAX_DESCRIPTION_LENGTH = 10000;
const MAX_SUB_TODOS = 50;

export function TodoDetailsModal({
  item,
  isEditing,
  onClose,
  onSave,
  onDelete,
  onCopy,
  placementOptions = [],
  sectionItemCounts = {},
  defaultPlacement = "current",
  allowTypeSelection = false,
}: {
  item: DataListItemType;
  isEditing: boolean;
  onClose: () => void;
  onSave: (
    item: DataListItemType,
    placement: TodoPlacement,
    sectionOrder?: number,
  ) => void;
  onDelete?: () => void;
  onCopy?: () => void;
  placementOptions?: { value: TodoPlacement; label: string }[];
  sectionItemCounts?: Record<number, number>;
  defaultPlacement?: TodoPlacement;
  allowTypeSelection?: boolean;
}) {
  const setError = useSetAtom(errorAtom);
  const setConfirm = useSetAtom(confirmAtom);
  const [text, setText] = useState(item.text);
  const [children, setChildren] = useState(item.children ?? []);
  const [description, setDescription] = useState(item.description ?? "");
  const [newChild, setNewChild] = useState("");
  const [itemType, setItemType] = useState<"todo" | "section">(
    item.type === "section" ? "section" : "todo",
  );
  const [placement, setPlacement] = useState<TodoPlacement>(defaultPlacement);
  const [sectionOrder, setSectionOrder] = useState<number | undefined>();
  const selectedSectionId = placement.startsWith("section:")
    ? Number(placement.slice("section:".length))
    : null;
  const selectedSectionItemCount =
    selectedSectionId === null ? 0 : (sectionItemCounts[selectedSectionId] ?? 0);

  useEffect(() => {
    if (selectedSectionId !== null) setSectionOrder(selectedSectionItemCount);
    else setSectionOrder(undefined);
  }, [selectedSectionId, selectedSectionItemCount]);

  const updateChild = (childIndex: number, patch: Partial<DataListItemType>) => {
    setChildren((previous) =>
      previous.map((child, index) =>
        index === childIndex ? { ...child, ...patch } : child,
      ),
    );
  };

  const moveChild = (childIndex: number, direction: -1 | 1) => {
    const nextIndex = childIndex + direction;
    if (nextIndex < 0 || nextIndex >= children.length) return;

    setChildren((previous) => {
      const nextChildren = [...previous];
      const [child] = nextChildren.splice(childIndex, 1);
      if (!child) return previous;
      nextChildren.splice(nextIndex, 0, child);
      return nextChildren;
    });
  };

  const handleAddChild = () => {
    const childText = newChild.trim();
    if (!childText || children.length >= MAX_SUB_TODOS) return;

    setChildren((previous) => [
      ...previous,
      { id: Date.now(), text: childText, isDone: false, type: "todo" },
    ]);
    setNewChild("");
  };

  const handleChildCheckboxChange = (childIndex: number, isDone: boolean) => {
    const nextItem = setChildTodoDone(
      { ...item, text, description, children },
      childIndex,
      isDone,
    );
    setChildren(nextItem.children ?? []);
    if (!isEditing) onSave(nextItem, "current");
  };

  const handleSave = () => {
    const trimmedText = text.trim();
    if (!trimmedText) {
      setError("투두 내용을 입력해주세요.");
      return;
    }

    const nextItem: DataListItemType = {
      ...item,
      text: trimmedText,
      type: itemType,
    };

    if (itemType === "section") {
      delete nextItem.isDone;
      delete nextItem.isDisabled;
      delete nextItem.description;
      delete nextItem.children;
      onSave(nextItem, placement);
      onClose();
      return;
    }

    nextItem.isDone =
      children.length > 0
        ? children.every((child) => child.isDone)
        : (item.isDone ?? false);
    const trimmedDescription = description.trim();

    if (trimmedDescription) nextItem.description = trimmedDescription;
    else delete nextItem.description;

    if (children.length > 0) nextItem.children = children;
    else delete nextItem.children;

    if (sectionOrder === undefined) onSave(nextItem, placement);
    else onSave(nextItem, placement, sectionOrder);
    onClose();
  };

  const handleDelete = () => {
    if (!onDelete) return;

    setConfirm({
      title: "투두 삭제",
      message: `"${item.text}"을(를) 삭제하시겠습니까?`,
      confirmEvent: () => {
        onDelete();
        onClose();
      },
    });
  };

  return (
    <Overlay
      isOpen
      onClick={onClose}
      ariaLabel={isEditing ? `${item.text || "새 투두"} 편집` : `${item.text} 상세`}
      style={{ width: "min(92vw, 640px)" }}
      zIndex={70}
    >
      <div className="flex max-h-[78dvh] flex-col overflow-hidden bg-white p-4 text-xs sm:p-5">
        <div className="shrink-0 border-b border-stone-200 pb-3">
          <div className="w-full">
            <p className="text-[11px] font-semibold text-stone-500">
              {itemType === "section"
                ? isEditing
                  ? "섹션 편집"
                  : "섹션 상세"
                : isEditing
                  ? "TODO 편집"
                  : "TODO 상세"}
            </p>
            {isEditing ? (
              <Input
                id={`todo-title-${item.id}`}
                value={text}
                setValue={setText}
                width="100%"
                maxLength={1000}
                placeholder={
                  itemType === "section" ? "섹션 제목을 입력하세요" : "투두를 입력하세요"
                }
                aria-label={itemType === "section" ? "섹션 제목" : "투두 내용"}
              />
            ) : (
              <h2 className="break-words text-sm font-semibold text-stone-900">
                {item.text}
              </h2>
            )}
          </div>
        </div>

        <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
        {isEditing && allowTypeSelection && (
          <div className="flex rounded-md border border-stone-300 bg-stone-50 p-1 text-xs">
            <button
              type="button"
              onClick={() => setItemType("todo")}
              className={`flex-1 rounded px-2 py-1 ${
                itemType === "todo" ? "bg-stone-700 text-white" : "text-stone-600"
              }`}
            >
              투두
            </button>
            <button
              type="button"
              onClick={() => setItemType("section")}
              className={`flex-1 rounded px-2 py-1 ${
                itemType === "section" ? "bg-stone-700 text-white" : "text-stone-600"
              }`}
            >
              섹션
            </button>
          </div>
        )}

        {isEditing && placementOptions.length > 0 && (
          <label className="flex flex-col gap-1 text-xs font-semibold text-stone-700">
            {itemType === "section" ? "섹션 위치" : "투두 위치"}
            <select
              value={placement}
              onChange={(event) => setPlacement(event.target.value as TodoPlacement)}
              className="rounded border border-stone-300 bg-white px-2 py-1 font-normal text-xs outline-none focus:border-stone-600"
              aria-label={itemType === "section" ? "섹션 위치" : "투두 위치"}
            >
              {placementOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        )}

        {isEditing && itemType === "todo" && selectedSectionId !== null && (
          <label className="flex flex-col gap-1 text-xs font-semibold text-stone-700">
            섹션 내 차수
            <select
              value={sectionOrder ?? selectedSectionItemCount}
              onChange={(event) => setSectionOrder(Number(event.target.value))}
              className="rounded border border-stone-300 bg-white px-2 py-1 font-normal text-xs outline-none focus:border-stone-600"
              aria-label="섹션 내 차수"
            >
              {Array.from(
                { length: selectedSectionItemCount + 1 },
                (_, index) => (
                  <option key={index} value={index}>
                    {index === selectedSectionItemCount
                      ? "섹션 맨 아래"
                      : `${index + 1}번째 앞`}
                  </option>
                ),
              )}
            </select>
          </label>
        )}

        {itemType === "todo" && <div className="flex min-h-0 flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-700">설명</span>
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
              height={120}
              maxLength={MAX_DESCRIPTION_LENGTH}
              placeholder="상세한 설명, 참고 링크, 메모 등을 입력하세요."
            />
          ) : (
            <p className="max-h-40 min-h-16 overflow-y-auto whitespace-pre-wrap break-words rounded-md bg-stone-50 p-3 text-xs leading-5 text-stone-700">
              {description || "등록된 설명이 없습니다."}
            </p>
          )}
        </div>}

        {itemType === "todo" && <div className="flex min-h-0 flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-700">하위 투두</span>
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
                className="min-w-0 flex-1 rounded border border-stone-300 px-2 py-1 text-xs outline-none focus:border-stone-600"
                placeholder="하위 투두를 입력하세요"
              />
              <button
                type="button"
                onClick={handleAddChild}
                disabled={!newChild.trim() || children.length >= MAX_SUB_TODOS}
                className="rounded bg-stone-700 px-2 py-1 text-xs text-white disabled:bg-stone-300"
              >
                추가
              </button>
            </div>
          )}
          <div className="space-y-2">
            {children.length === 0 ? (
              <p className="rounded-md bg-stone-50 p-3 text-xs text-stone-400">
                하위 투두가 없습니다.
              </p>
            ) : (
              children.map((child, childIndex) => (
                <div key={child.id} className="rounded-md border border-stone-200 p-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={child.isDone ?? false}
                      onChange={(event) =>
                        handleChildCheckboxChange(childIndex, event.target.checked)
                      }
                      aria-label={`${child.text} 완료 여부`}
                    />
                    {isEditing ? (
                      <input
                        value={child.text}
                        onChange={(event) =>
                          updateChild(childIndex, { text: event.target.value })
                        }
                        maxLength={1000}
                        className="min-w-0 flex-1 rounded border border-stone-300 px-2 py-1.5 text-xs outline-none focus:border-stone-600"
                        aria-label={`${child.text} 내용`}
                      />
                    ) : (
                      <span
                        className={`min-w-0 flex-1 break-words ${
                          child.isDone ? "text-stone-400 line-through" : ""
                        }`}
                      >
                        {child.text}
                      </span>
                    )}
                    {isEditing && (
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => moveChild(childIndex, -1)}
                          disabled={childIndex === 0}
                          className="rounded p-0.5 text-stone-500 hover:bg-stone-100 disabled:cursor-not-allowed disabled:text-stone-300"
                          aria-label={`${child.text} 위로 이동`}
                        >
                          <MdKeyboardArrowUp size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveChild(childIndex, 1)}
                          disabled={childIndex === children.length - 1}
                          className="rounded p-0.5 text-stone-500 hover:bg-stone-100 disabled:cursor-not-allowed disabled:text-stone-300"
                          aria-label={`${child.text} 아래로 이동`}
                        >
                          <MdKeyboardArrowDown size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setChildren((previous) =>
                              previous.filter((_, index) => index !== childIndex),
                            )
                          }
                          className="rounded p-0.5 text-stone-500 hover:bg-red-50 hover:text-red-700"
                          aria-label={`${child.text} 삭제`}
                        >
                          <MdDelete size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  {isEditing ? (
                    <textarea
                      value={child.description ?? ""}
                      onChange={(event) =>
                        updateChild(childIndex, { description: event.target.value })
                      }
                      maxLength={MAX_DESCRIPTION_LENGTH}
                      rows={2}
                      className="mt-2 w-full resize-y rounded border border-stone-200 px-2 py-1.5 text-xs outline-none focus:border-stone-500"
                      placeholder="하위 투두 설명 (선택)"
                      aria-label={`${child.text} 설명`}
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
        </div>}

        </div>

        <div className="mt-3 flex shrink-0 items-center justify-between gap-2 border-t border-stone-200 pt-3">
          <div className="flex shrink-0 gap-1">
            {isEditing && onCopy ? (
              <button
                type="button"
                onClick={() => {
                  onCopy();
                  onClose();
                }}
                className="flex items-center gap-1 rounded border border-stone-300 px-2 py-1 text-xs text-stone-700 hover:bg-stone-50"
              >
                <MdContentCopy size={14} aria-hidden="true" /> 복사하기
              </button>
            ) : null}
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                className="rounded border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
              >
                삭제하기
              </button>
            ) : null}
          </div>
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-stone-300 px-2 py-1 text-xs"
            >
              {isEditing ? "취소" : "닫기"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={handleSave}
                className="rounded bg-stone-700 px-2 py-1 text-xs text-white"
              >
                저장
              </button>
            )}
          </div>
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
  onSaveTodoItem,
  onCopyTodoItem,
  placementOptions,
  sectionItemCounts,
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
  onSaveTodoItem?: (
    index: number,
    item: DataListItemType,
    placement: TodoPlacement,
    sectionOrder?: number,
  ) => void;
  onCopyTodoItem?: (index: number) => void;
  placementOptions?: { value: TodoPlacement; label: string }[];
  sectionItemCounts?: Record<number, number>;
  needCheckBox: boolean;
  needDisableButton: boolean;
  maxLength?: number | undefined;
  enableTodoDetails?: boolean;
}) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const setConfirm = useSetAtom(confirmAtom);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.id,
    disabled: !enableDrag || !isEditing,
  });
  const style = useMemo(
    () => ({ transform: CSS.Transform.toString(transform), transition }),
    [transform, transition],
  );
  const isSection = item.type === "section";
  const dragEnabled = isEditing && enableDrag;
  const canModifyDetails = isSection || !item.isDisabled;

  const handleInputChange = useCallback(
    (value: string) => {
      if (immediateTextChange) {
        onChangeText(index, value);
        return;
      }
      debounce(() => onChangeText(index, value), DEBOUNCE_DELAYS.INPUT);
    },
    [debounce, immediateTextChange, index, onChangeText],
  );

  const handleDelete = useCallback(() => {
    setConfirm({
      title: "항목 삭제",
      message: `"${item.text}"을(를) 삭제하시겠습니까?`,
      confirmEvent: () => onDeleteItem(index),
    });
  }, [index, item.text, onDeleteItem, setConfirm]);

  return (
    <div
      ref={dragEnabled ? setNodeRef : undefined}
      style={dragEnabled ? style : undefined}
      {...(dragEnabled ? attributes : {})}
      className={`flex min-h-12 flex-wrap items-center px-3 py-1 shadow-xs shadow-stone-500 ${
        isSection
          ? "border-l-4 border-stone-600 bg-stone-200"
          : item.isDisabled
            ? "border-l-4 border-amber-500 bg-white"
            : "bg-white"
      }`}
    >
      {!isEditing && needCheckBox && !isSection && (
        <CheckBox
          id={item.id.toString()}
          value={item.isDone ?? false}
          setValue={(isDone) => onChangeDone(index, isDone)}
        />
      )}
      {!isEditing ? (
        <button
          type="button"
          className={`flex flex-1 items-center gap-2 pl-2 text-left ${
            !isSection && enableTodoDetails
              ? "cursor-pointer hover:text-stone-600"
              : "cursor-default"
          }`}
          onClick={() => {
            if (enableTodoDetails) setIsDetailsOpen(true);
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
          {!isSection && enableTodoDetails && item.description ? (
            <span className="ml-auto flex shrink-0 items-center gap-1 rounded-full bg-stone-200 px-2 py-0.5 text-[10px] font-semibold text-stone-700">
              <MdNotes size={12} aria-hidden="true" /> 설명
            </span>
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
            placeholder={isSection ? "섹션 제목을 입력하세요" : `${title}를 입력하세요`}
            maxLength={maxLength ?? 300}
          />
        </div>
      )}
      {needDisableButton && !isEditing && !isSection && (
        <IconButton
          icon={item.isDisabled ? FaLock : FaUnlock}
          className="ml-2 h-7 w-7 rounded-full"
          bgColor="transparent"
          color={COLOR_THEME.DARK_GRAY}
          onClick={() => onToggleDisabled(index)}
          size={15}
          tooltip={item.isDisabled ? "항목 활성화" : "항목 잠금"}
          ariaLabel={item.isDisabled ? "항목 활성화" : "항목 잠금"}
        />
      )}
      {isEditing && (
        <div className="z-10 ml-2 flex items-center gap-0.5">
          <IconButton
            icon={MdDelete}
            className="h-7 w-7 rounded-full"
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
      {!isEditing && !isSection && enableTodoDetails && item.children?.length ? (
        <div className="basis-full border-t border-stone-100 bg-stone-50 py-1 pl-10 pr-3">
          {item.children.map((child, childIndex) => (
            <div
              key={child.id}
              className="flex min-h-9 items-center gap-2 border-l-2 border-stone-300 px-3 py-1"
            >
              <CheckBox
                id={`${item.id}-${child.id}`}
                value={child.isDone ?? false}
                setValue={(isDone) =>
                  onUpdateItem(index, setChildTodoDone(item, childIndex, isDone))
                }
              />
              <button
                type="button"
                onClick={() => setIsDetailsOpen(true)}
                className={`min-w-0 flex-1 break-words text-left ${
                  child.isDone ? "text-stone-400 line-through" : "text-stone-700"
                }`}
              >
                {child.text}
              </button>
              {child.description ? (
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                  <MdNotes size={12} aria-hidden="true" /> 설명
                </span>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
      {isDetailsOpen && enableTodoDetails && (
        <TodoDetailsModal
          item={item}
          isEditing={canModifyDetails}
          onClose={() => setIsDetailsOpen(false)}
          onSave={(nextItem, placement, sectionOrder) =>
            onSaveTodoItem
              ? onSaveTodoItem(index, nextItem, placement, sectionOrder)
              : onUpdateItem(index, nextItem)
          }
          {...(canModifyDetails
            ? { onDelete: () => onDeleteItem(index) }
            : {})}
          {...(placementOptions
            ? {
                placementOptions: placementOptions.filter(
                  (option) => option.value !== `section:${item.id}`,
                ),
              }
            : {})}
          {...(sectionItemCounts ? { sectionItemCounts } : {})}
          {...(!isSection && canModifyDetails && onCopyTodoItem
            ? { onCopy: () => onCopyTodoItem(index) }
            : {})}
        />
      )}
    </div>
  );
}

export const DataListItem = memo(DataListItemComponent);
