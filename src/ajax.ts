export type Method = "GET" | "POST" | "PUT" | "DELETE";


export function request(
  method: Method, url: string, headers?: Array<[string, string]>, data?: any
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);

    let params: any;

    if (data instanceof Array) {
      params = data.map(([name, content]) =>
        encodeURIComponent(name) + '=' + encodeURIComponent(content)
      ).join('&');
    }

    if (headers) {
      for (const [name, content] of headers) {
        xhr.setRequestHeader(name, content);
      }
    }

    xhr.addEventListener('load', e => {
      const target = e.target as XMLHttpRequest;
      const { status, responseText } = target;
      if (status >= 200 && status < 300)
        resolve(responseText);
      else
        reject({ status: status, body: responseText });
    });

    xhr.addEventListener('error', e => {
      const target = e.target as XMLHttpRequest;
      const { status, responseText } = target;
      reject({ status: status, body: responseText });
    });

    xhr.send(params);
  });
}
