declare module "react-window" {
  import { Component, CSSProperties, ReactElement, Ref } from "react";

  export interface ListChildComponentProps {
    index: number;
    style: CSSProperties;
  }

  export interface FixedSizeListProps {
    children: (props: ListChildComponentProps) => ReactElement;
    className?: string;
    height: number;
    itemCount: number;
    itemSize: number;
    width: number | string;
    innerRef?: Ref<HTMLDivElement>;
    outerRef?: Ref<HTMLDivElement>;
    onScroll?: (props: {
      scrollOffset: number;
      scrollUpdateWasRequested: boolean;
    }) => void;
  }

  export class FixedSizeList extends Component<FixedSizeListProps> {
    scrollTo(scrollOffset: number): void;
    scrollToItem(
      index: number,
      align?: "auto" | "smart" | "center" | "end" | "start",
    ): void;
  }
}
