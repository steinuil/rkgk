import * as React from "react";
import * as Pixiv from "../pixiv";



export interface Props {
  api: Pixiv.API;
}


export interface State {
}


const Thumb = (props: { work: Pixiv.Work }) => {
  const count = <span className="count">{props.work.pages}</span>;
  return <a className="thumbnail link illust">
    <img src={props.work.thumbnail} />
    {props.work.pages > 1 ? count : null}
  </a>;
}


export class Browser extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return <div>
    </div>;
  }
}
