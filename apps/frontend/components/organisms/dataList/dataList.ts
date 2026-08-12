export type DataListItemType = {
  id: number;
  text: string;
  isDone?: boolean;
  isDisabled?: boolean;
  description?: string;
  children?: DataListItemType[];
  type?: "todo" | "section" | undefined;
};

export type UseDataListParams = {
  loading: boolean;
  defaultDataList: DataListItemType[];
  onSaveDataList: (val: DataListItemType[]) => void;
  onDataListChange?: ((val: DataListItemType[]) => void) | undefined;
  deferSave?: boolean;
  saveVersion?: number | undefined;
  storageKey?: string | undefined;
};

export const setTodoTreeDone = (
  item: DataListItemType,
  isDone: boolean,
): DataListItemType => {
  const nextItem = { ...item, isDone };
  if (item.children) {
    nextItem.children = item.children.map((child) => ({ ...child, isDone }));
  }
  return nextItem;
};

export const setChildTodoDone = (
  item: DataListItemType,
  childIndex: number,
  isDone: boolean,
): DataListItemType => {
  const children = (item.children ?? []).map((child, index) =>
    index === childIndex ? { ...child, isDone } : child,
  );
  return {
    ...item,
    isDone: children.length > 0 && children.every((child) => child.isDone),
    children,
  };
};
