import { motion } from "motion/react";
import type { ReactNode } from "react";

type AnimatedPanelProps = {
  children: ReactNode;
  className?: string;
};

export const AnimatedPanel = ({ children, className }: AnimatedPanelProps) => (
  <motion.div
    animate={{ opacity: 1, scale: 1, y: 0 }}
    className={className}
    exit={{ opacity: 0, scale: 0.995, y: 10 }}
    initial={{ opacity: 0, scale: 0.995, y: 10 }}
    transition={{ duration: 0.22, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);
