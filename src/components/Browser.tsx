import * as React from "react";
import * as Pixiv from "../pixiv";


interface ThumbProps {
  work: Pixiv.Work;
  bmark: (id: number) => Promise<string>;
}


class Thumb extends React.Component<ThumbProps,{ bookmarked: boolean }> {
  constructor(props: ThumbProps) {
    super(props);
    this.state = {
      bookmarked: props.work.bookmarked
    };
  }

  bookmark() {
    // Optimistically handle the event
    this.setState({ bookmarked: true });

    this.props.bmark(this.props.work.id)
      .then(resp => {
        this.setState({ bookmarked: true });
        console.log(resp);
      })
      .catch(r => {
        this.setState({ bookmarked: false });
        console.log(r);
      });
  }

  render() {
    const count = <div className="pages">{this.props.work.pages}</div>;
    const Bmark = (props: { checked: boolean }) =>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"
        className="bookmark button" onClick={_ => this.bookmark.bind(this)()}>
        <path fill={props.checked ? "#acc12f" : "white"}
          d="M 30,52  l -20,-20  c -10,-10 0,-30 20,-20  c 20,-10 30,10 20,20 Z"
          stroke="#45425a" className="heart" />
      </svg>;
    return <a className="thumbnail link illust">
      <img src={Pixiv.proxy(this.props.work.thumbnail)} />
      <Bmark checked={this.state.bookmarked} />
      {this.props.work.pages > 1 ? count : null}
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
          bmark={(id) => this.props.api.bookmark(id)} />)}
    </div>;
  }
}
