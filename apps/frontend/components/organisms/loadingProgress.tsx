"use client";

import { useAtomValue } from "jotai";
import { motion } from "framer-motion";
import { loadingState } from "@/lib/atom";

export const LoadingProgress = () => {
  const loading = useAtomValue(loadingState);
  return (
    <div className="z-50 fixed top-0 left-0 w-screen">
      {loading ? (
        <div className="w-full h-1.5 relative overflow-hidden bg-inherit">
          <motion.div
            className="w-1/2 h-full -left-1/2 top-0 absolute"
            animate={{
              left: "100%",
            }}
            transition={{
              repeat: Infinity,
              duration: 1,
            }}
          >
            <div className="w-full h-full bg-stone-800" />
          </motion.div>
        </div>
      ) : null}
    </div>
  );
};
