import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Ajax from "./ajax";
import * as Pixiv from "./pixiv";

//import { Hello } from "./components/Hello";


const Sup = (props: { name: string; }) =>
  <ul>{[0, 1, 2, 3, 4].map(i => <li key={i}>{i} {props.name}</li>)}</ul>


//Ajax.request(Ajax.Method.GET, 'http://sgt.hootr.club')
//  .then(_ => console.log('succ'));

ReactDOM.render(
  <Sup name="Mugi" />,
  document.getElementById("root")
);
