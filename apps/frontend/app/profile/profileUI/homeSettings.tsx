"use client";

import { useState, useEffect } from "react";
import { MENU_LIST } from "@/app/constants/routes";
import { COLOR_THEME } from "@/app/constants/system";
import Button from "@/app/components/atoms/button";

export default function HomeSettings({
  setAlert,
}: {
  setAlert: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const [defaultHome, setDefaultHome] = useState<string>("/home");

  useEffect(() => {
    const savedHome = localStorage.getItem("defaultHome");
    if (savedHome) {
      setDefaultHome(savedHome);
    }
  }, []);

  const handleHomeChange = (href: string) => {
    setDefaultHome(href);
  };
  const handleSave = () => {
    localStorage.setItem("defaultHome", defaultHome);
    setAlert("홈 설정이 저장되었습니다.");
  };
  return (
    <div className="w-full p-4 border border-stone-300 rounded-xl flex flex-col gap-2 max-w-[600px]">
      <h3 className="text-lg font-bold mb-2">🚩 홈 설정</h3>
      <p className="text-sm text-stone-600 mb-3">
        첫 진입시 보여질 페이지를 선택하세요
      </p>
      <div className="flex flex-col gap-2">
        {MENU_LIST.map((menu) => (
          <label
            key={menu.id}
            className="flex items-center gap-3 p-3 rounded-md hover:bg-white cursor-pointer transition-colors"
          >
            <input
              type="radio"
              name="defaultHome"
              value={menu.href}
              checked={defaultHome === menu.href}
              onChange={(e) => handleHomeChange(e.target.value)}
              className="w-4 h-4 cursor-pointer"
              style={{ accentColor: COLOR_THEME.BLUE_COLOR }}
            />
            <span className="text-sm">{menu.name}</span>
          </label>
        ))}
      </div>
      <div className="flex justify-end mt-2">
        <Button
          width={100}
          height={45}
          text="홈페이지 저장"
          onClick={handleSave}
        />
      </div>
    </div>
  );
}
