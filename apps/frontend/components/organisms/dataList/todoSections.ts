import type { DataListItemType } from "./dataList";

export type TodoPlacement =
  | "current"
  | "start"
  | "end"
  | `section:${number}`;

export const getSections = (items: DataListItemType[]) =>
  items.filter((item) => item.type === "section");

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
) => {
  if (placement === "start") return 0;
  if (placement === "end") return items.length;

  const sectionId = getSectionId(placement);
  const sectionIndex = items.findIndex((item) => item.id === sectionId);
  return sectionIndex === -1 ? items.length : sectionBlockEnd(items, sectionIndex);
};

export const insertAtPlacement = (
  items: DataListItemType[],
  item: DataListItemType,
  placement: Exclude<TodoPlacement, "current">,
) => {
  const insertIndex = getInsertIndex(items, placement);
  return [...items.slice(0, insertIndex), item, ...items.slice(insertIndex)];
};

export const moveTodoToPlacement = (
  items: DataListItemType[],
  todoIndex: number,
  nextItem: DataListItemType,
  placement: TodoPlacement,
) => {
  if (placement === "current") {
    return items.map((item, index) => (index === todoIndex ? nextItem : item));
  }

  const withoutTodo = items.filter((_, index) => index !== todoIndex);
  return insertAtPlacement(withoutTodo, nextItem, placement);
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
