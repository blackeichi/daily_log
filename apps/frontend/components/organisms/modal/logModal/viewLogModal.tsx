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
      <Title className="flex gap-2 items-center text-lg w-full py-2">
        <RiCalendarView size={25} />
        {title}
      </Title>

      <div className="mt-1 space-y-4">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Log Date
              </p>
              <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-800">
                <RiCalendarView size={16} />
                <span>{data?.logDate || "-"}</span>
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Score
              </p>
              <div className="flex gap-1 rounded-full bg-yellow-50 px-3 py-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <FaStar
                    key={value}
                    size={20}
                    className={
                      value <= (data?.score || 0)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {user ? (
          <div className="space-y-3">
            {ObjKeys.map((objKey) => (
              <InfoBlock
                key={objKey}
                label={objKey}
                value={data?.todayLog?.[objKey] || ""}
              />
            ))}
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
