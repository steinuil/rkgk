import * as React from "react";
import * as Pixiv from "../pixiv/api";
import Thumbnail from "./Thumbnail";
import { Illust, Paged } from "../pixiv/types";


export interface Props {
  api: Pixiv.API;
  notify: (msg: any) => void;
}


export interface State {
  detail: Illust | null;
  list?: {
    illusts: Array<Illust>;
    title: string;
    nextPage: (() => Promise<Paged<Array<Illust>>>) | null;
  };
}


export default class Browser extends React.Component<Props, State> {
  state: State = { detail: null };

  componentDidMount() {
    this.props.api.feed().then(
      ([illusts, more]) => this.setState({
        list: {
          title: "My feed",
          illusts: illusts,
          nextPage: more
        }
      }),
      this.props.notify
    );
  }


  private viewDetail = (id: number) => {
    const list = this.state.list;
    if (!list) return;
    const work = list.illusts.find((w) => w.id === id);
    if (!work) return;
    this.setState({ detail: work });
  };


  render() {
    const list = this.state.list;
    const main = list
      ? list.illusts.map(w =>
          <Thumbnail key={w.id} work={w} notify={(msg) => this.props.notify(msg)}
            onClick={(id) => this.viewDetail(id)} />
          )
      : null;

    const work = this.state.detail;
    const detail = work
      ? <section id="detail">
          <div id="images">{work.images.map(url => <img key={url} src={"http://localhost:9292/" + url} />)}</div>
          <div>https://pixiv.net/member_illust.php?mode=medium&illust_id={work.id}</div>
          <div>{work.title}</div>
        </section>
      : <section id="detail"></section>;

    return <main>
      <section id="list">
        {main}
      </section>
      {detail}
    </main>;
  }
}
