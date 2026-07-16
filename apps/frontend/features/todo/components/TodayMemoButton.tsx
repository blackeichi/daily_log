"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaRegStickyNote, FaStickyNote, FaTrash } from "react-icons/fa";
import Overlay from "@/components/atoms/overlay";
import Title from "@/components/atoms/Title";
import IconButton from "@/components/molecules/iconButton";
import { OkCancelBtns } from "@/components/molecules/okCancelBtns";
import { MODAL_BOX } from "@/constants/styles";

type QuickTodoItem = {
  id: string;
  text: string;
  isDone: boolean;
};

const STORAGE_KEY = "DAILY_LOG_TODO_TODAY_MEMO";
const MAX_ITEMS = 50;

function createItem(text = "", isDone = false): QuickTodoItem {
  return {
    id:
      globalThis.crypto?.randomUUID?.() ??
      `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    text,
    isDone,
  };
}

function parseStoredItems(value: string | null): QuickTodoItem[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.flatMap((item) => {
        if (
          typeof item !== "object" ||
          item === null ||
          !("text" in item) ||
          typeof item.text !== "string"
        ) {
          return [];
        }

        return [
          createItem(
            item.text,
            "isDone" in item && item.isDone === true,
          ),
        ];
      });
    }
  } catch {
    // Existing plain-text memos are migrated below.
  }

  return value
    .split(/\r?\n/)
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text) => createItem(text));
}

export function TodayMemoButton() {
  const [items, setItems] = useState<QuickTodoItem[]>([]);
  const [draftItems, setDraftItems] = useState<QuickTodoItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const inputRefs = useRef(new Map<string, HTMLInputElement>());

  const hasItems = items.length > 0;
  const hasCompletedItems = useMemo(
    () => draftItems.some((item) => item.isDone),
    [draftItems],
  );

  useEffect(() => {
    setItems(parseStoredItems(localStorage.getItem(STORAGE_KEY)));
  }, []);

  const openMemo = () => {
    setDraftItems(items.length ? items.map((item) => ({ ...item })) : [createItem()]);
    setIsOpen(true);
  };

  const closeMemo = () => {
    setDraftItems([]);
    setIsOpen(false);
  };

  const saveMemo = () => {
    const nextItems = draftItems
      .map((item) => ({ ...item, text: item.text.trim() }))
      .filter((item) => item.text.length > 0);

    if (nextItems.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }

    setItems(nextItems);
    setDraftItems([]);
    setIsOpen(false);
  };

  const updateItem = (id: string, text: string) => {
    setDraftItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, text } : item)),
    );
  };

  const toggleItem = (id: string) => {
    setDraftItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isDone: !item.isDone } : item,
      ),
    );
  };

  const addItemAfter = (index: number) => {
    if (draftItems.length >= MAX_ITEMS) return;

    const nextItem = createItem();
    setDraftItems((prev) => [
      ...prev.slice(0, index + 1),
      nextItem,
      ...prev.slice(index + 1),
    ]);
    requestAnimationFrame(() => inputRefs.current.get(nextItem.id)?.focus());
  };

  const removeCompletedItems = () => {
    setDraftItems((prev) => {
      const remainingItems = prev.filter((item) => !item.isDone);
      return remainingItems.length ? remainingItems : [createItem()];
    });
  };

  return (
    <>
      <IconButton
        icon={hasItems ? FaStickyNote : FaRegStickyNote}
        onClick={openMemo}
        bgColor="transparent"
        color={hasItems ? "#fde047" : "#ffffff"}
        size={17}
        className="h-8 w-8 rounded-full"
        tooltip={hasItems ? "빠른 할 일 수정" : "빠른 할 일 작성"}
        ariaLabel={hasItems ? "저장된 빠른 할 일 수정" : "빠른 할 일 작성"}
      />

      {isOpen &&
        createPortal(
          <Overlay onClick={closeMemo} ariaLabel="오늘의 빠른 할 일">
            <div className={MODAL_BOX}>
              <div className="flex w-full items-center justify-between gap-3 py-2">
                <Title className="flex min-w-0 items-center gap-2 text-lg">
                  {hasItems ? (
                    <FaStickyNote size={20} className="text-yellow-500" />
                  ) : (
                    <FaRegStickyNote size={20} />
                  )}
                  오늘의 빠른 할 일
                </Title>
                <button
                  type="button"
                  onClick={removeCompletedItems}
                  disabled={!hasCompletedItems}
                  className="flex h-9 shrink-0 items-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-xs text-stone-700 transition-colors hover:bg-stone-200 disabled:cursor-not-allowed disabled:text-stone-300 disabled:hover:bg-white"
                >
                  <FaTrash size={12} aria-hidden="true" />
                  완료 항목 삭제
                </button>
              </div>

              <div className="flex max-h-[55vh] min-h-52 w-full flex-col gap-2 overflow-y-auto rounded-md border border-stone-300 bg-white p-3">
                {draftItems.map((item, index) => (
                  <label
                    key={item.id}
                    className="flex min-h-10 w-full items-center gap-3 border-b border-stone-100 px-1 last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={item.isDone}
                      onChange={() => toggleItem(item.id)}
                      className="h-4 w-4 shrink-0 accent-stone-700"
                      aria-label={`${index + 1}번째 빠른 할 일 완료`}
                    />
                    <input
                      ref={(element) => {
                        if (element) inputRefs.current.set(item.id, element);
                        else inputRefs.current.delete(item.id);
                      }}
                      type="text"
                      value={item.text}
                      onChange={(event) => updateItem(item.id, event.target.value)}
                      onKeyDown={(event) => {
                        if (
                          event.key !== "Enter" ||
                          event.nativeEvent.isComposing
                        ) {
                          return;
                        }

                        event.preventDefault();
                        addItemAfter(index);
                      }}
                      maxLength={120}
                      autoFocus={index === 0}
                      className={`h-9 min-w-0 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-stone-400 ${
                        item.isDone ? "text-stone-400 line-through" : "text-stone-800"
                      }`}
                      placeholder={index === 0 ? "할 일 입력" : undefined}
                      aria-label={`${index + 1}번째 빠른 할 일`}
                    />
                  </label>
                ))}
              </div>

              <OkCancelBtns
                submitText="저장"
                cancelText="닫기"
                onSubmit={saveMemo}
                onCancel={closeMemo}
                className="my-2"
              />
            </div>
          </Overlay>,
          document.body,
        )}
    </>
  );
}
