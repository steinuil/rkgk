/*
import * as React from 'react';
import * as Pixiv from '../pixiv';
import { Heart } from './Parts';




export interface ThumbProps {
  work: Pixiv.Work;
  notify: (message: string) => void;
  bmark: (id: number) => Promise<void>;
  unbmark: (id: number) => Promise<void>;
}


export class Thumb extends React.Component<ThumbProps,Pixiv.Work> {
  constructor(props: ThumbProps) {
    super(props);
    this.state = props.work;
  }

  async toggleBookmark() {
    const d = !this.state.bookmarked;
    // Optimistically handle the event
    this.setState({ bookmarked: d });

    try {
      await (d ? this.props.bmark : this.props.unbmark)(this.state.id);
      this.setState({ bookmarked: d });
    } catch(e) {
      this.setState({ bookmarked: !d });
      this.props.notify(e);
    }
  }

  render() {
    const count = <div className="pages">{this.state.pages}</div>;
    const bmark = <Heart classes="bookmark"
      click={_ => this.toggleBookmark.bind(this)()}
      color={this.state.bookmarked ? "#acc12f" : "white"} />;

    return <a className="thumbnail link illust">
      <img src={Pixiv.proxy(this.state.thumbnail)} />
      {bmark}
      {this.state.pages > 1 ? count : null}
    </a>;
  }
}


export interface Props {
  api: Pixiv.API;
  notify: (message: string) => void;
}


export interface State {
  list: Array<Pixiv.Work>;
}


export class Browser extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    props.api.feed().then(
      res => this.setState({ list: res }),
      this.props.notify
    );

    this.state = {
      list: []
    };
  }


  render() {
    const main = this.state.list.map(w =>
      <Thumb key={w.id} work={w}
          unbmark={id => this.props.api.unbookmark(id)}
          bmark={id => this.props.api.bookmark(id)}
          notify={this.props.notify}/>);

    return <div id="browser-root">{main}</div>;
  }
}
*/
