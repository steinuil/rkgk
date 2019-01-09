import * as React from 'react';
import { ApiProvider } from './ApiContext';
import { Browser } from './Browser';

export function Rkgk() {
  return (
    <ApiProvider>
      <Browser />
    </ApiProvider>
  );
}
