// Root react component.
// Manages the login tokens and outputs
// the main page or the login page accordingly.
import * as React from "react";
import * as Login from "./Login";
import * as Pixiv from "../pixiv";
import { LoadPage } from "./Loading";
import { Browser } from "./Browser";


// null      -> NO
// undefined -> MAYBE
// T         -> YES
export type Status<T> = null | undefined | T;
const maybe = undefined;


export interface State {
  api: Status<Pixiv.API>;
  account: null | Pixiv.MyInfo;
}


export class App extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);

    // Attempt to retrieve a previously stored refresh token from localStorage,
    // otherwise set the state to null.
    const token = window.localStorage.getItem('rkgk_token');
    if (token) {
      this.state = { api: maybe, account: null };
      (new Pixiv.API()).init(token)
        .then(([api, info]) =>
          this.setState({ api: api, account: info }))
        .catch(err => {
          console.log(err);
          this.setState({ api: null });
          window.localStorage.removeItem('rkgk_token');
        });
    } else {
      this.state = { api: null, account: null };
    }
  }

  handleLogin(args: [Pixiv.Tokens, Pixiv.MyInfo]) {
    let [tokens, info] = args;
    window.localStorage.setItem('rkgk_token', tokens.refresh);
    (new Pixiv.API()).init(tokens.refresh, tokens.access, tokens.expires)
      .then(([api, _]) => this.setState({ api: api, account: info }));
  }

  render() {
    const main =
      (this.state.api === null)  ?
        <Login.Form onLogin={this.handleLogin.bind(this)} />
    : (this.state.api === maybe) ?
        <LoadPage text="logging in" />
    : // api is available
        <Browser api={this.state.api} />

    return main;
  }
}
