// Root react component.
// Manages the login tokens and outputs
// the main page or the login page accordingly.
import * as React from "react";
import * as Pixiv from "../pixiv";
import * as Login from "./Login";
import { LoadPage } from "./Parts";
import { Browser } from "./Browser";


// null      -> NO
// undefined -> MAYBE
// T         -> YES
export type Status<T> = null | undefined | T;
const maybe = undefined;


export interface Notif {
  id: number;
  message: string;
}


const Toast = (props: { notif: Notif, click: (id: number) => any }) =>
  <div className="notification">
    <p>{props.notif.message}</p>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"
        className="button cross" onClick={_ => props.click(props.notif.id)}>
      <line x1="5" y1="5" x2="45" y2="45" />
      <line x1="45" y="5" x2="5" y2="45" />
    </svg>
  </div>;


const mkNotif = (message: string) => {
  return { id: (new Date()).getTime(), message: message };
}


export interface State {
  api: Status<Pixiv.API>;
  account: null | Pixiv.MyInfo;
  notifs: Array<Notif>;
}


export class App extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);

    // Attempt to retrieve a previously stored refresh token from localStorage,
    // otherwise set the state to null.
    const token = window.localStorage.getItem('rkgk_token');
    if (token) {
      this.state = { api: maybe, account: null, notifs: [] };
      (new Pixiv.API()).init(token)
        .then(([api, info]) =>
          this.setState({ api: api, account: info }))
        .catch(err => {
          console.log(err);
          this.setState({ api: null });
          window.localStorage.removeItem('rkgk_token');
        });
    } else {
      this.state = { api: null, account: null, notifs: [] };
    }
  }

  handleLogin(args: [Pixiv.Tokens, Pixiv.MyInfo]) {
    let [tokens, info] = args;
    window.localStorage.setItem('rkgk_token', tokens.refresh);
    (new Pixiv.API()).init(tokens.refresh, tokens.access, tokens.expires)
      .then(([api, _]) => this.setState({ api: api, account: info }));
  }

  notify(message: string) {
    this.setState({
      notifs: this.state.notifs.concat([
        mkNotif(message)
      ])
    });
  }

  dismissNotif(id: number) {
    this.setState({
      notifs: this.state.notifs.filter(e => e.id != id)
    });
  }

  render() {
    const main =
      (this.state.api === null)  ?
        <Login.Form onLogin={this.handleLogin.bind(this)} notify={msg => this.notify(msg)} />
    : (this.state.api === maybe) ?
        <LoadPage text="logging in" />
    : // api is available
        <Browser api={this.state.api} />

    return <div id="page-root">
      {main}
      <div id="notif-box">
        {this.state.notifs.map(n =>
          <Toast key={n.id} click={id => this.dismissNotif(id)} notif={n} />
        )}
      </div>
    </div>;
  }
}
