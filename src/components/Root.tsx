// Root react component.
// Manages the login tokens and outputs
// the main page or the login page accordingly.
import * as React from 'react';
import * as Pixiv from '../pixiv';
import { LoadPage } from './Parts';
import { Browser } from './Browser';



////////////////
// LOGIN FORM
////////////////
namespace Login {
  export interface State {
    name: string;
    pass: string;
  }


  export interface Props {
    onLogin: (resp: [Pixiv.API, Pixiv.MyInfo]) => void;
    notify: (msg: string) => any;
  }


  // The Login.form component handles logins with
  // username and password, which occurs when the
  // access and refresh tokens are invalid.
  export class Form extends React.Component<Props, State> {
    constructor(props: Props) {
      super(props);
      this.state = { name: '', pass: '' };
    }


    setName(ev: React.FormEvent<HTMLInputElement>) {
      const target = ev.target as HTMLInputElement;
      this.setState({ name: target.value });
    }


    setPass(ev: React.FormEvent<HTMLInputElement>) {
      const target = ev.target as HTMLInputElement;
      this.setState({ pass: target.value });
    }


    async submit(ev: React.MouseEvent<HTMLButtonElement>) {
      ev.preventDefault();

      if (this.state.name === '' || this.state.pass === '')
        this.props.notify('The login fields can\'t be empty');
      else if (!navigator.onLine)
        this.props.notify('You are offline');
      else {
        // Try to log in from inside the form, so we can handle
        // failure by not changing anything.
        try {
          // Success!
          this.props.onLogin(await Pixiv.API.init(this.state));

        } catch(err) {
          if (err.slice(0,3) === '103')
            this.props.notify('Incorrect username or password');
          else
            this.props.notify(err);
        }
      }
    }


    render() {
      return <form id='login-root'>
        <input type='text' className='text-box'
            value={this.state.name}
            onChange={this.setName.bind(this)}
            placeholder='username or email' />
        <input type='password' className='text-box'
            value={this.state.pass}
            onChange={this.setPass.bind(this)}
            placeholder='password' />
        <input type='submit' onClick={this.submit.bind(this)}
            value='submit' className='button' />
      </form>;
    }
  }
}



///////////////////
// NOTIFICATIONS
///////////////////
export namespace Notif {
  export interface t {
    id: number;
    message: string;
  }


  export interface Props {
    notif: t;
    onClick: (id: number) => any;
  }


  export function make(message: string) {
    return { id: (new Date()).getTime(), message: message };
  }


  export const Toast = (props: Props) =>
    <div className="notification">
      <p>{props.notif.message}</p>
      <svg xmlns="http://www.w3.org/2000/svg"
          className="button cross" viewBox="0 0 50 50"
          onClick={_ => props.onClick(props.notif.id)}>
        <line x1="5" y1="5" x2="45" y2="45" />
        <line x1="45" y="5" x2="5" y2="45" />
      </svg>
    </div>;
}



//////////////
// ROOT APP
//////////////
export type Status<T> = null | 'maybe' | T;



export interface State {
  api: Status<Pixiv.API>;
  account: Pixiv.MyInfo | null;
  notifs: Array<Notif.t>;
}



export class App extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);

    const token = window.localStorage.getItem('rkgk_token');

    if (token) {
      this.state = { api: 'maybe', account: null, notifs: [] };
      Pixiv.API.init(token).then(
        this.handleLogin.bind(this),

        err => {
          this.notify(err);
          this.setState({ api: null });
          window.localStorage.removeItem('rkgk_token');
        });

    } else {
      this.state = { api: null, account: null, notifs: [] };
    }
  }


  handleLogin(args: [Pixiv.API, Pixiv.MyInfo]) {
    const [api, info] = args;
    this.setState({ api: api, account: info });
    window.localStorage.setItem('rkgk_token', api.tokens.refresh);
  }


  notify(message: string) {
    const notif = Notif.make(message);
    this.setState({
      notifs: this.state.notifs.concat([notif])
    });
  }


  dismissNotif(id: number) {
    this.setState({
      notifs: this.state.notifs.filter(n => n.id != id)
    });
  }


  getMain() {
    if (!this.state.api)
      return <Login.Form onLogin={this.handleLogin.bind(this)}
          notify={msg => this.notify(msg)} />;
    else if (this.state.api === 'maybe')
      return <LoadPage text='logging in' />;
    else
      return <Browser api={this.state.api}
          notify={msg => this.notify(msg)} />;
  }


  render() {
    const notifs = this.state.notifs.map(n =>
      <Notif.Toast key={n.id}  notif={n}
          onClick={id => this.dismissNotif(id)} />
    );

    return <div id='page-root'>
      {this.getMain()}
      <div id='notif-box'>
        {notifs}
      </div>
    </div>;
  }
}
