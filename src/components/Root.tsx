// Root react component.
// Manages the login tokens and outputs
// the main page or the login page accordingly.
import * as React from 'react';
import * as Pixiv from '../pixiv';
import { LoadPage, Heart } from './Parts';



// Login form {{{
namespace Login {
  export interface State {
    name: string;
    pass: string;
  }


  export interface Props {
    onSubmit: (name: string, pass: string) => void;
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
      else
        this.props.onSubmit(this.state.name, this.state.pass);
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
} // }}}



// Notifications {{{
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
} // }}}



// Thumbnail {{{
namespace Thumb {
  export interface Props {
    work: Pixiv.Work;
    notify: (message: string) => void;
    bmark: (id: number) => Promise<void>;
    unbmark: (id: number) => Promise<void>;
    onClick: (work: Pixiv.Work) => any;
  }


  export class Thumb extends React.Component<Props, Pixiv.Work> {
    constructor(props: Props) {
      super(props);
      this.state = props.work;
    }


    async toggleBookmark() {
      const d = !this.state.bookmarked;
      this.setState({ bookmarked: d });

      try {
        await (d ? this.props.bmark : this.props.unbmark)(this.state.id);
        this.setState({ bookmarked: d });
      } catch (err) {
        this.setState({ bookmarked: !d });
        this.props.notify(err);
      }
    }


    render() {
      const count = <div className="pages">{this.state.pages}</div>;
      const bmark = <Heart classes="bookmark"
        click={_ => this.toggleBookmark.bind(this)()}
        color={this.state.bookmarked ? "#acc12f" : "white"} />;

      return <a className="thumbnail link illust">
        <img src={Pixiv.proxy(this.state.thumbnail)}
             onClick={() => this.props.onClick(this.state)} />
        {bmark}
        {this.state.pages > 1 ? count : null}
      </a>;
    }
  }
} // }}}



// Browser {{{
namespace Browser {
  export interface State {
    page: null | Page.Works;
  }

  export interface Props {
    api: Pixiv.API;
    notify: (message: string) => void;
  }

  export class Browser extends React.Component<Props, State> {
    constructor(props: Props) {
      super(props);
      this.state = { page: null };

      props.api.feed().then(
        ([res, more]) => this.setState({ page: {
          type: 'works', illusts: res, nextPage: more, info: { title: 'My feed' }
        } }),
        this.props.notify
      );
    }

    getNextPage() {
      if (!this.state.page || !this.state.page.nextPage) return;
      this.state.page.nextPage().then(
        ([res, more]) => {
          if (this.state.page) {
            this.setState({ page: {
              type: 'works',
              illusts: this.state.page.illusts.concat(res),
              nextPage: more,
              info: this.state.page.info
            } });
          }
        },
        this.props.notify
      );
    }

    getMain() {
      if (!this.state.page) return null;
      switch (this.state.page.type) {
      case 'works':
        return this.state.page.illusts.map(w =>
          <Thumb.Thumb key={w.id} work={w}
              unbmark={id => this.props.api.unbookmark(id)}
              bmark={id => this.props.api.bookmark(id)}
              onClick={w => this.props.notify(w.title)}
              notify={this.props.notify.bind(this)} />
        );
      }
    }

    render() {
      return <div id='browser-root'>
        <nav>
          {this.state.page ? this.state.page.info.title : 'Top bar'}
        </nav>
        <main>{this.getMain()}</main>
        <footer>
          {this.state.page ? <div onClick={() => this.getNextPage.bind(this)()}>more</div> : null}
        </footer>
      </div>;
    }
  }

  namespace Page {
    export interface Works {
      type: 'works';
      illusts: Array<Pixiv.Work>;
      nextPage: (() => Promise<Pixiv.Paged<Array<Pixiv.Work>>>) | null;
      info: {
        title: string;
      }
    }
  }
} // }}}



// Root app {{{
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
      Pixiv.API.init(this.handleInvalidToken.bind(this), token).then(
        this.handleLogin.bind(this),
        this.handleInvalidToken.bind(this)
      );
    } else {
      this.state = { api: null, account: null, notifs: [] };
    }
  }


  handleInvalidToken(err?: string) {
    this.notify(err ? err : 'Invalid token, try logging in again');
    this.setState({ api: null });
    window.localStorage.removeItem('rkgk_token');
  }


  handleCredentials(name: string, pass: string) {
    Pixiv.API.init(
      this.handleInvalidToken.bind(this),
      { name: name, pass: pass }
    ).then(
      this.handleLogin.bind(this),
      this.handleInvalidToken.bind(this)
    );
  }


  handleLogin(args: [Pixiv.API, Pixiv.MyInfo]) {
    const [api, info] = args;
    this.setState({ api: api, account: info });
    window.localStorage.setItem('rkgk_token', api.tokens.refresh);
  }


  notify(message?: string) {
    if (!message) return;
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
      return <Login.Form notify={this.notify.bind(this)}
          onSubmit={this.handleCredentials.bind(this)} />;
    else if (this.state.api === 'maybe')
      return <LoadPage text='logging in' />;
    else
      return <Browser.Browser api={this.state.api}
          notify={this.notify.bind(this)} />;
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
} // }}}
