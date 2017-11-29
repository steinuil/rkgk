import * as React from "react";
import * as Login from "./login";
import * as Pixiv from "../pixiv/api";


export interface Props {
  api: typeof Pixiv.API;
}


export interface State {
}


export class App extends React.Component<Props, State> {
  render() {
    return <div>
        <Login.Form initialUsername={undefined} onSubmit={(u, p) => console.log(u)}
          notify={(msg) => console.log(msg)} />
      </div>;
  }
}
