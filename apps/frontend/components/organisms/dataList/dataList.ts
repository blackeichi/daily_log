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
