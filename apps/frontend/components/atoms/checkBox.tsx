import { memo } from "react";

function CheckBox({
  id,
  value,
  setValue,
  disabled = false,
  children,
}: {
  id: string;
  value: boolean;
  setValue: (value: boolean) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex w-fit cursor-pointer items-center pl-0.5 text-xs text-gray-800 select-none">
      {/* Check Box */}
      <input
        type="checkbox"
        onChange={(event) => {
          setValue(event.target.checked);
        }}
        id={id}
        disabled={disabled}
        checked={value}
        className="cursor-pointer"
      />
      {children && (
        <label
          htmlFor={id}
          className={`h-full cursor-pointer pl-2.5 ${
            disabled ? "text-gray-400" : ""
          }`}
        >
          {children}
        </label>
      )}
    </div>
  );
}

export default memo(CheckBox, (prevProps, nextProps) => {
  return (
    prevProps.value === nextProps.value &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.id === nextProps.id
  );
});
