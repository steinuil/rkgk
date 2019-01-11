import * as React from 'react';
import { useTextInput } from '../src/hooks/UseTextInput';

export interface Props {
  handleQuery: (query: string) => void;
}

export function Search({ handleQuery }: Props) {
  const [query, setQuery] = useTextInput('');

  return (
    <div>
      <input
        type="text"
        placeholder="Search"
        value={query}
        onChange={setQuery}
      />
      <button onClick={() => handleQuery(query)}>search</button>
    </div>
  );
}
