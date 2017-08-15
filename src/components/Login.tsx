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
  onLogin: any;
  //onLogin: ([Pixiv.Tokens, Pixiv.MyInfo]) => void;
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
    Pixiv.login(this.state.name, this.state.password)
      .then(this.props.onLogin.bind(this))
      .catch(console.log);
  }

  render() {
    return <div id="login-root">
      <input type="text"
        onChange={this.setName.bind(this)}
        placeholder="username or email" />
      <input type="password"
        onChange={this.setPass.bind(this)}
        placeholder="password" />
      <button onClick={this.submit.bind(this)}>
        submit
      </button>
    </div>;
  }
}
