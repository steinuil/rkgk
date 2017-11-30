import * as React from "react";
import * as Pixiv from "../pixiv/api";
import { Failure } from "../pixiv/types";
import * as Notify from "./Notify";
import Browser from "./Browser";
import LoginForm from "./Login";


export interface Props {
  api: typeof Pixiv.API;
}


export interface State {
  notifs: Notify.State;
  api: Pixiv.API | null;
}


export class App extends React.Component<Props, State> {
  state = {
    notifs: { list: [], counter: 0 },
    api: null
  };


  componentDidMount() {
    const token = window.localStorage.getItem("rkgk_token");
    if (!token) return;

    const api = new Pixiv.API({ refreshToken: token });
    this.setState({ api });
  }


  private login = (username: string, password: string) => {
    const api = new Pixiv.API({ username, password });
    this.setState({ api });
  };


  private addNotif = (message: any) => {
    if (!message) return;

    let msg: string;

    if (typeof message === "string")
      msg = message;
    else if (message.kind)
      msg = (message as Failure).msg
    else
      msg = message.toString()

    this.setState((prev, _) => {
      const notifs = prev.notifs;
      const notif = {
        id: notifs.counter,
        message: msg
      };

      const newNotifs = {
        list: notifs.list.concat([notif]),
        counter: notifs.counter + 1
      };

      return {
        notifs: newNotifs
      };
    });
  };


  private dismissNotif = (id: number) => {
    this.setState((prev, _) => {
      return {
        notifs: {
          list: prev.notifs.list.filter(n => n.id != id),
          counter: prev.notifs.counter
        }
      };
    });
  };


  private getMain = () => {
    const api = this.state.api;
    const notify = (msg: any) => this.addNotif(msg);
    if (api) {
      return <Browser api={api} notify={notify} />;
    } else {
      return <LoginForm notify={notify} onSubmit={(u, p) => this.login(u, p)} />;
    }
  };


  render() {
    return [
      this.getMain(),
      <Notify.Box notifs={this.state.notifs.list} onDismiss={id => this.dismissNotif(id)} />
    ];
  }
}
