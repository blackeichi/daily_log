import { Location } from "@/app/types/system";

export function setHoverEvent(
  setIsHovered: React.Dispatch<React.SetStateAction<Location>>,
  setPositionStyle: React.Dispatch<React.SetStateAction<string>>
) {
  const width = window.innerWidth;
  return {
    ...(width < 640
      ? {
          onTouchStart: (event: React.TouchEvent<HTMLDivElement>) => {
            event.stopPropagation();
            const rect = event.currentTarget.getBoundingClientRect();
            const xStyle =
              rect.x >= window.innerWidth / 2 ? "-translate-x-full " : "";
            const yStyle =
              rect.y >= window.innerHeight / 2 ? "-translate-y-full" : "";
            setPositionStyle(xStyle + yStyle);
            setIsHovered({
              x:
                rect.x >= window.innerWidth / 2
                  ? rect.x
                  : rect.x + rect.width / 5,
              y:
                rect.y >= window.innerHeight / 2
                  ? rect.y
                  : rect.y + rect.height + 5,
            });
          },
          onTouchEnd: () => {
            setIsHovered({ x: 0, y: 0 });
          },
        }
      : {
          onMouseEnter: (event: React.MouseEvent<HTMLDivElement>) => {
            event.stopPropagation();
            const rect = event.currentTarget.getBoundingClientRect();
            const xStyle =
              rect.x >= window.innerWidth / 2 ? "-translate-x-full " : "";
            const yStyle =
              rect.y >= window.innerHeight / 2 ? "-translate-y-full" : "";
            setPositionStyle(xStyle + yStyle);
            setIsHovered({
              x:
                rect.x >= window.innerWidth / 2
                  ? rect.x
                  : rect.x + rect.width / 5,
              y:
                rect.y >= window.innerHeight / 2
                  ? rect.y
                  : rect.y + rect.height + 5,
            });
          },
          onMouseLeave: () => {
            setIsHovered({ x: 0, y: 0 });
          },
        }),
  };
}
