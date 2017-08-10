import * as React from "react";

export const Hello = (props: { compiler: string; framework: string; }) =>
  <h1>Hello from {props.compiler} and {props.framework}!</h1>;
