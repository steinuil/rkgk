import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Pixiv from "./pixiv/api";
import { App } from "./gui/App";

ReactDOM.render(
  <App api={Pixiv.API} />,
  document.body
);
