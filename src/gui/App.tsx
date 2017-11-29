import * as React from "react";
import * as Pixiv from "../pixiv/api";
import LoginForm from "./Login";


export interface Props {
  api: typeof Pixiv.API;
}


export interface State {
}


export class App extends React.Component<Props, State> {
  render() {
    return <div>
        <LoginForm initialUsername={undefined} onSubmit={(u, p) => console.log(u)}
          notify={(msg) => console.log(msg)} />
      </div>;
  }
}
