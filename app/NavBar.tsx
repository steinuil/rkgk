import * as React from 'react';
import { ApiContext } from './ApiContext';
import { Search } from './Search';
import { Button } from './Button';

export interface Props {
  title: string;
  handleQuery: (query: string) => void;
}

export function NavBar({ title, handleQuery }: Props) {
  const { logOut } = React.useContext(ApiContext);

  return (
    <nav className="nav-bar drop-shadow">
      <div className="title">{title}</div>
      <Search handleQuery={handleQuery} />
      <Button className="log-out" onClick={logOut}>
        log out
      </Button>
    </nav>
  );
}
