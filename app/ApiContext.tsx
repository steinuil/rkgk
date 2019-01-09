/** @overview Manages the API client and exposes it as React context. */

/** @ignore */
import * as React from 'react';
import { Login } from './Login';
import { Client } from '../src/api/Client';
import { ApiClient } from '../src/api/ApiClient';

interface ApiContext {
  client: Client;
  logOut: () => void;
}

const initialState: ApiContext = {
  client: {
    request: async () => {
      throw new Error('client not initialized');
    },
  },
  logOut: () => {},
};

/* Helper functions */
type SetClient = (c: ApiContext | null) => void;

function initializeFromLocalStorage(setClient: SetClient) {
  const refreshToken = localStorage.getItem('rkgk_refreshToken');
  if (!refreshToken) {
    return;
  }

  const client = new ApiClient(
    { state: 'token', refreshToken },
    { api: '', auth: '' }
  );

  setClient({
    client,
    logOut: () => setClient(null),
  });
}

const setCredentials = (setClient: SetClient) => (
  username: string,
  password: string
) => {
  const client = new ApiClient(
    { state: 'password', username, password },
    { api: '', auth: '' }
  );

  setClient({
    client,
    logOut: () => setClient(null),
  });
};

export const ApiContext = React.createContext<ApiContext>(initialState);

export interface ProviderProps {
  children?: React.ReactNode;
}

/**
 * Renders its children when logged in, otherwise shows the
 * Login component.
 */
export function ApiProvider({ children }: ProviderProps) {
  const [client, setClient] = React.useState<ApiContext | null>(null);

  React.useEffect(() => initializeFromLocalStorage(setClient), []);

  return client ? (
    <ApiContext.Provider value={client}>{children}</ApiContext.Provider>
  ) : (
    <Login onSubmit={setCredentials(setClient)} />
  );
}
