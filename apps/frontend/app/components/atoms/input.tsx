import { useState } from "react";
import { GoAlert } from "react-icons/go";
import Text from "./Text";

const NUMBER_REG_EXP = /(?!^)-|[^0-9-]/g;

export const Input = ({
  id,
  value,
  setValue,
  label,
  title,
  placeholder,
  width = 250,
  height = 35,
  disabled = false,
  required = false,
  type = "text",
  icon,
  ...rest
}: {
  id: string;
  value?: string | number | undefined;
  setValue?:
    | React.Dispatch<React.SetStateAction<string>>
    | React.Dispatch<React.SetStateAction<number>>
    | ((value: string) => void);
  label?: string;
  title?: string;
  placeholder?: string;
  width?: number | string;
  height?: number | string;
  disabled?: boolean;
  required?: boolean;
  type?: string;
  icon?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) => {
  const onHandleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (type === "number") {
      event.target.value = Number(
        event.target.value.replace(NUMBER_REG_EXP, "")
      ).toString();
      if (rest?.min && Number(event.target.value) < (rest.min as number)) {
        event.target.value = String(rest.min);
      } else if (
        rest?.max &&
        Number(event.target.value) > (rest.max as number)
      ) {
        event.target.value = String(rest.max);
      }
    }
    if (setValue) {
      if (event.target.value.length > 100) return;
      setValue(event.target.value as string & number);
    }
  };
  const [isFocused, setIsFocused] = useState(false);
  return (
    <div
      className={`flex flex-col gap-1 rounded-sm text-xs relative`}
      onKeyDown={(evt) => {
        if (type === "number") {
          if (["e", "E", "+"].includes(evt.key)) {
            evt.preventDefault();
          }
        }
      }}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
      }}
    >
      {label && (
        <Text
          className={`absolute -top-2 left-1 z-10 flex items-center gap-1 bg-stone-100 px-1 text-stone-800 ${
            required ? "font-bold" : ""
          }`}
        >
          {label}
        </Text>
      )}
      {title && (
        <Text className={`flex items-center gap-1 pl-0.5 font-bold`}>
          {icon && icon}
          {title}
        </Text>
      )}
      <div
        className={`relative flex items-center overflow-hidden ${
          disabled ? "bg-stone-100 text-stone-500" : ""
        }`}
        style={{
          height: typeof height === "number" ? `${height}px` : height,
        }}
      >
        <input
          className={`peer h-full w-full border border-stone-300 bg-transparent outline-0 px-2 ${
            required && !value
              ? "focus:border-red-400"
              : "focus:border-stone-600"
          }`}
          {...rest}
          id={id}
          value={value}
          type={type || "string"}
          onCopy={(e) => {
            if (type === "password") {
              e.preventDefault();
            }
          }}
          placeholder={isFocused && required && !value ? "" : placeholder}
          disabled={disabled}
          required={required}
          onFocus={() => {
            if (required) {
              setIsFocused(true);
            }
          }}
          onChange={onHandleChange}
          onBlur={(event) => event.target.blur()}
        />
        {isFocused && required && !value && (
          <label
            htmlFor={id}
            className={`absolute bottom-1/2 left-2 flex translate-y-1/2 items-center gap-1 text-red-500 transition-[bottom] duration-300 peer-focus:-bottom-12 text-xs cursor-text`}
          >
            <GoAlert />
            {label
              ? `${label}은(는) 필수 입력사항입니다.`
              : title
                ? `${title}은(는) 필수 입력사항입니다.`
                : "필수 입력사항을 확인해주세요."}
          </label>
        )}
      </div>
    </div>
  );
};
