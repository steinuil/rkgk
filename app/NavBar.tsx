import * as React from 'react';
import { useTextInput } from './Hooks';
import { ApiContext } from './ApiContext';

export interface Props {
  title: string;
  handleQuery: (query: string) => void;
}

export function NavBar({ title, handleQuery }: Props) {
  const [query, setQuery] = useTextInput('');

  const { logOut } = React.useContext(ApiContext);

  return (
    <div>
      {title}
      <input
        type="text"
        placeholder="Search"
        value={query}
        onChange={setQuery}
      />
      <button onClick={() => handleQuery(query)}>search</button>
      <a onClick={logOut}>[log out]</a>
    </div>
  );
}
