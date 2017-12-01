import * as React from "react";


export interface Props {
  className: string;
  color: string;
  onClick: () => any;
}


export default (props: Props) =>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"
      className={"button " + props.className} onClick={props.onClick} >
    <path fill={props.color} stroke="#45425a" className="heart"
        d="M 30,52  l -20,-20  c -10,-10 0,-30 20,-20  c 20,-10 30,10 20,20 Z" />
  </svg>;
