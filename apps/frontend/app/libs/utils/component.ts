import { memo } from "react";

export function typedMemo<T>(
  component: T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  areEqual?: (prevProps: any, nextProps: any) => boolean,
): T {
  return memo(component as React.FC, areEqual) as T;
}
