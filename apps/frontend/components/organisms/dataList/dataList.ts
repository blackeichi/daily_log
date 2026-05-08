export type DataListItemType = {
  id: number;
  text: string;
  isDone?: boolean;
  type?: "todo" | "section" | undefined;
};

export type UseDataListParams = {
  loading: boolean;
  defaultDataList: DataListItemType[];
  onSaveDataList: (val: DataListItemType[]) => void;
};
