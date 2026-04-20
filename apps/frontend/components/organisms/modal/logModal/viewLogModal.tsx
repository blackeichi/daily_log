import { RiCalendarView } from "react-icons/ri";
import { FaStar } from "react-icons/fa";
import { useAtomValue, useSetAtom } from "jotai";
import { modalAtom, userAtom } from "@/lib/atom";
import { MODAL_BOX } from "@/constants/styles";
import Title from "@/components/atoms/Title";
import { useLog } from "@/lib/hooks/useLog";
import React, { useMemo } from "react";
import { ComponentLoader } from "@/components/atoms/componentLoader";
import { InfoBlock } from "@/components/atoms/InfoBlock";
import { OkCancelBtns } from "@/components/molecules/okCancelBtns";
import { CiEdit } from "react-icons/ci";
import { MODAL_STATE } from "@/constants/system";

const ViewLogModal = ({
  id,
  title,
  onClose,
}: {
  id: number;
  title: string;
  onClose: () => void;
}) => {
  const { data, isLoading } = useLog(id);
  const user = useAtomValue(userAtom);
  const setModal = useSetAtom(modalAtom);
  const ObjKeys = useMemo(
    () => [
      ...new Set([
        ...(user?.defaultLogObj || []),
        ...Object.keys(data?.todayLog || {}),
      ]),
    ],
    [user, data],
  );
  if (isLoading)
    return (
      <div className={MODAL_BOX}>
        <div className="py-6">
          <ComponentLoader />
        </div>
      </div>
    );
  return (
    <div className={MODAL_BOX}>
      <div className="flex flex-col w-full">
        <Title className="flex gap-2 items-center text-lg w-full py-2">
          <RiCalendarView size={25} />
          {title}
          <div className="flex gap-1 rounded-full bg-yellow-50 p-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <FaStar
                key={value}
                size={15}
                className={
                  value <= (data?.score || 0)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }
              />
            ))}
          </div>
        </Title>
        <div className="inline-flex items-center gap-2 rounded-full pl-1.5 text-sm font-medium text-gray-500">
          <span>{data?.logDate || "-"}</span>
        </div>
      </div>

      <div className="mt-1 space-y-4">
        {user ? (
          <div className="space-y-3">
            {ObjKeys.map((objKey) => {
              const value = data?.todayLog?.[objKey] || "";
              if (!value) return null;
              return <InfoBlock key={objKey} label={objKey} value={value} />;
            })}
          </div>
        ) : (
          <div className="py-6">
            <ComponentLoader />
          </div>
        )}
      </div>
      <OkCancelBtns
        onSubmit={() =>
          setModal({
            id: MODAL_STATE.EDIT_LOG,
            data: id,
          })
        }
        onCancel={onClose}
        submitIcon={<CiEdit size={16} />}
        submitText="수정하기"
        cancelText="닫기"
        className="my-2"
      />
    </div>
  );
};

export default ViewLogModal;
