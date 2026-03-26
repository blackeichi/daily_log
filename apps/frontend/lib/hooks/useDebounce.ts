import { useRef } from "react";
import { DEBOUNCE_DELAYS } from "@/constants/timing";

export function useDebounce() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const debounce = (
    func: () => void,
    delay: number = DEBOUNCE_DELAYS.DEFAULT
  ) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(func, delay);
  };
  return debounce;
}
