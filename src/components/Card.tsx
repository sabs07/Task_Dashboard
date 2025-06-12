"use client";
import React, { ReactNode } from 'react';
import styles from './Card.module.css';
import clsx from 'clsx';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  animated?: boolean;
  style?: React.CSSProperties;
}

const Card = ({ children, className, animated = true, style }: CardProps) => {
  if (!animated) {
    return <div className={clsx(styles.card, className)} style={style}>{children}</div>;
  }
  return (
    <motion.div
      className={clsx(styles.card, className)}
      style={style}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, type: 'spring', stiffness: 120, damping: 18 }}
    >
      {children}
    </motion.div>
  );
};

export default Card; 