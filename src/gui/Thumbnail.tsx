import * as React from "react";
import Heart from "./Heart";
import { Work } from "../pixiv/types";


export interface Props {
  work:    Work;
  notify:  (msg: any) => void;
  onClick: (id: number) => void;
  toggleBookmark: (id: number) => void;
}


export default (props: Props) => {
  const count = <div className="pages">{props.work.pages}</div>;

  return <a className="thumbnail clickable illust">
    <img src={"http://localhost:9292/" + props.work.thumbnail}
      onClick={() => props.onClick(props.work.id)} />
    <Heart className="bookmark" onClick={() => props.toggleBookmark(props.work.id)}
      color={props.work.bookmarked ? "#acc12f" : "white"} />
    {props.work.pages > 1 ? count : null}
  </a>;
};
