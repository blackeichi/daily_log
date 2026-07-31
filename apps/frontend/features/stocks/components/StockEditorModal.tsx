"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useMemo, useState, type FormEvent } from "react";
import { useSetAtom } from "jotai";
import { MdAdd, MdCheck, MdClose, MdSearch } from "react-icons/md";
import Button from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import Overlay from "@/components/atoms/overlay";
import { alertAtom, errorAtom } from "@/lib/atom";
import { useStockSearch, useUpdateStockWatchlist } from "@/lib/hooks/useStocks";
import type { StockSearchResult, StockWatchlistItem } from "@/types/api";
import { SortableStockItem } from "./SortableStockItem";

const MAX_WATCHLIST_ITEMS = 30;

export default function StockEditorModal({
  initialItems,
  onClose,
}: {
  initialItems: StockWatchlistItem[];
  onClose: () => void;
}) {
  const setAlert = useSetAtom(alertAtom);
  const setError = useSetAtom(errorAtom);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [items, setItems] = useState<StockSearchResult[]>(
    initialItems.map(({ symbol, name, market }) => ({
      symbol,
      name,
      market: market as StockSearchResult["market"],
    })),
  );
  const { data: searchResults = [], isFetching } =
    useStockSearch(submittedQuery);
  const updateWatchlist = useUpdateStockWatchlist();
  const selectedSymbols = useMemo(
    () => new Set(items.map((item) => item.symbol)),
    [items],
  );
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const hasSubmittedSearch = submittedQuery.length > 0;

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedQuery(query.trim());
  };

  const handleAdd = (item: StockSearchResult) => {
    if (
      selectedSymbols.has(item.symbol) ||
      items.length >= MAX_WATCHLIST_ITEMS
    ) {
      return;
    }
    setItems((current) => [...current, item]);
  };

  const handleRemove = (symbol: string) => {
    setItems((current) => current.filter((item) => item.symbol !== symbol));
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    setItems((current) => {
      const oldIndex = current.findIndex((item) => item.symbol === active.id);
      const newIndex = current.findIndex((item) => item.symbol === over.id);
      if (oldIndex < 0 || newIndex < 0) return current;
      return arrayMove(current, oldIndex, newIndex);
    });
  };

  const handleSave = () => {
    updateWatchlist.mutate(
      { symbols: items.map((item) => item.symbol) },
      {
        onSuccess: () => {
          setAlert("관심 종목을 저장했습니다.");
          onClose();
        },
        onError: (error) => {
          setError(
            error instanceof Error
              ? error.message
              : "관심 종목을 저장하지 못했습니다.",
          );
        },
      },
    );
  };

  return (
    <Overlay
      isOpen
      onClick={onClose}
      ariaLabel="관심 종목 편집"
      style={{
        width: "min(720px, calc(100vw - 24px))",
        padding: 0,
      }}
    >
      <div className="flex max-h-[90vh] flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-stone-300 px-4">
          <div>
            <h2 className="text-base font-semibold text-stone-900">
              관심 종목 편집
            </h2>
            <p className="text-xs text-stone-500">
              선택 {items.length}/{MAX_WATCHLIST_ITEMS}
            </p>
          </div>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center text-stone-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-stone-500"
            onClick={onClose}
            aria-label="닫기"
          >
            <MdClose size={22} aria-hidden="true" />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
          <section className="flex flex-col gap-2">
            <form className="flex items-center gap-2" onSubmit={handleSearch}>
              <Input
                id="stock-search"
                value={query}
                setValue={setQuery}
                width="100%"
                placeholder="종목명 또는 6자리 종목 코드"
                maxLength={40}
              />
              <button
                type="submit"
                className="flex h-[35px] shrink-0 items-center gap-1 border border-stone-700 bg-stone-800 px-3 text-xs font-semibold text-white hover:bg-stone-700 disabled:cursor-not-allowed disabled:border-stone-300 disabled:bg-stone-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500"
                disabled={!query.trim() || isFetching}
              >
                <MdSearch size={18} aria-hidden="true" />
                검색
              </button>
            </form>

            {hasSubmittedSearch && (
              <div className="max-h-44 overflow-y-auto border border-stone-300 bg-white">
                {isFetching ? (
                  <p className="px-3 py-5 text-center text-xs text-stone-500">
                    검색 중입니다.
                  </p>
                ) : searchResults.length > 0 ? (
                  searchResults.map((result) => {
                    const isSelected = selectedSymbols.has(result.symbol);
                    return (
                      <div
                        key={result.symbol}
                        className="flex min-h-11 items-center border-b border-stone-200 px-3 last:border-b-0"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {result.name}
                          </p>
                          <p className="text-xs text-stone-500">
                            {result.symbol} · {result.market}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="flex h-9 w-9 shrink-0 items-center justify-center text-stone-700 disabled:text-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-stone-500"
                          onClick={() => handleAdd(result)}
                          disabled={
                            isSelected || items.length >= MAX_WATCHLIST_ITEMS
                          }
                          aria-label={
                            isSelected
                              ? `${result.name} 추가됨`
                              : `${result.name} 추가`
                          }
                        >
                          {isSelected ? (
                            <MdCheck size={19} aria-hidden="true" />
                          ) : (
                            <MdAdd size={20} aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <p className="px-3 py-5 text-center text-xs text-stone-500">
                    검색 결과가 없습니다.
                  </p>
                )}
              </div>
            )}
          </section>

          <section className="min-h-0">
            <h3 className="mb-2 text-xs font-semibold text-stone-600">
              표시 순서
            </h3>
            {items.length > 0 ? (
              <div className="overflow-hidden border border-stone-300">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={items.map((item) => item.symbol)}
                    strategy={verticalListSortingStrategy}
                  >
                    {items.map((item) => (
                      <SortableStockItem
                        key={item.symbol}
                        item={item}
                        onRemove={handleRemove}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            ) : (
              <div className="flex min-h-24 items-center justify-center border border-dashed border-stone-300 text-xs text-stone-500">
                표시할 종목을 검색해 추가해주세요.
              </div>
            )}
          </section>
        </div>

        <footer className="flex shrink-0 justify-end gap-2 border-t border-stone-300 p-3">
          <Button
            text="취소"
            contained={false}
            onClick={onClose}
            height={38}
            width={80}
          />
          <Button
            text="저장"
            onClick={handleSave}
            isLoading={updateWatchlist.isPending}
            height={38}
            width={90}
          />
        </footer>
      </div>
    </Overlay>
  );
}
