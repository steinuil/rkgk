import * as React from "react";
import * as Pixiv from "../pixiv";
import { Heart } from "./Parts";


interface ThumbProps {
  work: Pixiv.Work;
  bmark: (id: number) => Promise<string>;
  unbmark: (id: number) => Promise<string>;
}


class Thumb extends React.Component<ThumbProps,Pixiv.Work> {
  constructor(props: ThumbProps) {
    super(props);
    this.state = props.work;
  }

  toggleBookmark() {
    const d = !this.state.bookmarked;
    // Optimistically handle the event
    this.setState({ bookmarked: d });

    (d ? this.props.bmark : this.props.unbmark)(this.state.id)
      .then(r => this.setState({ bookmarked: d }))
      .catch(r => {
        this.setState({ bookmarked: !d });
        console.log(r);
      });
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
}


export interface State {
  list: Array<Pixiv.Work>;
}


export class Browser extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    props.api.feed()
      .then(res => this.setState({
        list: res
      }))
      .catch(e => console.log(e));

    this.state = {
      list: []
    };
  }

  render() {
    return <div id="browser-root">
      {this.state.list.map(w =>
        <Thumb key={w.id} work={w}
          unbmark={id => this.props.api.unbookmark(id)}
          bmark={id => this.props.api.bookmark(id)} />)}
    </div>;
  }
}
