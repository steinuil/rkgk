import { Failure } from './types';


export type Method = "GET" | "POST" | "PUT" | "DELETE";


export const request = (
  method: Method,
  url: string,
  headers: Array<[string, string]>,
  params: Array<[string, string]>
): Promise<string> => {
  const xhr  = new XMLHttpRequest(),
        body = new URLSearchParams();

  xhr.open(method, url);

  for (const [name, content] of headers)
    xhr.setRequestHeader(name, content);

  for (const [name, content] of params)
    body.append(name, content);

  return new Promise((resolve, reject) => {
    xhr.addEventListener("load", ev => {
      const target = ev.target as XMLHttpRequest;
      const { status, responseText } = target;
      if (status >= 200 && status < 300)
        resolve(responseText);
      else
        reject({ kind: "server", msg: responseText });
    });

    xhr.addEventListener("error", err => {
      reject({ kind: "network", msg: "Couldn't connect to the server" });
    });

    if (!navigator.onLine) {
      reject({ kind: "network", msg: "You are offline" });
    } else {
      xhr.send(body);
    }
  });
};
