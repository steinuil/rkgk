import * as React from "react";


export interface FormProps {
  onSubmit: (username: string, password: string) => void;
  notify: (msg: any) => void;
  initialUsername?: string;
}


export interface FormState {
  username: string;
  password: string;
}


type Inputs = {
  [K in keyof FormState]: HTMLInputElement | undefined;
}


export default class Form extends React.Component<FormProps, FormState> {
  private inputs: Inputs;

  constructor(props: FormProps) {
    super(props);

    this.state = {
      username: props.initialUsername || "",
      password: ""
    };

    this.inputs = {
      username: undefined,
      password: undefined
    };
  }

  private update = (ev: React.FormEvent<HTMLInputElement>) => {
    const target = ev.target as HTMLInputElement;
    // Have to do it this way or the type checker will yell at us
    this.setState((state, _) => {
      if (target.name in this.inputs)
        return { [target.name]: target.value };
    });
  };

  private submit = (ev: React.FormEvent<HTMLInputElement>) => {
    ev.preventDefault();

    for (const key_ in this.state) {
      const key = key_ as keyof FormState;
      if (this.state[key] === "") {
        this.props.notify(`The ${key} field can't be empty`);
        const field = this.inputs[key];
        if (field) field.focus();
        return;
      }
    }

    this.props.onSubmit(this.state.username, this.state.password);
  };

  render() {
    return <form id="login-root">
        <input type="text" className="text-box" placeholder="username or email"
          ref={(input: HTMLInputElement) => this.inputs.username = input} name="username"
          value={this.state.username} onChange={this.update} />
        <input type="password" className="text-box" placeholder="password"
          ref={(input: HTMLInputElement) => this.inputs.password = input} name="password"
          value={this.state.password} onChange={this.update} />
        <input type="submit" className="button" value="submit"
          onClick={this.submit} />
      </form>;
  }
}
