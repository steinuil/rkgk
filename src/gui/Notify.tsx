import * as React from "react";


export interface Notif {
  id: number;
  message: string;
}


interface ToastProps {
  notif: Notif;
  onClick: (id: number) => void;
}


const Toast = (props: ToastProps) =>
  <div className="notification">
    <p>{props.notif.message}</p>
    <svg xmlns="http://www.w3.org/2000/svg"
        className="clickable cross" viewBox="0 0 50 50"
        onClick={_ => props.onClick(props.notif.id)} >
      <line x1="5" y1="5" x2="45" y2="45" />
      <line x1="45" y="5" x2="5" y2="45" />
    </svg>
  </div>;


export interface State {
  list: Array<Notif>;
  counter: number;
}


export interface BoxProps {
  notifs: Array<Notif>;
  onDismiss: (id: number) => void;
}


export const Box = (props: BoxProps) => {
  const notifs = props.notifs.map((n) =>
    <Toast key={n.id} notif={n} onClick={props.onDismiss} />
  );

  return <div id="notif-box">{notifs}</div>;
};
