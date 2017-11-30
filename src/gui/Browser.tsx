import * as React from "react";
import * as Pixiv from "../pixiv/api";
import { Illust, Paged } from "../pixiv/types";
import Thumbnail from "./Thumbnail";


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


  private Detail = () => {
    const work = this.state.detail;
    if (!work)
      return <section id="detail">click on an illustration to start</section>;

    const images = work.images.map((url) =>
      <img key={url} src={"http://localhost:9292/" + url}/>
    );

    return <section id="detail">
      <div id="images">{images}</div>
      <div>https://pixiv.net/member_illust.php?mode=medium&illust_id={work.id}</div>
      <div>{work.title}</div>
    </section>;
  };


  private loadNextPage = async () => {
    const list = this.state.list;
    if (!list) return;
    if (!list.nextPage) return;

    try {
      const [illusts, nextPage] = await list.nextPage();
      this.setState({
        list: {
          title: list.title,
          illusts: list.illusts.concat(illusts),
          nextPage
        }
      });
    } catch (err) {
      this.props.notify(err);
    }
  };


  private List = () => {
    const list = this.state.list;
    if (!list)
      return <section id="list">loading...</section>;

    const thumbs = list.illusts.map((work) =>
      <Thumbnail key={work.id} work={work}
        onClick={(id) => this.viewDetail(id)}
        notify={(msg) => this.props.notify(msg)} />
    );

    return <section id="list">
      <nav>
        <div>{list.title}</div>
      </nav>
      <article>
        <div id="illust-list">{thumbs}</div>
        {list.nextPage && <a className=" button next-page" onClick={() => this.loadNextPage()}>Load more</a>}
      </article>
    </section>;
  };


  render() {
    return <main>
      {this.List()}
      {this.Detail()}
    </main>;
  }
}
