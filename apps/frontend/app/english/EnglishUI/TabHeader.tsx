import Button from "@/app/components/atoms/button";
import { COLOR_THEME } from "@/app/constants/system";
import { useState } from "react";

export default function TabHeader({
  selectedType,
  setSelectedType,
}: {
  selectedType: 0 | 1 | 2;
  setSelectedType: React.Dispatch<React.SetStateAction<0 | 1 | 2>>;
}) {
  const [left, setLeft] = useState(30);
  const handleSelect = (type: 0 | 1 | 2) => {
    setSelectedType(type);
  };
  return (
    <div
      className="relative w-full h-28 rounded-lg flex-shrink-0 flex items-center justify-between p-2 transition-[background-color] shadow-md shadow-stone-500"
      style={{
        backgroundColor: COLOR_THEME.GREEN_COLOR,
      }}
    >
      <div className="flex gap-1 relative z-10">
        <div
          className="w-2 h-2 rounded-full bg-stone-700 -bottom-3 absolute transition-[left]"
          style={{ left }}
        />
        <Button
          text="잘했나요?"
          width={70}
          height={35}
          onClick={() => {
            handleSelect(0);
            setLeft(30);
          }}
          style={{
            backgroundColor:
              selectedType === 0 ? "rgba(255,255,255,0.6)" : "transparent",
            fontWeight: "bold",
            color:
              selectedType === 0 ? COLOR_THEME.DARK_GRAY : COLOR_THEME.BG_COLOR,
          }}
          borderRadius="25px"
        />
        <Button
          text="궁금해요!"
          width={70}
          height={35}
          onClick={() => {
            handleSelect(1);
            setLeft(105);
          }}
          style={{
            backgroundColor:
              selectedType === 1 ? "rgba(255,255,255,0.6)" : "transparent",
            fontWeight: "bold",
            color:
              selectedType === 1 ? COLOR_THEME.DARK_GRAY : COLOR_THEME.BG_COLOR,
          }}
          borderRadius="25px"
        />
        <Button
          text="뭐였더라!"
          width={70}
          height={35}
          onClick={() => {
            handleSelect(2);
            setLeft(180);
          }}
          style={{
            backgroundColor:
              selectedType === 2 ? "rgba(255,255,255,0.6)" : "transparent",
            fontWeight: "bold",
            color:
              selectedType === 2 ? COLOR_THEME.DARK_GRAY : COLOR_THEME.BG_COLOR,
          }}
          borderRadius="25px"
        />
      </div>
      <div className="text-4xl w-12 h-12 bg-[rgba(255,255,255,0.6)] rounded-full flex items-center justify-center overflow-hidden">
        {selectedType === 0 ? (
          <span className="text-3xl">✌️</span>
        ) : selectedType === 1 ? (
          <span>🙋‍♂️</span>
        ) : (
          <span className="text-3xl">🤔</span>
        )}
      </div>
    </div>
  );
}
