import {
  useDiet as useDietQuery,
  useCreateDiet,
  useDeleteDiet,
  useUpdateDiet,
} from "@/lib/hooks/useDiet";
import { Eaten, GetCalorie } from "@/types/data";
import { useEffect, useRef, useState } from "react";
import { FcCalendar } from "react-icons/fc";
import { MODAL_BOX } from "@/constants/styles";
import { TextArea } from "@/components/atoms/textArea";
import { Input } from "@/components/atoms/input";
import { OkCancelBtns } from "@/components/molecules/okCancelBtns";
import TableComponent from "../../table";
import { AddNewCalorie } from "./AddNewCalorie";
import { EditCalorie } from "./EditCalorie";
import { useAtomValue, useSetAtom } from "jotai";
import { alertAtom, confirmAtom, errorAtom, userAtom } from "@/lib/atom";
import IconButton from "@/components/molecules/iconButton";
import { FaTrash } from "react-icons/fa";

const dietTableHeaders = [
  { id: "name", label: "음식", width: 100, grow: 1 },
  { id: "cal", label: "칼로리", width: 100, grow: 1 },
];

const ModifyCaloriesModal = ({
  isEdit,
  date,
  onClose,
}: {
  isEdit: boolean;
  date: string;
  onClose: () => void;
}) => {
  const { data } = useDietQuery(isEdit ? date : undefined);
  const isLoading = isEdit && !data;

  if (isLoading) {
    return <div className="p-4">로딩중...</div>;
  }
  return <ActualUI data={data ?? null} date={date} onClose={onClose} />;
};

const ActualUI = ({
  data,
  date,
  onClose,
}: {
  data: GetCalorie | null;
  date: string;
  onClose: () => void;
}) => {
  const createDietMutation = useCreateDiet();
  const updateDietMutation = useUpdateDiet(data?.id ?? 0);
  const deleteDietMutation = useDeleteDiet();
  const loading =
    createDietMutation.isPending ||
    updateDietMutation.isPending ||
    deleteDietMutation.isPending;
  const onModifyDiet = (dietData: {
    eatenList?: { name: string; cal: number }[];
    memo?: string;
    date?: string;
    goalCalorie?: number;
    maximumCalorie?: number;
  }) => {
    const mutation = data?.id ? updateDietMutation : createDietMutation;
    mutation.mutate(dietData, {
      onSuccess: () => {
        onClose();
      },
    });
  };
  const setError = useSetAtom(errorAtom);
  const setAlert = useSetAtom(alertAtom);
  const setConfirm = useSetAtom(confirmAtom);
  const user = useAtomValue(userAtom);
  const [memo, setMemo] = useState(data?.memo || "");
  const [eatenList, setEatenList] = useState<Eaten[]>(
    (data?.eatenList || []).map((item, index) => ({
      ...item,
      index: index + 1,
    })),
  );
  const [goalCalorie, setGoalCalorie] = useState(
    data?.goalCalorie ?? user?.goalCalorie ?? 0,
  );
  const [maximumCalorie, setMaximumCalorie] = useState(
    data?.maximumCalorie ?? user?.maximumCalorie ?? 0,
  );
  const hasInitializedLimitsRef = useRef(!!data || !!user);
  const [openEdit, setOpenEdit] = useState<Eaten | null>(null);

  useEffect(() => {
    if (data || !user || hasInitializedLimitsRef.current) return;

    setGoalCalorie(user.goalCalorie);
    setMaximumCalorie(user.maximumCalorie);
    hasInitializedLimitsRef.current = true;
  }, [data, user]);

  const onDeleteDiet = () => {
    if (!data?.id) return;

    setConfirm({
      title: "식단 기록 삭제",
      message: "정말로 해당 날짜의 식단 기록을 삭제하시겠습니까?",
      confirmEvent: () => {
        deleteDietMutation.mutate(
          { id: data.id },
          {
            onSuccess: () => {
              setAlert("식단 기록이 삭제되었습니다.");
              onClose();
            },
          },
        );
      },
    });
  };

  return (
    <div className={MODAL_BOX} style={{ gap: "15px" }}>
      {openEdit && (
        <EditCalorie
          setOpenEdit={setOpenEdit}
          setEatenList={setEatenList}
          row={openEdit}
          setError={setError}
        />
      )}
      <span className="flex items-center text-lg w-full py-2 font-bold justify-between">
        <div className="flex gap-3 items-center">
          <FcCalendar size={25} />
          식단
          <span className="text-sm text-stone-500 font-normal">({date})</span>
        </div>
        {data?.id && (
          <IconButton
            icon={FaTrash}
            onClick={onDeleteDiet}
            disabled={deleteDietMutation.isPending}
            className="h-8 w-8 rounded-full"
            bgColor="transparent"
            color="#b91c1c"
            size={15}
            tooltip="식단 기록 삭제"
            ariaLabel="식단 기록 삭제"
          />
        )}
      </span>
      <AddNewCalorie setEatenList={setEatenList} setError={setError} />
      <div className="w-full my-1" style={{ height: "300px" }}>
        <TableComponent<Eaten>
          data={eatenList}
          isLoading={false}
          headers={dietTableHeaders}
          rowUniqueKey="index"
          onDelete={(_, idx) => {
            setEatenList((prev) =>
              prev
                .filter((_, index) => index !== idx)
                .map((e, i) => ({ ...e, index: i + 1 })),
            );
          }}
          onEdit={(row) => {
            setOpenEdit(row);
          }}
          lastRow={{
            name: "총 칼로리",
            cal: eatenList.reduce((acc, e) => Number(acc) + Number(e.cal), 0),
            index: 9999,
          }}
        />
      </div>
      <div className="grid w-full grid-cols-2 gap-3">
        <Input
          id="daily_goal_calorie_input"
          value={goalCalorie}
          setValue={setGoalCalorie}
          type="number"
          label="목표 칼로리"
          width="100%"
          min={0}
          max={100000}
        />
        <Input
          id="daily_maximum_calorie_input"
          value={maximumCalorie}
          setValue={setMaximumCalorie}
          type="number"
          label="최대 칼로리"
          width="100%"
          min={0}
          max={100000}
        />
      </div>
      <TextArea
        value={memo}
        setValue={setMemo}
        width="100%"
        height={100}
        label="메모"
      />
      <OkCancelBtns
        submitText="저장"
        onSubmit={() => {
          if (goalCalorie > maximumCalorie) {
            setError("목표 칼로리는 최대 칼로리보다 클 수 없습니다.");
            return;
          }

          const newList = eatenList.filter((e) => e.name.trim() !== "");
          onModifyDiet({
            memo,
            eatenList: newList,
            date,
            goalCalorie: Number(goalCalorie),
            maximumCalorie: Number(maximumCalorie),
          });
        }}
        cancelText="닫기"
        onCancel={onClose}
        isLoading={loading}
      />
    </div>
  );
};

export default ModifyCaloriesModal;
