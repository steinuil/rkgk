// Login form window.
// TODO: reject if the fields are empty or there's other irregularities,
// error messages
import * as React from "react";
import * as Pixiv from "../pixiv";


export interface State {
  name: string;
  password: string;
}


export interface Props {
  onLogin: (resp: [Pixiv.Tokens, Pixiv.MyInfo]) => void;
  notify: (msg: string) => any;
}


export class Form extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      name: "",
      password: ""
    };
  }

  setName(ev: React.FormEvent<HTMLInputElement>) {
    const target = ev.target as HTMLInputElement;
    this.setState({ name: target.value });
  }

  setPass(ev: React.FormEvent<HTMLInputElement>) {
    const target = ev.target as HTMLInputElement;
    this.setState({ password: target.value });
  }

  submit(ev: React.MouseEvent<HTMLButtonElement>) {
    ev.preventDefault();
    if (this.state.name === '' || this.state.password === '')
      this.props.notify('The login fields can\'t be empty');
    else if (!navigator.onLine)
      this.props.notify('You are offline');
    else
      Pixiv.login(this.state.name, this.state.password).then(
        this.props.onLogin.bind(this),
        e => {
          if (e.slice(0,3) === '103')
            this.props.notify('Incorrect username or password');
          else
            this.props.notify(e);
        });
  }

  render() {
    return <form id="login-root">
      <input type="text" className="text-box"
        onChange={this.setName.bind(this)}
        placeholder="username or email" />
      <input type="password" className="text-box"
        onChange={this.setPass.bind(this)}
        placeholder="password" />
      <input type="submit" onClick={this.submit.bind(this)}
        value="submit" className="button" />
    </form>;
  }
}
