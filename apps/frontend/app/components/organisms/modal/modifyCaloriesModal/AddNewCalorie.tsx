import { Input } from "@/app/components/atoms/input";
import IconButton from "@/app/components/molecules/iconButton";
import { Eaten } from "@/app/types/data";
import React, { useState } from "react";
import { BsPlusSlashMinus } from "react-icons/bs";
import { FaPlus } from "react-icons/fa";

export const AddNewCalorie = ({
  setEatenList,
  setError,
}: {
  setEatenList: React.Dispatch<React.SetStateAction<Eaten[]>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
  const [newFood, setNewFood] = useState("");
  const [newCalorie, setNewCalorie] = useState<number>(0);
  return (
    <div className="flex gap-1 w-full items-end">
      <div className="flex-1">
        <Input
          id="newFood_input"
          value={newFood}
          setValue={setNewFood}
          label="🍚 음식"
          width={"100%"}
        />
      </div>
      <div className="relative flex items-center flex-1">
        <Input
          id="newCalorie_input"
          value={newCalorie}
          setValue={setNewCalorie}
          type="number"
          label="🍽️ 칼로리"
          width={"100%"}
          min={-5000}
          max={5000}
          style={{
            paddingRight: "20px",
          }}
        />
        <div
          className="absolute right-1.25 cursor-pointer z-10 flex items-center justify-center"
          onClick={() => {
            if (newCalorie) {
              setNewCalorie((prev) => prev * -1);
            }
          }}
        >
          <BsPlusSlashMinus size={12} />
        </div>
      </div>

      <IconButton
        icon={FaPlus}
        size={12}
        onClick={() => {
          if (!newFood || !newCalorie) {
            return setError("음식명과 칼로리를 모두 입력해주세요.");
          }
          setEatenList((prev) => [
            ...prev,
            {
              name: newFood,
              cal: Number(newCalorie),
              index: prev.length + 1,
            },
          ]);
          setNewFood("");
          setNewCalorie(0);
        }}
        className="w-[24px] h-[24px] rounded-full ml-1 mb-1.5"
      />
    </div>
  );
};
