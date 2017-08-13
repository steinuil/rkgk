import * as React from "react";
import * as Pixiv from "../pixiv";



export interface Props {
  api: Pixiv.API;
}


export class Browser extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    return <div>
      logged in
    </div>;
  }
}
