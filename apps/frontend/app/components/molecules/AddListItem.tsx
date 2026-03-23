import IconButton from "@/app/components/molecules/iconButton";
import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { motion } from "framer-motion";
import { Input } from "@/app/components/atoms/input";
import { useSetAtom } from "jotai";
import { errorAtom } from "@/app/libs/atom";
import { COLOR_THEME } from "@/app/constants/system";

const MAX_ITEMS = 20;

export type DataListItem = {
  id: number;
  text: string;
  isDone?: boolean;
};

export const AddListItem = ({
  title,
  dataList,
  setDataList,
}: {
  title: string;
  dataList: DataListItem[];
  setDataList: (val: DataListItem[]) => void;
}) => {
  const setError = useSetAtom(errorAtom);
  const [newData, setNewData] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <form
      className="flex h-12 items-center bg-white shadow-sm shadow-stone-500 justify-center gap-1 px-1 pl-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!newData.trim()) {
          setError("할 일을 입력해주세요.");
          return;
        }
        setDataList([
          ...dataList,
          { id: Date.now(), text: newData, isDone: false },
        ]);
        setNewData("");
      }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: open ? "90%" : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <Input
          id="add-new-data"
          value={newData}
          setValue={setNewData}
          width="100%"
          placeholder={
            dataList.length >= MAX_ITEMS
              ? "더 이상 추가할 수 없습니다."
              : `${title}을(를) 입력하세요.`
          }
          maxLength={200}
          disabled={dataList.length >= MAX_ITEMS}
        />
      </motion.div>
      <div className="flex gap-1 items-center">
        {open && (
          <IconButton
            text="추가"
            onClick={() => {}}
            className={`w-12 h-[34px] text-white text-xs rounded-sm gap-0.5`}
            color="white"
            type="submit"
            size={15}
            disabled={dataList.length >= MAX_ITEMS}
          />
        )}
        <IconButton
          icon={FaPlus}
          onClick={() => setOpen((prev) => !prev)}
          className={`w-7 h-7 text-white text-xs gap-0.5 border-stone-500 outline-white  ${open ? "rotate-45" : ""} rounded-full transition-all duration-200`}
          color={open ? COLOR_THEME.DARK_GRAY : "white"}
          bgColor={open ? "transparent" : COLOR_THEME.DARK_GRAY}
          size={15}
        />
      </div>
    </form>
  );
};
