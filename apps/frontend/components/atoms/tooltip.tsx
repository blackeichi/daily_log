import { setHoverEvent } from "@/lib/utils/event";
import { useState } from "react";
import { createPortal } from "react-dom";

export default function Tooltip({
  tooltip,
  needIndex = false,
  children,
  className,
}: {
  tooltip?: string | string[];
  needIndex?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const [isHovered, setIsHovered] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [positionStyle, setPositionStyle] = useState("");
  return (
    <>
      <div
        className={className}
        {...(tooltip &&
          typeof window !== "undefined" &&
          setHoverEvent(setIsHovered, setPositionStyle))}
      >
        {children}
      </div>
      {isHovered.x !== 0 &&
        isHovered.y !== 0 &&
        tooltip &&
        createPortal(
          <div
            id="tooltip"
            className={`fixed z-[60] max-w-[45vw] min-w-20 max-h-[45vh] rounded-sm bg-[rgba(0,0,0,0.85)] p-2.5 text-xs sm:text-sm text-white ${positionStyle} flex flex-col flex-wrap gap-1 items-center`}
            style={{
              left: `${isHovered.x}px`,
              top: `${isHovered.y}px`,
              columnGap: "15px",
            }}
            onMouseLeave={() => {
              setIsHovered({ x: 0, y: 0 });
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
            }}
          >
            {Array.isArray(tooltip)
              ? tooltip.map((line, index) => (
                  <span key={index} className="flex items-center gap-1 w-fit">
                    {needIndex ? `${index + 1}. ` : ""}
                    {line}
                  </span>
                ))
              : tooltip}
          </div>,
          document.body,
        )}
    </>
  );
}
