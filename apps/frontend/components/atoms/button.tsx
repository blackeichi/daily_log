import { useState } from "react";
import { ClipLoader } from "react-spinners";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  onClick: () => void;
  disabled?: boolean;
  contained?: boolean;
  isLoading?: boolean;
  circle?: boolean;
  width?: string | number;
  height?: string | number;
  fontSize?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
  icon?: React.ReactNode;
  type?: "button" | "submit" | "reset";
}

export default function Button({
  text,
  onClick,
  disabled = false,
  contained = true,
  isLoading = false,
  width = "fit-content",
  height = 45,
  borderRadius = "5px",
  style = {},
  icon,
  type = "button",
  ...rest
}: ButtonProps) {
  const [isTab, setIsTab] = useState<boolean>(false);
  return (
    <button
      {...rest}
      className={`flex cursor-pointer items-center justify-center outline-[3px] transition-all text-xs gap-2 ${
        contained
          ? "bg-stone-700 text-white hover:bg-stone-800"
          : "border border-stone-400 bg-white text-stone-800 hover:bg-stone-200"
      } ${
        isTab ? "outline-[rgba(0,0,0,0.2)]" : "outline-[rgba(0,0,0,0)]"
      } disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400`}
      type={type}
      disabled={disabled || isLoading}
      tabIndex={-1}
      onClick={!disabled && !isLoading ? onClick : undefined}
      onMouseDown={() => setIsTab(true)}
      onMouseUp={() => setIsTab(false)}
      onMouseLeave={() => setIsTab(false)}
      style={{
        ...style,
        ...(style?.backgroundColor
          ? {
              backgroundColor:
                disabled || isLoading ? "#e7e5e4" : style?.backgroundColor,
            }
          : {}),
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        borderRadius,
      }}
    >
      {isLoading ? (
        <ClipLoader
          size={12}
          aria-label="Loading Button"
          color={contained ? "white" : "black"}
        />
      ) : (
        <>
          {icon && icon}
          {text && text}
        </>
      )}
    </button>
  );
}
