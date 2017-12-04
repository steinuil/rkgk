import * as React from "react";
import deepmerge = require("deepmerge");
import * as Pixiv from "../pixiv/api";
import { NextPage, Illust } from "../pixiv/types";
import Thumbnail from "./Thumbnail";
import NavBar from "./NavBar";
import * as Proxy from "../proxy";


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
// requests know when now to append its output.
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
      const ids = [...new Set(list.illusts.concat(this.cacheIllusts(illusts)))];

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


  private toggleBookmark = async (id: number) => {
    const illust = this.state.illustCache[id];
    if (!illust) return;

    const state = illust.bookmarked;
    this.setState((prev) => {
      if (!prev.illustCache[id]) return;
      return {
        illustCache: deepmerge(prev.illustCache, {
          [id]: { bookmarked: !state }
        })
      };
    });

    try {
      await (state ? this.props.api.unbookmark : this.props.api.bookmark)(id);
      this.setState((prev) => {
        if (!prev.illustCache[illust.id]) return;
        return {
          illustCache: deepmerge(prev.illustCache, {
            [id]: { bookmarked: !state }
          })
        };
      });
    } catch(err) {
      this.setState((prev) => {
        if (!prev.illustCache[illust.id]) return;
        return {
          illustCache: deepmerge(prev.illustCache, {
            [id]: { bookmarked: state }
          })
        };
      });
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
        toggleBookmark={(id) => this.toggleBookmark(id)}
        notify={(msg) => this.props.notify(msg)} />
    );

    const nextPage = list.nextPage &&
      <a className="button next-page" onClick={() => this.loadNextPage()}>
        Load more
      </a>;

    return <section id="list">
      <NavBar title={list.title} onSubmit={(x) => console.log(x)}
        autoComplete={(q) => this.props.api.autoComplete(q)}
        notify={(msg) => this.props.notify(msg)}/>
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
      <img key={url} src={Proxy.img(url)}/>
    );

    return <section id="detail">
      <div id="images">{images}</div>
      <footer className="info-panel">
        <header>
          <a className="avatar-container">
            <img src={Proxy.img(illust.user.avatar)} />
          </a>
          <div className="info-container">
            <div>
              <span className="username">
                {illust.user.displayName} <span className="atname">@{illust.user.accountName}</span>
              </span>
              {" "}
              <span className="date">{illust.date.toDateString()}</span>
            </div>
            <div title={illust.title} className="title">{illust.title}</div>
          </div>
        </header>
        <article>
          <div className="description" dangerouslySetInnerHTML={{__html: illust.caption}}/>
          <div className="tags">
            {illust.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
          </div>
          <div>
            <a href={"https://pixiv.net/member_illust.php?mode=medium&illust_id=" + illust.id}>share link</a>
          </div>
        </article>
      </footer>
    </section>;
  };


  render() {
    return <main>
      {this.List()}
      {this.Detail()}
    </main>;
  }
}
