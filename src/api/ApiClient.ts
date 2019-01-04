import { Client, Options } from './Client';
import * as Params from './Params';
import { ApiError, AuthError, Login } from './Raw';

export interface Domains {
  api: string;
  auth: string;
}

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

export class InvalidCredentials extends Error {
  constructor() {
    super();
    Object.setPrototypeOf(this, InvalidCredentials.prototype);
  }
}

export class ApiClient implements Client {
  constructor(private creds: Credentials, private domains: Domains) {}

  forceRefresh = async () => {
    await this.refresh(true);
  };

  setCredentials = (username: string, password: string) => {
    this.creds = {
      state: 'password',
      username,
      password,
    };
  };

  private refresh = async (force = false): Promise<string> => {
    const c = this.creds;

    if (!force && c.state === 'logged' && c.expires > new Date()) {
      return c.accessToken;
    }

    const params = [
      ['get_secure_url', 'true'],
      ['client_id', 'MOBrBDS8blbauoSck0ZfDbtuzpyT'],
      ['client_secret', 'lsACyCD94FhDUtGTXi3QzcFE2uU1hqtDaKeqrdwj'],
    ];

    if (c.state === 'logged' || c.state === 'token') {
      params.push(
        ['grant_type', 'refresh_token'],
        ['refresh_token', c.refreshToken]
      );
    } else {
      params.push(
        ['grant_type', 'password'],
        ['username', c.username],
        ['password', c.password]
      );
    }

    const headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');

    const outParams = new URLSearchParams();
    for (const [name, content] of params) {
      outParams.append(name, content);
    }

    const r = await fetch(this.domains.auth, {
      method: 'POST',
      headers: headers,
      body: outParams.toString(),
    });

    if (!r.ok) {
      try {
        const e: AuthError = await r.json();
        const err = e.errors.system.message;
        if (err.slice(0, 3) === '103') {
          throw new InvalidCredentials();
        } else {
          throw new Error('Server returned error on login: ' + err.toString());
        }
      } catch (e) {
        throw new Error("Couldn't parse server error: " + e.toString());
      }
    }

    try {
      // Parse the response and cache the credentials for future requests
      const resp: Login = await r.json();
      const expires = new Date(
        new Date().getTime() + resp.response.expires_in * 1000
      );

      this.creds = {
        state: 'logged',
        accessToken: resp.response.access_token,
        refreshToken: resp.response.refresh_token,
        expires: expires,
      };

      return resp.response.access_token;
    } catch (e) {
      throw new Error(
        "Couldn't parse server response on login: " + e.toString()
      );
    }
  };

  request = async <T>(opts: Options): Promise<T> => {
    const token = await this.refresh();

    const headers = new Headers();
    headers.append('Authorization', `Bearer ${token}`);

    const params =
      opts.params instanceof URLSearchParams
        ? opts.params
        : Params.toURLSearchParams(opts.params);

    const url = this.domains.api + opts.url + '?' + params.toString();

    const resp = await fetch(url, {
      method: opts.method,
      headers,
    });

    if (!resp.ok) {
      try {
        const e: ApiError = await resp.json();
        if (!e.error) {
          throw new Error("Couldn't parse server error: " + e.toString());
        }

        const err = e.error.user_message || e.error.message;
        if (err.slice(-13) === 'invalid_grant') {
          // The token is invalid or has expired; retry
          await this.forceRefresh();
          return this.request<T>(opts);
        }

        throw new Error('Server returned error: ' + err);
      } catch (e) {
        throw new Error("Couldn't parse server error: " + e.toString());
      }
    }

    try {
      return resp.json();
    } catch (e) {
      throw new Error('Invalid server response' + e.toString());
    }
  };
}
