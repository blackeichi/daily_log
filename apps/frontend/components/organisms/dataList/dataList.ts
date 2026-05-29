export type DataListItemType = {
  id: number;
  text: string;
  isDone?: boolean;
  isDisabled?: boolean;
  type?: "todo" | "section" | undefined;
};

export type UseDataListParams = {
  loading: boolean;
  defaultDataList: DataListItemType[];
  onSaveDataList: (val: DataListItemType[]) => void;
  storageKey?: string | undefined;
};
