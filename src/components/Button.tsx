import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';
import clsx from 'clsx';

type Variant = 'primary' | 'secondary' | 'danger';
type Size = 'normal' | 'small';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  loading?: boolean;
  size?: Size;
  icon?: ReactNode;
  fullWidth?: boolean;
}

const Button = ({ children, variant = 'primary', loading, disabled, size = 'normal', icon, fullWidth, ...props }: ButtonProps) => {
  return (
    <button
      className={clsx(
        styles.button,
        styles[variant],
        size === 'small' && styles.small,
        fullWidth && styles.fullWidth
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className={styles.loader} /> : <>{icon && <span style={{marginRight: 8}}>{icon}</span>}{children}</>}
    </button>
  );
};

export default Button; 