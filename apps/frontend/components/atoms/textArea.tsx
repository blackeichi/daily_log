export const TextArea = ({
  id,
  value,
  setValue,
  label,
  placeholder,
  width = 250,
  height = 100,
  disabled = false,
  required = false,
  onChange,
  defaultValue,
  maxLength,
}: {
  id?: string;
  value?: string | undefined;
  setValue?:
    | React.Dispatch<React.SetStateAction<string>>
    | ((value: string) => void);
  label?: string;
  placeholder?: string;
  width?: number | string;
  height?: number;
  disabled?: boolean;
  required?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  defaultValue?: string;
  maxLength?: number;
}) => {
  const onHandleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (setValue) {
      if (event.target.value.length > 200) return;
      setValue(event.target.value);
    }
  };
  return (
    <div
      className="flex gap-1 rounded-sm relative"
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: `${height}px`,
      }}
    >
      {label && (
        <div
          className={`absolute -top-2 left-1 z-20 flex items-center gap-1 bg-stone-100 px-1 text-xs ${
            disabled ? "text-stone-300" : "text-stone-800"
          } ${required ? "font-bold" : ""}`}
        >
          {label}
        </div>
      )}

      <textarea
        id={id}
        className={`z-10 w-full resize-none border border-stone-300 bg-transparent px-1.5 py-2.5 text-xs outline-0 focus:border-3 pr-2.5 ${
          required && !value ? "focus:border-red-500" : "focus:border-stone-600"
        }`}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        onChange={onChange || onHandleChange}
      />
    </div>
  );
};
