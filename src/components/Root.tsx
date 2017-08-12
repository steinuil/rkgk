import * as React from "react";
import * as Login from "./Login";


/*
export interface AppState {
  login: null | {
    token: {
      access: string;
      refresh: string;
      expires: Date;
    };
  };
}
*/


export interface AppState {
  login: null | string;
}


export class App extends React.Component<{}, AppState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      login: null
    };
  }

  handleLogin(token: string) {
    this.setState({ login: token });
  }

  render() {
    return <div>
      <Login.Form onLogin={this.handleLogin.bind(this)} />
      <code>Login: {this.state.login}</code>
    </div>;
  }
}
