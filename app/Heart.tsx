import * as React from 'react';

export interface Props {
  className?: string;
  onClick?: () => void;
  color: string;
  strokeColor: string;
}

export const Heart = ({ className, onClick, color, strokeColor }: Props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 60 60"
    className={className}
    onClick={onClick}
  >
    <path
      fill={color}
      stroke={strokeColor}
      d="M 30,52  l -20,-20  c -10,-10 0,-30 20,-20  c 20,-10 30,10 20,20 Z"
    />
  </svg>
);
