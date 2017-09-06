import * as React from "react";


export const Loader = (props: { floating: boolean }) =>
  <div className={"loader" + (props.floating ? "floating" : "")}>
    <div className="box" />
    <div className="box" />
    <div className="box" />
    <div className="box" />
    <div className="box" />
    <div className="box" />
  </div>;


export const LoadPage = (props: { text: string }) =>
  <div id="loader-root">
    <Loader floating={false} />
    <p>{props.text}</p>
  </div>;


export const Heart =
  (props: { classes: string, color: string, click: (ev: any) => any }) =>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"
        className={"button " + props.classes} onClick={props.click} >
      <path fill={props.color} stroke="#45425a" className="heart"
          d="M 30,52  l -20,-20  c -10,-10 0,-30 20,-20  c 20,-10 30,10 20,20 Z" />
    </svg>;
