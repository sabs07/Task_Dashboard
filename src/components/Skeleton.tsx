import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

const Skeleton: React.FC<SkeletonProps> = ({ width = '100%', height = 20, borderRadius = 8, className, style }) => {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.2s infinite linear',
        ...style,
      }}
    />
  );
};

export default Skeleton;

// Add the keyframes for the shimmer animation to your global CSS:
// @keyframes skeleton-shimmer {
//   0% { background-position: 200% 0; }
//   100% { background-position: -200% 0; }
// } 