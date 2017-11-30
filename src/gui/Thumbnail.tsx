import * as React from "react";
import { Work } from "../pixiv/types";


export interface Props {
  work:    Work;
  notify:  (msg: any) => void;
  onClick: (id: number) => void;
}


export default (props: Props) => {
  const count = <div className="pages">{props.work.pages}</div>;
  return <a className="thumbnail link illust">
    <img src={"http://localhost:9292/" + props.work.thumbnail}
      onClick={() => props.onClick(props.work.id)} />
    {props.work.pages > 1 ? count : null}
  </a>;
};
