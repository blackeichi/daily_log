import Tooltip from "../../../../../atoms/tooltip";

export default function TooltipData({
  row,
  property,
  className,
  onClick,
}: {
  row: Record<string, unknown>;
  property: { id: string };
  className?: string;
  onClick?: () => void;
}) {
  const isString = typeof row[property.id] === "string";
  const tooltipText = isString
    ? (row[property.id] as string)?.split("\n")
    : (row[property.id] as string[]);
  const tooltipContent = isString
    ? row[property.id]
    : (tooltipText as string[]).join(", ");
  return (
    <Tooltip
      tooltip={tooltipText}
      className="flex items-center h-full overflow-hidden select-none"
    >
      <span
        className={`p-1 w-full text-nowrap text-ellipsis fit-content overflow-hidden rounded-lg transition-[background-color] ${className} ${
          onClick ? "hover:bg-[rgba(0,0,0,0.2)]" : ""
        }`}
        onClick={onClick}
      >
        {tooltipContent as string}
      </span>
    </Tooltip>
  );
}
