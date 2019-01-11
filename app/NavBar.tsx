import * as React from 'react';
import { ApiContext } from './ApiContext';
import { Search } from './Search';

export interface Props {
  title: string;
  handleQuery: (query: string) => void;
}

export function NavBar({ title, handleQuery }: Props) {
  const { logOut } = React.useContext(ApiContext);

  return (
    <div>
      {title}
      <Search handleQuery={handleQuery} />
      <a onClick={logOut}>[log out]</a>
    </div>
  );
}
