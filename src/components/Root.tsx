import * as React from "react";
import * as Login from "./Login";


export interface AppState {
  login: null | {
    token: {
      access: string;
      refresh: string;
      expires: Date;
    };
  };
}


export class App extends React.Component<{}, AppState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      login: null
    };
  }

  handleLogin(login: Login.Props) {
    console.log(login);
  }

  render() {
    return <div>
      <Login.Form onLogin={this.handleLogin.bind(this)} />
    </div>;
  }
}
