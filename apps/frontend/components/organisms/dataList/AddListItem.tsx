import IconButton from "@/components/molecules/iconButton";
import React, { useCallback, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { motion } from "framer-motion";
import { Input } from "@/components/atoms/input";
import { useSetAtom } from "jotai";
import { errorAtom } from "@/lib/atom";
import { COLOR_THEME } from "@/constants/system";
import { DataListItemType } from "./dataList";

const MAX_ITEMS = 30;

export const AddListItem = ({
  title,
  dataList,
  setDataList,
  maxLength,
}: {
  title: string;
  dataList: DataListItemType[];
  setDataList: (val: DataListItemType[]) => void;
  maxLength?: number | undefined;
}) => {
  const setError = useSetAtom(errorAtom);
  const [newData, setNewData] = useState("");
  const [open, setOpen] = useState(false);
  const [itemType, setItemType] = useState<"todo" | "section">("todo");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!newData.trim()) {
        setError("할 일을 입력해주세요.");
        return;
      }
      setDataList([
        ...dataList,
        itemType === "section"
          ? {
              id: Date.now(),
              text: newData,
              type: "section",
            }
          : {
              id: Date.now(),
              text: newData,
              isDone: false,
              type: "todo",
            },
      ]);
      setNewData("");
      setItemType("todo");
      setOpen(false);
    },
    [newData, itemType, dataList, setDataList, setError],
  );

  return (
    <form
      className="flex h-12 items-center bg-white shadow-sm shadow-stone-500 justify-center gap-1 px-1 pl-3"
      onSubmit={handleSubmit}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: open ? "90%" : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden flex items-center gap-2"
      >
        <div className="flex shrink-0 rounded-md border border-stone-300 bg-stone-100 p-0.5">
          <button
            type="button"
            className={`rounded px-2 py-1 text-[11px] ${
              itemType === "todo" ? "bg-stone-700 text-white" : "text-stone-600"
            }`}
            onClick={() => setItemType("todo")}
          >
            할 일
          </button>
          <button
            type="button"
            className={`rounded px-2 py-1 text-[11px] ${
              itemType === "section"
                ? "bg-stone-700 text-white"
                : "text-stone-600"
            }`}
            onClick={() => setItemType("section")}
          >
            섹터
          </button>
        </div>
        <Input
          id="add-new-data"
          value={newData}
          setValue={setNewData}
          width="100%"
          placeholder={
            dataList.length >= MAX_ITEMS
              ? "더 이상 추가할 수 없습니다."
              : itemType === "section"
                ? "섹터 제목을 입력하세요."
                : `${title}을(를) 입력하세요.`
          }
          maxLength={maxLength ?? 200}
          disabled={dataList.length >= MAX_ITEMS}
        />
      </motion.div>
      <div className="flex gap-1 items-center">
        {open && (
          <IconButton
            text="추가"
            onClick={handleSubmit}
            className="w-12 h-9 text-white text-xs rounded-sm gap-0.5"
            color="white"
            type="submit"
            size={15}
            disabled={dataList.length >= MAX_ITEMS}
            ariaLabel="항목 추가"
          />
        )}
        <IconButton
          icon={FaPlus}
          onClick={() => setOpen((prev) => !prev)}
          className={`w-7 h-7 text-white text-xs gap-0.5 border-stone-500 outline-white  ${open ? "rotate-45" : ""} rounded-full transition-all duration-200`}
          color={open ? COLOR_THEME.DARK_GRAY : "white"}
          bgColor={open ? "transparent" : COLOR_THEME.DARK_GRAY}
          size={15}
          ariaLabel={open ? "추가 입력 닫기" : "추가 입력 열기"}
        />
      </div>
    </form>
  );
};
