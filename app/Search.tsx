import * as React from 'react';
import { useTextInput } from '../src/hooks/UseTextInput';
import { Button } from './Button';

export interface Props {
  handleQuery: (query: string) => void;
}

export function Search({ handleQuery }: Props) {
  const [query, setQuery] = useTextInput('');

  function handleSubmit(ev: React.SyntheticEvent) {
    ev.preventDefault();
    if (query.length > 0) {
      handleQuery(query);
    }
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="query..."
        value={query}
        onChange={setQuery}
      />
      <Button noBrackets>search</Button>
    </form>
  );
}
