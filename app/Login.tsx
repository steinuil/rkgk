import * as React from 'react';
import { useTextInput } from './Hooks';

export interface Props {
  onSubmit: (username: string, password: string) => void;
}

export function Login({ onSubmit }: Props) {
  const [username, setUsername] = useTextInput('');
  const [password, setPassword] = useTextInput('');

  const handleSubmit = (ev: React.SyntheticEvent) => {
    ev.preventDefault();
    onSubmit(username, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="username"
        required
        value={username}
        onChange={setUsername}
      />
      <input
        type="password"
        placeholder="password"
        required
        value={password}
        onChange={setPassword}
      />
      <input type="submit" value="submit" />
    </form>
  );
}
