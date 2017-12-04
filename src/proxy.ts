export const img = (urlStr: string) => {
  const url = new URL(urlStr);
  url.protocol = "http";
  url.host = "localhost:9393";
  url.pathname = "/pixiv/img" + url.pathname;
  return url.toString();
}
