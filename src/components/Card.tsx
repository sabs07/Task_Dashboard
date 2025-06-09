import React, { ReactNode } from 'react';
import styles from './Card.module.css';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card = ({ children, className }: CardProps) => {
  return <div className={clsx(styles.card, className)}>{children}</div>;
};

export default Card; 