import * as React from "react";


export interface State {
  name: string;
  password: string;
}


export interface Props {
  onLogin: (token: string) => void;
}


export class Form extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      name: "steinuil@example.com",
      password: "password"
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
    this.props.onLogin(this.state.name);
  }

  render() {
    return <div>
      <input type="text"
        onChange={this.setName.bind(this)}
        placeholder="user name or email" />
      <input type="password"
        onChange={this.setPass.bind(this)}
        placeholder="password" />
      <button onClick={this.submit.bind(this)}>
        Submit
      </button>
    </div>;
  }
}
