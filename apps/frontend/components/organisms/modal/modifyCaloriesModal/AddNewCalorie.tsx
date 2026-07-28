import { Input } from "@/components/atoms/input";
import IconButton from "@/components/molecules/iconButton";
import { Eaten } from "@/types/data";
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
        <button
          type="button"
          className="absolute right-1.25 cursor-pointer z-10 flex items-center justify-center rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-stone-500"
          onClick={() => {
            if (newCalorie) {
              setNewCalorie((prev) => prev * -1);
            }
          }}
          aria-label="칼로리 양수/음수 전환"
        >
          <BsPlusSlashMinus size={12} aria-hidden="true" />
        </button>
      </div>

      <IconButton
        icon={FaPlus}
        size={12}
        onClick={() => {
          const calorie = Number(newCalorie);

          if (!newFood.trim() || !Number.isFinite(calorie)) {
            return setError("음식명과 올바른 칼로리를 입력해주세요.");
          }

          setEatenList((prev) => [
            ...prev,
            {
              name: newFood.trim(),
              cal: calorie,
              index: prev.length + 1,
            },
          ]);
          setNewFood("");
          setNewCalorie(0);
        }}
        className="w-[24px] h-[24px] rounded-full ml-1 mb-1.5"
        ariaLabel="음식 추가"
      />
    </div>
  );
};
