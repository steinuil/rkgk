import * as React from 'react';

export interface Props {
  onClick?: () => void;
}

export const Download = ({ onClick }: Props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 60 60"
    className="download-icon"
    onClick={onClick}
  >
    <path
      fill="white"
      stroke="#45425a"
      d="M 20,0 l 20,0 l 0,30 l 20,0 l -30,30 l -30,-30 l 20,0 Z"
    />
  </svg>
);
