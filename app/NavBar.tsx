import * as React from 'react';
import { useTextInput } from './Hooks';

export interface Props {
  title: string;
}

export const NavBar = ({ title }: Props) => {
  const [query, setQuery] = useTextInput('');

  return (
    <div>
      {title}
      <input
        type="text"
        placeholder="Search"
        value={query}
        onChange={setQuery}
      />
    </div>
  );
};
