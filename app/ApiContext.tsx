import * as React from 'react';
import { Login } from './Login';
import { ApiClient } from '../src/api/ApiClient';

const ApiContext = React.createContext<ApiClient | null>(null);

export interface Props {
  children?: React.ReactNode;
}

type SetClient = (c: ApiClient) => void;

function initializeFromLocalStorage(setClient: SetClient) {
  const refreshToken = localStorage.getItem('rkgk_refreshToken');
  if (!refreshToken) {
    return;
  }

  const client = new ApiClient(
    { state: 'token', refreshToken },
    { api: '', auth: '' }
  );

  setClient(client);
}

const setCredentials = (setClient: SetClient) => (
  username: string,
  password: string
) =>
  setClient(
    new ApiClient(
      { state: 'password', username, password },
      { api: '', auth: '' }
    )
  );

export function ApiProvider({ children }: Props) {
  const [client, setClient] = React.useState<ApiClient | null>(null);

  React.useEffect(() => initializeFromLocalStorage(setClient), []);

  return (
    <ApiContext.Provider value={client}>
      {client ? children : <Login onSubmit={setCredentials(setClient)} />}
    </ApiContext.Provider>
  );
}

export const ApiConsumer = ApiContext.Consumer;
