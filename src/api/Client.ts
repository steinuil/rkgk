import { Credentials } from './Credentials';
import { Params } from './Params';

export interface Options {
  url: string;
  method: 'GET' | 'POST';
  params: Params | URLSearchParams;
}

export interface Domains {
  api: string;
  auth: string;
}

export abstract class Client {
  //@ts-ignore
  constructor(private creds: Credentials, private domains: Domains) {}
  abstract request: <T>(options: Options) => Promise<T>;
  abstract forceRefresh: () => Promise<void>;
}
