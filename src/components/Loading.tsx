import * as React from "react";


export function Loader(props: { floating: boolean }) {
  return <div className={"loader" + (props.floating ? "floating" : "")}>
    <div className="box" />
    <div className="box" />
    <div className="box" />
    <div className="box" />
    <div className="box" />
    <div className="box" />
  </div>;
}


export function LoadPage(props: { text: string }) {
  return <div id="loader-root">
    <Loader floating={false} />
    <p>{props.text}</p>
  </div>;
}
