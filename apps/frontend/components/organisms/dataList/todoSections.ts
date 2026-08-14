import type { DataListItemType } from "./dataList";

export type TodoPlacement =
  | "current"
  | "start"
  | "end"
  | `section:${number}`;

export const getSections = (items: DataListItemType[]) =>
  items.filter((item) => item.type === "section");

export const getSectionTodos = (
  items: DataListItemType[],
  sectionId: number,
) => {
  const sectionIndex = items.findIndex((item) => item.id === sectionId);
  if (sectionIndex === -1 || items[sectionIndex]?.type !== "section") {
    return [];
  }

  return items.slice(sectionIndex + 1, sectionBlockEnd(items, sectionIndex));
};

const sectionBlockEnd = (items: DataListItemType[], sectionIndex: number) => {
  const nextSectionIndex = items.findIndex(
    (item, index) => index > sectionIndex && item.type === "section",
  );
  return nextSectionIndex === -1 ? items.length : nextSectionIndex;
};

const getSectionId = (placement: TodoPlacement) => {
  if (!placement.startsWith("section:")) return null;
  const id = Number(placement.slice("section:".length));
  return Number.isFinite(id) ? id : null;
};

const getInsertIndex = (
  items: DataListItemType[],
  placement: Exclude<TodoPlacement, "current">,
  sectionOrder?: number,
) => {
  if (placement === "start") return 0;
  if (placement === "end") return items.length;

  const sectionId = getSectionId(placement);
  const sectionIndex = items.findIndex((item) => item.id === sectionId);
  if (sectionIndex === -1) return items.length;

  const sectionEnd = sectionBlockEnd(items, sectionIndex);
  if (sectionOrder === undefined) return sectionEnd;

  return Math.min(
    sectionIndex + 1 + Math.max(0, sectionOrder),
    sectionEnd,
  );
};

export const insertAtPlacement = (
  items: DataListItemType[],
  item: DataListItemType,
  placement: Exclude<TodoPlacement, "current">,
  sectionOrder?: number,
) => {
  const insertIndex = getInsertIndex(items, placement, sectionOrder);
  return [...items.slice(0, insertIndex), item, ...items.slice(insertIndex)];
};

export const moveTodoToPlacement = (
  items: DataListItemType[],
  todoIndex: number,
  nextItem: DataListItemType,
  placement: TodoPlacement,
  sectionOrder?: number,
) => {
  if (placement === "current") {
    return items.map((item, index) => (index === todoIndex ? nextItem : item));
  }

  const withoutTodo = items.filter((_, index) => index !== todoIndex);
  return insertAtPlacement(withoutTodo, nextItem, placement, sectionOrder);
};

export const moveSectionToPlacement = (
  items: DataListItemType[],
  sectionIndex: number,
  nextSection: DataListItemType,
  placement: TodoPlacement,
) => {
  if (placement === "current") {
    return items.map((item, index) =>
      index === sectionIndex ? nextSection : item,
    );
  }

  const blockEnd = sectionBlockEnd(items, sectionIndex);
  const sectionBlock = [nextSection, ...items.slice(sectionIndex + 1, blockEnd)];
  const withoutBlock = [
    ...items.slice(0, sectionIndex),
    ...items.slice(blockEnd),
  ];

  return insertAtPlacement(withoutBlock, nextSection, placement).flatMap(
    (item) => (item === nextSection ? sectionBlock : [item]),
  );
};

export const cloneTodoItem = (item: DataListItemType): DataListItemType => {
  const nextId = () => Date.now() + Math.floor(Math.random() * 1_000_000);
  const clonedItem: DataListItemType = {
    ...item,
    id: nextId(),
  };

  if (item.children) {
    clonedItem.children = item.children.map((child) => ({
      ...child,
      id: nextId(),
    }));
  }

  return clonedItem;
};
