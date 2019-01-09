import * as React from 'react';
import { NavBar } from './NavBar';
import { ApiProvider } from './ApiContext';

export function Rkgk() {
  return (
    <ApiProvider>
      <NavBar title="rkgk" />
    </ApiProvider>
  );
}
