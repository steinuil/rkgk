import * as React from 'react';
import { Login } from './Login';
import { NavBar } from './NavBar';

interface Page<T> {
  page: T;
}

type PageState = Page<'LOGIN'>;

export function Rkgk() {
  const [page, setPage]: [
    PageState,
    React.Dispatch<React.SetStateAction<PageState>>
  ] = React.useState({ page: 'LOGIN' as 'LOGIN' });

  return (
    <div>
      <NavBar title="rkgk" />
      <Login onSubmit={() => {}} />
    </div>
  );
}
