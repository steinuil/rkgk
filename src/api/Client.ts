import { Params } from './Params';

export type Credentials = Token | Password | Logged;

export interface Token {
  state: 'token';
  refreshToken: string;
}

export interface Password {
  state: 'password';
  username: string;
  password: string;
}

export interface Logged {
  state: 'logged';
  refreshToken: string;
  accessToken: string;
  expires: Date;
}
export interface Options {
  url: string;
  method: 'GET' | 'POST';
  params: Params | URLSearchParams;
}

export interface Domains {
  api: string;
  auth: string;
}

export class InvalidCredentials extends Error {
  constructor() {
    super();
    Object.setPrototypeOf(this, InvalidCredentials.prototype);
  }
}

export abstract class Client {
  //@ts-ignore
  constructor(protected creds: Credentials, protected domains: Domains) {}

  setCredentials = (username: string, password: string) => {
    this.creds = {
      state: 'password',
      username,
      password,
    };
  };

  abstract request: <T>(options: Options) => Promise<T>;
  abstract forceRefresh: () => Promise<void>;
}
