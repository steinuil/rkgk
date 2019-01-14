import * as React from 'react';
import { NavBar } from './NavBar';
import { useHistory } from '../src/hooks/UseHistory';
import * as Endpoint from '../src/api/Endpoints';
import { ApiContext } from './ApiContext';
import { Illust } from '../src/api/Items';

interface Page<T> {
  page: T;
}

type PageState =
  | Page<'HOME'>
  | Page<'SEARCH'> & { query: string }
  | Page<'RESULTS'> & { results: string[] }
  | Page<'GOTO'> & { query: string }
  | Page<'SEARCHRESULTS'> & { results: Illust[] };

const initialPage: PageState = { page: 'HOME' };

export function Browser({}) {
  const [page, setPage] = useHistory<PageState>(initialPage);
  const { client } = React.useContext(ApiContext);

  const search = (query: string) => () => setPage({ page: 'GOTO', query });

  React.useEffect(
    () => {
      if (page.page === 'SEARCH') {
        Endpoint.autoComplete(client, page.query).then((results) =>
          setPage({ page: 'RESULTS', results })
        );
      } else if (page.page === 'GOTO') {
        Endpoint.searchIllusts(client, page.query).then((results) =>
          setPage({ page: 'SEARCHRESULTS', results: results.curr })
        );
      }
    },
    [page]
  );

  return (
    <>
      <NavBar
        title="rkgk"
        handleQuery={(query) => setPage({ page: 'SEARCH', query })}
      />
      Page: {page.page}
      {page.page === 'RESULTS'
        ? page.results.map((r) => (
            <div key={r} onClick={search(r)}>
              {r}
            </div>
          ))
        : page.page === 'SEARCHRESULTS'
        ? page.results.map((r) => <div key={r.id}>{JSON.stringify(r)}</div>)
        : null}
    </>
  );
}
