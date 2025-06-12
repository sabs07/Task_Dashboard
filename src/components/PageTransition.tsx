"use client";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, type: "spring", stiffness: 120, damping: 18 }}
      style={{ minHeight: "100vh" }}
    >
      {children}
    </motion.div>
  );
} 