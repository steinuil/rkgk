import * as React from 'react';
import { NavBar } from './NavBar';
import { useHistory } from '../src/hooks/UseHistory';

interface Page<T> {
  page: T;
}

type PageState = Page<string>;

const initialPage: PageState = { page: 'HOME' };

export function Browser({}) {
  const [page, setPage] = useHistory<PageState>(initialPage);

  return (
    <>
      <NavBar title="rkgk" handleQuery={(page) => setPage({ page })} />
      {page.page}
    </>
  );
}
