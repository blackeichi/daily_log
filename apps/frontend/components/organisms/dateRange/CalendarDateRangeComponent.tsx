import { COLOR_THEME } from "@/constants/system";
import { useDidMountEffect } from "@/lib/hooks/useDidMountEffect";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";

export const CalendarDateRangeComponent = ({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) => {
  const [flag, setFlag] = useState(false);
  useDidMountEffect(() => {
    setFlag(true);
  }, [startDate, endDate]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setFlag(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [flag]);
  return (
    <motion.div
      className="flex font-bold bg-stone-700 text-stone-200 py-2.5 px-5 rounded-2xl"
      initial={{ color: COLOR_THEME.LIGHT_GRAY }}
      animate={{
        color: flag ? COLOR_THEME.PASTEL_GREEN_COLOR : COLOR_THEME.LIGHT_GRAY,
      }}
    >
      {startDate.replaceAll("-", ".")} - {endDate.replaceAll("-", ".")}
    </motion.div>
  );
};
