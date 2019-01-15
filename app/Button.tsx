import * as React from 'react';

export interface Props {
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
  noBrackets?: boolean;
}

export function Button({ children, onClick, className, noBrackets }: Props) {
  function handleClick(ev: React.SyntheticEvent) {
    if (onClick) {
      ev.preventDefault();
      onClick();
    }
  }

  return (
    <button className={(className || '') + ' button'} onClick={handleClick}>
      {noBrackets ? children : <>[{children}]</>}
    </button>
  );
}
