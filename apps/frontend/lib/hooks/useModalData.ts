import { useEffect } from "react";

export function useModalData<T>(
  isEdit: boolean,
  id: string | number | undefined,
  data: T | null,
  onGetData: () => void,
): boolean {
  useEffect(() => {
    if (isEdit && id) {
      onGetData();
    }
  }, [id, isEdit, onGetData]);

  return isEdit && !data;
}
