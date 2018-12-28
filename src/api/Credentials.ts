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
