import { Params } from './Params';

export interface Options {
  url: string;
  method: 'GET' | 'POST';
  params: Params | URLSearchParams;
}

export interface Client {
  request: <T>(options: Options) => Promise<T>;
}
