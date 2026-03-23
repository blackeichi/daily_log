"use client";

import { useEffect, useState } from "react";
import { BeatLoader } from "react-spinners";

export const LoadingComponent = () => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed left-0 top-0 flex items-center justify-center w-screen h-screen text-stone-800 flex-col gap-2 text-sm">
      <BeatLoader size={12} />
      {elapsed < 6 ? (
        <span>로딩 중입니다...</span>
      ) : elapsed < 16 ? (
        <span>잠자는 서버를 깨우는 중입니다. 잠시만 기다려주세요. 🙏</span>
      ) : elapsed < 60 ? (
        <span>서버가 열심히 일어나고 있어요.. 🤖</span>
      ) : elapsed < 80 ? (
        <span>이제 기지개를 키고 일어날 거 같아요! 🦾</span>
      ) : (
        <span>서버가 너무 졸린가봐요... 😢 잠시 후 다시 시도해주세요..</span>
      )}
    </div>
  );
};
