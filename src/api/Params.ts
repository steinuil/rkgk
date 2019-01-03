/** The type of possible endpoint parameters. */
export type Params = Array<[string, Param]>;

// We include `undefined` in the type to allow optional parameters to be left
// out when calling the function, and then filtered out in API#apiReq.
export type Param =
  | string
  | number
  | Date
  | Array<string>
  | Array<number>
  | undefined;

export const toURLSearchParams = (params: Params): URLSearchParams => {
  const out = new URLSearchParams();

  for (const [name, param] of params) {
    if (!param && param !== 0) {
      continue;
    }

    if (param instanceof Date) {
      out.append(
        name,
        `${param.getFullYear()}-${param.getMonth() + 1}-${param.getDate()}`
      );
    } else if (param instanceof Array) {
      for (const [i, c] of param.entries()) {
        out.append(`${name}[${i}]`, c.toString());
      }
    } else {
      out.append(name, param.toString());
    }
  }

  return out;
};
