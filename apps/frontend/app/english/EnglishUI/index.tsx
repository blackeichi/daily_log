"use client";

import { useState } from "react";
import TabHeader from "./TabHeader";
import AskToAI from "./AskToAI";
import SavedList from "./SavedList";

export default function EnglishUI() {
  const [selectedType, setSelectedType] = useState<0 | 1 | 2>(0);
  return (
    <div className="w-full h-full flex flex-col items-center gap-8 max-w-[600px]">
      <TabHeader
        selectedType={selectedType}
        setSelectedType={setSelectedType}
      />
      {selectedType === 0 || selectedType === 1 ? (
        <AskToAI selectedType={selectedType} />
      ) : (
        <SavedList />
      )}
    </div>
  );
}
