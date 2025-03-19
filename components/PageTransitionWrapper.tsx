"use client";

import { AnimatePresence, easeOut, easeIn, easeInOut, motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function PageTransitionWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 1 }}
        transition={{ duration: 1, ease: easeInOut }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}