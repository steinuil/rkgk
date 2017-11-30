import * as React from "react";
import * as Pixiv from "../pixiv/api";
import * as Notify from "./Notify";
import LoginForm from "./Login";



export interface Props {
  api: typeof Pixiv.API;
}


export interface State {
  notifs: Notify.State;
}


export class App extends React.Component<Props, State> {
  state = {
    notifs: { list: [], counter: 0 }
  };


  componentDidMount() {
    // try to log in with the refresh token
  }


  private addNotif = (msg?: string) => {
    if (!msg) return;

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


  render() {
    return <div>
        <LoginForm initialUsername={undefined} onSubmit={(u, p) => console.log(u)}
          notify={(msg) => this.addNotif(msg)} />
        <Notify.Box notifs={this.state.notifs.list} onDismiss={id => this.dismissNotif(id)} />
      </div>;
  }
}
