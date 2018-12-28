import * as Credentials from './Credentials';
import * as Params from './Params';
import { Endpoints } from './Endpoints';

interface RequestOptions {
  url: string;
  method: 'GET' | 'POST';
  headers: Headers;
}

interface Client {
  request: <T>(opts: RequestOptions) => Promise<T>;
}

interface Endpoint<T, U> {
  url: string;
  method: 'GET' | 'POST';
  params: Params.t | URLSearchParams;
  unpack: (raw: T) => U;
}

class ApiRequests {
  private creds: Credentials.t;
  private apiUrl: string;
  private tokenAuthUrl: string;

  private client: Client;

  setCredentials = (username: string, password: string): void => {
    this.creds = {
      state: 'password',
      username,
      password,
    };
  };

  request = async <T, U>(endpoint: Endpoint<T, U>): Promise<U> => {
    const token = await this.login();

    const headers = new Headers();
    headers.append('Authorization', `Bearer ${token}`);

    const params =
      endpoint.params instanceof URLSearchParams
        ? endpoint.params
        : Params.toUrlSearchParams(endpoint.params);

    const url = this.apiUrl + endpoint.url + '?' + params.toString();

    try {
      return endpoint.unpack(
        await this.client.request<T>({
          method: endpoint.method,
          url,
          headers,
        })
      );
    } catch (e) {
      if (!e.error) {
        throw new Error("Couldn't parse server error: " + e.toString());
      }

      const err = e.error.user_message || e.error.message;
      if (err.slice(-13) === 'invalid_grant') {
        // The token is invalid or has expired; retry
        return this.request<T, U>(endpoint);
      }

      throw new Error('Server returned error: ' + err);
    }
  };

  private login = async (force = false): Promise<string> => {
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
  };
}
