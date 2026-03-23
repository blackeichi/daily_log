import { Input } from "@/app/components/atoms/input";
import Overlay from "@/app/components/atoms/overlay";
import { OkCancelBtns } from "@/app/components/molecules/okCancelBtns";
import { Eaten } from "@/app/types/data";
import { useState } from "react";
import { BsPlusSlashMinus } from "react-icons/bs";

export const EditCalorie = ({
  setOpenEdit,
  setEatenList,
  row,
  setError,
}: {
  setOpenEdit: React.Dispatch<React.SetStateAction<Eaten | null>>;
  setEatenList: React.Dispatch<React.SetStateAction<Eaten[]>>;
  row: Eaten;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
  const [name, setName] = useState(row.name);
  const [cal, setCal] = useState(row.cal);
  return (
    <Overlay onClick={() => setOpenEdit(null)}>
      <div className="flex gap-3 flex-col p-4 items-center">
        <Input
          id="cal_name_input"
          defaultValue={name}
          setValue={setName}
          label="음식 이름"
          width={300}
          height={45}
        />
        <div className="relative flex items-center">
          <Input
            id="cal_input"
            value={cal}
            setValue={setCal}
            type="number"
            label="음식 칼로리"
            width={300}
            height={45}
            min={-5000}
            max={5000}
            style={{
              paddingRight: "26px",
            }}
          />
          <div
            className="absolute right-2 cursor-pointer z-10 flex items-center justify-center"
            onClick={() => {
              setCal((prev) => prev * -1);
            }}
          >
            <BsPlusSlashMinus size={15} />
          </div>
        </div>
        <OkCancelBtns
          submitText="저장"
          cancelText="취소"
          onCancel={() => setOpenEdit(null)}
          onSubmit={() => {
            if (!name || !cal)
              return setError("음식명과 칼로리를 모두 입력해주세요.");
            setEatenList((prev) => {
              const newList = [...prev];
              const target = newList[row.index - 1];
              if (!target) return prev;
              target.name = name;
              target.cal = cal;
              return newList;
            });
            setOpenEdit(null);
          }}
        />
      </div>
    </Overlay>
  );
};
