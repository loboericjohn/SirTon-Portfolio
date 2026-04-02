'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  width?: "fit-content" | "100%";
  delay?: number;
}

export const Reveal = ({ children, width = "100%", delay = 0 }: RevealProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay, ease: [0.2, 1, 0.3, 1] }}
      style={{ width }}
    >
      {children}
    </motion.div>
  );
};
