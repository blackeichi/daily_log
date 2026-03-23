import { GetDiet, ModifyDiet } from "@/app/actions/client/diet";
import { DietCalendarData, Eaten, GetCalorie } from "@/app/types/data";
import { useEffect, useState } from "react";
import { FcCalendar } from "react-icons/fc";
import { MODAL_BOX } from "@/app/constants/styles";
import { TextArea } from "@/app/components/atoms/textArea";
import { OkCancelBtns } from "@/app/components/molecules/okCancelBtns";
import TableComponent from "../../table";
import { AddNewCalorie } from "./AddNewCalorie";
import { EditCalorie } from "./EditCalorie";
import { useModalData } from "@/app/libs/hooks/useModalData";
import { useSetAtom } from "jotai";
import { errorAtom } from "@/app/libs/atom";

const headers = [
  { id: "name", label: "음식", width: 1 },
  { id: "cal", label: "칼로리", width: 1 },
];

const ModifyCaloriesModal = ({
  isEdit,
  date,
  onClose,
  callBack,
}: {
  isEdit: boolean;
  date: string;
  onClose: () => void;
  callBack: (val?: DietCalendarData) => void;
}) => {
  const [{ data }, onGetDiet] = GetDiet(date);
  const isLoading = useModalData(isEdit, date, data, onGetDiet);

  if (isLoading) {
    return <div className="p-4">로딩중...</div>;
  }
  return (
    <ActualUI data={data} date={date} onClose={onClose} callBack={callBack} />
  );
};

const ActualUI = ({
  data,
  date,
  onClose,
  callBack,
}: {
  data: GetCalorie | null;
  date: string;
  onClose: () => void;
  callBack: (val?: DietCalendarData) => void;
}) => {
  const [{ data: modifyData, loading }, onModifyDiet] = ModifyDiet(data?.id);
  const [openEdit, setOpenEdit] = useState<Eaten | null>(null);
  const [memo, setMemo] = useState(data?.memo || "");
  const [eatenList, setEatenList] = useState<Eaten[]>(
    data?.eatenList ||
      [],
  );
  const setError = useSetAtom(errorAtom);
  useEffect(() => {
    if (modifyData?.data) {
      callBack({
        [date]: {
          isChecked: modifyData.data.isSuccess,
          calorie: modifyData.data.totalCalorie,
        },
      });
      onClose();
    }
  }, [modifyData, callBack, date, onClose]);
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
      </span>
      <AddNewCalorie setEatenList={setEatenList} setError={setError} />
      <div className="w-full my-1" style={{ height: '300px' }}>
        <TableComponent<Eaten>
          data={eatenList}
          isLoading={Boolean(openEdit)}
          headers={headers}
          rowUniqueKey="index"
          noHeader
          onDelete={(_, idx) => {
            setEatenList((prev) => prev.filter((_, index) => index !== idx)
            .map((e, i) => ({ ...e, index: i + 1 })));
          }}
          onDoubleClick={(row) => {
            setOpenEdit(row);
          }}
          lastRow={{
            name: "총 칼로리",
            cal: eatenList.reduce((acc, e) => Number(acc) + Number(e.cal), 0),
            index: 9999,
          }}
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
          const newList = eatenList.filter((e) => e.name.trim() !== "");
          onModifyDiet({
            memo,
            eatenList: newList,
            date,
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
