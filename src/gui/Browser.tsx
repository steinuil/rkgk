import * as React from "react";
import * as Pixiv from "../pixiv/api";
import { NextPage, Illust } from "../pixiv/types";
import Thumbnail from "./Thumbnail";


export interface Props {
  api: Pixiv.API;
  notify: (msg: any) => void;
}


export interface State {
  illustCache: { [id: number]: Illust; };
  detail: number | null;
  list: ListState | null;
}


// The page is a timestamp (provided with performance.now()) that
// changes every time the current page is updated, so that "next page"
// requests know when now to append their output.
export interface ListState extends Page { page: number; }

export interface Page {
  title: string;
  illusts: Array<number>;
  nextPage: NextPage<Array<Illust>> | null;
}


export default class Browser extends React.Component<Props, State> {
  state: State = {
    illustCache: {},
    detail: null,
    list: null
  };


  componentDidMount() {
    this.props.api.feed().then(
      ([illusts, nextPage]) => this.changePage("My feed", illusts, nextPage),
      this.props.notify
    );
  }


  private cacheIllusts = (illusts: Array<Illust>): Array<number> => {
    const illustHash: { [id: number]: Illust } = {};
    const ids: Array<number> = [];
    illusts.forEach((i) => {
      illustHash[i.id] = i;
      ids.push(i.id);
    });

    this.setState((prev) => {
      return { illustCache: { ...prev.illustCache, ...illustHash } };
    });

    return ids;
  };


  private changePage = (title: string, illusts: Array<Illust>, nextPage: NextPage<Array<Illust>> | null) => {
    const prevPage = this.state.list && this.state.list.page;
    const ids = this.cacheIllusts(illusts);

    this.setState((prev) => {
      const page = prev.list && prev.list.page;
      if (page && page !== prevPage) return;
      return {
        list: {
          page: performance.now(),
          illusts: ids,
          title, nextPage
        }
      };
    });
  };


  private loadNextPage = async () => {
    const list = this.state.list
    if (!list || !list.nextPage) return;
    const prevPage = list.page;

    try {
      const [illusts, nextPage] = await list.nextPage();
      const ids = list.illusts.concat(this.cacheIllusts(illusts));

      this.setState((prev) => {
        const list = prev.list;
        if (!list || list.page !== prevPage) return;
        return {
          list: {
            page: performance.now(),
            illusts: ids,
            title: list.title,
            nextPage
          }
        };
      });
    } catch (err) {
      this.props.notify(err);
    }
  };


  private List = () => {
    const list = this.state.list;

    if (!list)
      return <section id="list">loading...</section>;

    const illusts: Array<Illust> = [];
    list.illusts.forEach((id) => {
      const i = this.state.illustCache[id];
      if (i) illusts.push(i);
    });

    const thumbs = illusts.map((work) =>
      <Thumbnail key={work.id} work={work}
        onClick={(detail) => this.setState({ detail })}
        notify={(msg) => this.props.notify(msg)} />
    );

    const nextPage = list.nextPage &&
      <a className="button next-page" onClick={() => this.loadNextPage()}>
        Load more
      </a>;

    return <section id="list">
      <nav><div>{list.title}</div></nav>
      <article>
        <div id="illust-list">{thumbs}</div>
        {nextPage}
      </article>
    </section>;
  };


  private Detail = () => {
    const id = this.state.detail;
    const illust = id && this.state.illustCache[id];

    if (!illust)
      return <section id="detail" />;

    const images = illust.images.map((url) =>
      <img key={url} src={"http://localhost:9292/" + url}/>
    );

    return <section id="detail">
      <div id="images">{images}</div>
      <div>https://pixiv.net/member_illust.php?mode=medium&illust_id={illust.id}</div>
      <div>{illust.title}</div>
    </section>;
  };


  render() {
    return <main>
      {this.List()}
      {this.Detail()}
    </main>;
  }
}
