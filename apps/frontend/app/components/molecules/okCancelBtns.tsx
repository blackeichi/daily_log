import { FaSave } from "react-icons/fa";
import { GiCancel } from "react-icons/gi";
import Button from "../atoms/button";

export const OkCancelBtns = ({
  submitText,
  cancelText,
  onSubmit,
  onCancel,
  disabled = false,
  isLoading = false,
  className = "",
  submitIcon,
  width = 120,
  height = 35,
}: {
  submitText: string;
  cancelText: string;
  onSubmit: () => void;
  onCancel: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  submitIcon?: React.ReactNode;
  width?: number;
  height?: number;
}) => {
  return (
    <div className={`flex gap-1 ${className}`}>
      <Button
        text={submitText}
        icon={submitIcon ?? <FaSave />}
        type="submit"
        onClick={onSubmit}
        width={width}
        height={height}
        disabled={disabled}
        isLoading={isLoading}
      />
      <Button
        text={cancelText}
        icon={<GiCancel />}
        type="button"
        contained={false}
        onClick={onCancel}
        width={width}
        height={height}
      />
    </div>
  );
};
