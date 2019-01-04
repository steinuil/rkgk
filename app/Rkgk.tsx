import * as React from 'react';
import { Login } from './Login';
import { NavBar } from './NavBar';

export const Rkgk = () => {
  const handleLogin = () => {};

  return (
    <div>
      <NavBar title="rkgk" />
      <Login onSubmit={handleLogin} />
    </div>
  );
};
