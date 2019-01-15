import * as React from 'react';
import { NavBar } from './NavBar';
import { useHistory } from '../src/hooks/UseHistory';
import * as Endpoint from '../src/api/Endpoints';
import { ApiContext } from './ApiContext';
import { Illust } from '../src/api/Items';
import { Thumbnail } from './IllustList';
import { Button } from './Button';

interface Page<T> {
  page: T;
}

type PageState = Page<'HOME'> | Page<'RESULTS'> & { results: Illust[] };

const initialPage: PageState = { page: 'HOME' };

export function Browser({}) {
  const [page, setPage] = useHistory<PageState>(initialPage);
  const [completions, setCompletions] = React.useState<string[]>([]);
  const { client } = React.useContext(ApiContext);

  const complete = (query: string) =>
    Endpoint.autoComplete(client, query).then((results) =>
      setCompletions(results)
    );

  const search = (query: string) => () =>
    Endpoint.searchIllusts(client, query).then((results) =>
      setPage({ page: 'RESULTS', results: results.curr })
    );

  return (
    <>
      <NavBar title="rkgk" handleQuery={complete} />
      <div>Page: {page.page}</div>
      {completions.length > 0 && (
        <div>
          Completions:
          {completions.map((c) => (
            <Button key={c} className="completion" onClick={search(c)}>
              {c}
            </Button>
          ))}
        </div>
      )}
      {page.page === 'RESULTS' && (
        <main className="results">
          {page.results.map((illust) => (
            <Thumbnail key={illust.id} {...illust} />
          ))}
        </main>
      )}
    </>
  );
}
