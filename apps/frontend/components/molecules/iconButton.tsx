import type { IconType } from "react-icons";
import { COLOR_THEME } from "@/constants/system";
import Tooltip from "../atoms/tooltip";

export default function IconButton({
  icon,
  text,
  size = 16,
  color = "white",
  onClick,
  tooltip = "",
  disabled = false,
  className = "",
  bgColor,
  type = "button",
  ariaLabel = "",
}: {
  icon?: IconType;
  text?: string;
  size?: number;
  color?: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  tooltip?: string;
  disabled?: boolean;
  className?: string;
  bgColor?: string;
  type?: "button" | "submit" | "reset";
  ariaLabel?: string;
}) {
  const accessibleLabel = ariaLabel || tooltip || text;

  return (
    <Tooltip tooltip={tooltip} className="w-fit">
      <button
        className={`flex scale-100 items-center transition-all duration-75 justify-center border-0 outline-stone-500 border-[rgba(255,255,255,0.8)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-stone-500 ${
          disabled
            ? "cursor-default"
            : `cursor-pointer hover:border-2 hover:outline`
        } ${className}`}
        onClick={disabled ? undefined : onClick}
        type={type}
        disabled={disabled}
        aria-disabled={disabled}
        aria-label={accessibleLabel}
        style={{
          backgroundColor: disabled
            ? "lightGray"
            : (bgColor ?? COLOR_THEME.DARK_GRAY),
          color: color,
        }}
      >
        {icon && <span aria-hidden="true">{icon({ size })}</span>} {text}
      </button>
    </Tooltip>
  );
}
