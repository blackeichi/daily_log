import { useCallback, useEffect, useRef } from "react";
import { DEBOUNCE_DELAYS } from "@/constants/timing";

export function useDebounce() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const debounce = useCallback(
    (func: () => void, delay: number = DEBOUNCE_DELAYS.DEFAULT) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(func, delay);
    },
    [],
  );

  return debounce;
}
