import { MODAL_BOX } from "@/constants/styles";
import { MODAL_STATE } from "@/constants/system";
import { modalAtom } from "@/lib/atom";
import type { GetAllCalories, GetLogsType } from "@/types/api";
import { useSetAtom } from "jotai";
import { FaChevronRight, FaRegCalendarAlt, FaStar } from "react-icons/fa";
import Title from "@/components/atoms/Title";
import Button from "@/components/atoms/button";
import { GiCancel } from "react-icons/gi";

type HomeChartDetailModalProps = {
  title: string;
  kind: "log" | "calorie";
  items: GetLogsType[] | GetAllCalories[];
  onClose: () => void;
};

export default function HomeChartDetailModal({
  title,
  kind,
  items,
  onClose,
}: HomeChartDetailModalProps) {
  const setModal = useSetAtom(modalAtom);

  return (
    <div className={MODAL_BOX} style={{ maxWidth: 720 }}>
      <Title className="flex items-center gap-2 text-lg w-full py-2">
        <FaRegCalendarAlt size={20} />
        {title}
      </Title>

      <div className="w-full max-h-[60vh] overflow-y-auto space-y-3 pr-1">
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 p-6 text-center text-stone-500">
            표시할 데이터가 없습니다.
          </div>
        ) : kind === "log" ? (
          (items as GetLogsType[]).map((item) => (
            <button
              key={item.id}
              type="button"
              className="w-full rounded-lg border border-stone-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              onClick={() =>
                setModal({
                  id: MODAL_STATE.VIEW_LOG,
                  data: { id: item.id, title: item.title },
                })
              }
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-semibold text-stone-800 truncate">
                    {item.title || "제목 없음"}
                  </div>
                  <div className="mt-1 text-sm text-stone-500">
                    {item.logDate}
                  </div>
                </div>

                <div className="flex items-center gap-1 rounded-full bg-yellow-50 px-3 py-1 text-sm text-stone-700">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <FaStar
                      key={value}
                      size={12}
                      aria-hidden="true"
                      className={
                        value <= (item.score ?? 0)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-end gap-2 text-sm text-stone-500">
                상세 보기
                <FaChevronRight size={12} />
              </div>
            </button>
          ))
        ) : (
          (items as GetAllCalories[]).map((item) => (
            <button
              key={item.id}
              type="button"
              className="w-full rounded-lg border border-stone-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              onClick={() =>
                setModal({
                  id: MODAL_STATE.EDIT_CALORIES,
                  data: item.date,
                })
              }
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold text-stone-800">
                    {item.date}
                  </div>
                  <div className="mt-1 text-sm text-stone-500 line-clamp-2">
                    {item.memo || "메모 없음"}
                  </div>
                  <div className="mt-2 text-xs text-stone-500">
                    목표 {item.goalCalorie} kcal · 최대 {item.maximumCalorie}{" "}
                    kcal
                  </div>
                </div>

                <div className="rounded-full px-3 py-1 text-sm font-medium bg-stone-100 text-stone-700">
                  {item.totalCalorie} kcal
                </div>
              </div>

              <div className="mt-3 flex items-center justify-end gap-2 text-sm text-stone-500">
                식단 열기
                <FaChevronRight size={12} />
              </div>
            </button>
          ))
        )}
      </div>

      <div className={`flex w-full justify-end mt-4`}>
        <Button
          text={"닫기"}
          icon={<GiCancel />}
          type="button"
          contained={false}
          onClick={onClose}
          width={120}
          height={35}
        />
      </div>
    </div>
  );
}
