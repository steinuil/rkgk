export type Method = "GET" | "POST";


export const request = <T,E>(
  method: Method,
  url: string,
  headers: Array<[string, string]>,
  params: Array<[string, string]>,
  getError: (err: E) => string
): Promise<T> => {
  const xhr  = new XMLHttpRequest(),
        body = new URLSearchParams();

  for (const [name, content] of params)
    body.append(name, content);

  if (method === "GET")
    url += "?" + body.toString()

  xhr.open(method, "http://localhost:9292/" + encodeURI(url));

  if (method === "POST")
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

  for (const [name, content] of headers)
    xhr.setRequestHeader(name, content);

  return new Promise((resolve, reject) => {
    xhr.addEventListener("load", ev => {
      const target = ev.target as XMLHttpRequest;
      const { status, responseText } = target;
      if (status >= 200 && status < 300) {
        try {
          resolve(parseMessage<T>(responseText));
        } catch (_) {
          reject({ kind: "parse", msg: "Failed to parse the response" });
        }
      } else {
        try {
          const errorMsg = getError(parseMessage<E>(responseText));
          reject({ kind: "server", msg: errorMsg });
        } catch (_) {
          reject({ kind: "parse", msg: "Failed to parse the error message" });
        }
      }
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


const parseMessage = <T>(msg: string): T => {
  const json: T = JSON.parse(msg);
  return json;
};
