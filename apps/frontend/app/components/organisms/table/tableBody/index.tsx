import BodyRow from "./bodyRow";
import { TableBodyProps } from "@/app/types/tableT";
import { TABLE_BODY, TABLE_HEADER } from "@/app/constants/system";
import { LastRowComponent } from "./lastRowComponent";
import { typedMemo } from "@/app/libs/utils/component";
import { FixedSizeList } from "react-window";
import { useCallback, useRef, useEffect } from "react";
import AutoSizer from "react-virtualized-auto-sizer";

const ROW_HEIGHT = 44; // 각 행의 고정 높이 (픽셀)

function TableBody<T>({
  tableData,
  onClick,
  onDelete,
  rowUniqueKey,
  tableHeader,
  onDoubleClick,
  lastRow,
}: TableBodyProps<T>) {
  const listRef = useRef<FixedSizeList>(null);
  const outerRef = useRef<HTMLDivElement>(null);

  // 가로 스크롤 동기화 - 리스트의 외부 요소에 이벤트 리스너 추가
  useEffect(() => {
    const outerElement = outerRef.current;
    if (!outerElement) return;

    const handleScroll = () => {
      const header = document.getElementById(TABLE_HEADER);
      if (header) {
        header.scrollLeft = outerElement.scrollLeft;
      }
    };

    outerElement.addEventListener("scroll", handleScroll);
    return () => {
      outerElement.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // 각 행을 렌더링하는 컴포넌트
  const Row = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const isLastRowItem = lastRow && index === tableData.length;

      if (isLastRowItem) {
        return (
          <div style={style}>
            <LastRowComponent<T>
              rowUniqueKey={rowUniqueKey}
              row={lastRow}
              tableHeader={tableHeader}
              {...(onDelete && { onDelete })}
              {...(onDoubleClick && { onDoubleClick })}
            />
          </div>
        );
      }

      const rowData = tableData[index];
      return (
        <div style={style}>
          <BodyRow<T>
            key={(rowData as Record<string, string | number>)[rowUniqueKey]}
            rowUniqueKey={rowUniqueKey}
            index={index}
            row={rowData as Record<string, unknown>}
            tableHeader={tableHeader}
            {...(onClick && { onClick })}
            {...(onDelete && { onDelete })}
            {...(onDoubleClick && { onDoubleClick })}
          />
        </div>
      );
    },
    [
      tableData,
      rowUniqueKey,
      tableHeader,
      onClick,
      onDelete,
      onDoubleClick,
      lastRow,
    ],
  );

  const itemCount =
    tableData && tableData.length > 0
      ? tableData.length + (lastRow ? 1 : 0)
      : 0;

  return (
    <div className="w-full h-full relative overflow-hidden py-1">
      <div id={TABLE_BODY} className="overflow-hidden text-xs w-full h-full">
        {/* 
        화면에 표시되는 개수 = 컨테이너 높이 ÷ ROW_HEIGHT (44px)
        FixedSizeList에 overscanCount를 따로 지정하지 않았으므로, 1이 기본값. 
        즉, 실제 렌더링 = 화면에 보이는 개수 + 위 1개 + 아래 1개
        */}
        {tableData && tableData.length > 0 ? (
          <AutoSizer>
            {({ height, width }: { height: number; width: number }) => (
              <FixedSizeList
                ref={listRef}
                outerRef={outerRef}
                height={height}
                itemCount={itemCount}
                itemSize={ROW_HEIGHT}
                width={width}
                className="w-full"
              >
                {Row}
              </FixedSizeList>
            )}
          </AutoSizer>
        ) : (
          <div className="w-full h-11 flex items-center justify-center border-b border-b-stone-200">
            <div className="flex justify-center h-full px-1 gap-1 items-center">
              데이터가 없습니다.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const MemoizedTableBody = typedMemo(TableBody, (prevProps, nextProps) => {
  return (
    prevProps.tableData === nextProps.tableData &&
    prevProps.rowUniqueKey === nextProps.rowUniqueKey &&
    prevProps.tableHeader === nextProps.tableHeader
  );
});

export default MemoizedTableBody;
