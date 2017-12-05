import * as Ajax from "./ajax";
import * as raw  from "./raw-types";
import * as to   from "./converters";
import { Paged, MyInfo, Illust } from "./types";
import * as Proxy from "../proxy";


export namespace Credentials {
  export type t = Token | Credentials | LoggedIn;

  export interface Token {
    state: "token";
    refreshToken: string;
  }

  export interface Credentials {
    state: "password";
    username: string;
    password: string;
  }

  export interface LoggedIn {
    state: "logged";
    refreshToken : string;
    accessToken: string;
    expires: Date;
  }
}



export namespace Params {
  // We include `undefined` in the type to allow optional parameters to be left
  // out when calling the function, and then filtered out in API#apiRequest.
  export type t = Array<[string, param | undefined]>;

  export type param = string | number | Date;

  export const toString = (param: param): string => {
    if (param instanceof Date) {
      return `${param.getFullYear()}-${param.getMonth() + 1}-${param.getDate()}`;
    } else {
      return param.toString();
    }
  };

  export type WorkType = "illust" | "novel";

  export type Restrict = "public" | "private" | "all";

  export type SearchTarget =
      "partial_match_for_tags"
    | "exact_match_for_tags"
    | "title_and_caption";

  export type Within =
      "within_last_day"
    | "within_last_week"
    | "within_last_month";

  export type SortMode = "date_asc" | "date_desc";
}



export class API {
  private creds: Credentials.t;
  private info: MyInfo | null;

  constructor(args: { refreshToken: string });
  constructor(args: { username: string, password: string });
  constructor(args: { refreshToken: string, accessToken: string, expires: Date });
  constructor(args: any) {
    if (args.refreshToken && (!args.expires || args.expires > new Date())) {
      this.creds = {
        state: "token",
        refreshToken: args.refreshToken
      };
    } else if (args.username && args.password) {
      this.creds = {
        state: "password",
        username: args.username,
        password: args.password
      };
    } else if (args.refreshToken && args.accessToken && args.expires) {
      this.creds = {
        state: "logged",
        refreshToken: args.refreshToken,
        accessToken: args.accessToken,
        expires: args.expires
      };
    }
  }


  // Get some info about the current user.
  get userInfo() {
    if (!this.info) {
      // TODO implement this somehow
      return {
        name: "test",
        nick: "test",
        id: 1,
        email: "test@ho.tlo.li",
        avatar: {
          big: "test",
          medium: "test",
          small: "test"
        }
      }
    } else {
      return this.info
    }
  }


  // Log in if you're not already, and return the access token.
  // Takes an optional argument to force logging in again,
  // even if the access token hasn't expired yet.
  private login = async (force = false): Promise<string> => {
    const c = this.creds;
    let request;

    if (c.state === "logged" && !force && c.expires > new Date()) {
      return c.accessToken;

    } else if (c.state === "token" || c.state === "logged") {
      request = authRequest([
        ["grant_type", "refresh_token"],
        ["refresh_token", c.refreshToken]
      ]);

    } else if (c.state === "password") {
      request = authRequest([
        ["grant_type", "password"],
        ["username", c.username],
        ["password", c.password]
      ]);
    } else {
      console.error(c);
      throw { kind: "shouldnt-happen", msg: "Invalid API state." };
    }

    const r: raw.Login = await request;
    const expires = new Date(
      (new Date()).getTime() + (r.response.expires_in * 1000)
    );

    this.info = to.MyInfo(r);

    this.creds = {
      state: "logged",
      accessToken: r.response.access_token,
      refreshToken: r.response.refresh_token,
      expires: expires
    };

    return r.response.access_token;
  };


  private apiRequest = async <T>(
    method: Ajax.Method,
    path: string,
    params: Params.t
  ): Promise<T> => {
    const url = Proxy.api(path);
    const accessToken = await this.login();
    const filteredParams: Array<[string,string]> = [];

    // Filter out undefined params and turn the rest into strings
    for (const [name, content] of params)
      if (content) filteredParams.push([name, Params.toString(content)]);

    try {
      return await Ajax.request<T,raw.Error>(method, url, [
          ["Authorization", `Bearer ${accessToken}`]
        ], filteredParams, (err) => err.error.user_message || err.error.message);
    } catch (error) {
      if (error.kind === "server" && error.msg.slice(-13) === "invalid_grant") {
        // Forcefully invalidate the token and retry the request
        await this.login(true);
        return await this.apiRequest<T>(method, path, filteredParams);
      } else {
        throw error;
      }
    }
  };


  // Produce a thunk returning a Promise to the next page.
  // The resulting thunk hould be returned in a tuple along with the current
  // page, so as not to needlessly expose implementation details.
  private nextPage = <T, U>(
    url: string | null,
    unpack: (response: U) => T
  ): (() => Promise<T>) | null => {
    const path = urlPath(url);
    if (!path) return null;

    return async () =>
      unpack(await this.apiRequest<U>("GET", path, []));
  };


  /// API Endpoints start here
  feed = async (a: {
    restrict?: Params.Restrict,
    offset?: number
  } = {}): Promise<Paged<Array<Illust>>> => {
    const params: Params.t = [
      ["restrict", a.restrict || "public"],
      ["offset", a.offset]
    ];

    const unpack = (resp: raw.IllustList): Paged<Array<Illust>> => [
      resp.illusts.map(i => to.Illust(i)),
      this.nextPage<Paged<Array<Illust>>, raw.IllustList>(resp.next_url, unpack)
    ];

    return unpack(
      await this.apiRequest<raw.IllustList>("GET", "v2/illust/follow", params)
    );
  };


  ranking = async (a: {
    date?: Date,
    offset?: number
  } = {}): Promise<Paged<Array<Illust>>> => {
    const params: Params.t = [
      ["date", a.date],
      ["offset", a.offset]
    ];

    const unpack = (resp: raw.IllustList): Paged<Array<Illust>> => [
      resp.illusts.map(i => to.Illust(i)),
      this.nextPage<Paged<Array<Illust>>, raw.IllustList>(resp.next_url, unpack)
    ];

    return unpack(
      await this.apiRequest<raw.IllustList>("GET", "v1/illust/ranking", params)
    );
  };


  search = async (query: string, a: {
    match?: Params.SearchTarget,
    within?: Params.Within,
    sortMode?: Params.SortMode,
    offset?: number
  } = {}): Promise<Paged<Array<Illust>>> => {
    const params: Params.t = [
      ["word", query],
      ["search_target", a.match || "partial_match_for_tags"],
      ["sort", a.sortMode || "desc"],
      ["duration", a.within],
      ["offset", a.offset]
    ];

    const unpack = (resp: raw.IllustList): Paged<Array<Illust>> => [
      resp.illusts.map(i => to.Illust(i)),
      this.nextPage<Paged<Array<Illust>>, raw.IllustList>(resp.next_url, unpack)
    ];

    return unpack(
      await this.apiRequest<raw.IllustList>("GET", "v1/search/illust", params)
    );
  };


  autoComplete = async (query: string): Promise<Array<string>> => {
    const r = await this.apiRequest<raw.AutoComplete>(
      "GET", "v1/search/autocomplete", [["word", query]]
    );

    return r.search_auto_complete_keywords;
  };


  bookmark = async (id: number, a: {
    restrict?: Params.Restrict,
    tags?: Array<string>
  } = {}): Promise<void> => {
    const params: Params.t = [
      ["illust_id", id],
      ["restrict", a.restrict || "public"]
      // TODO serialize arrays
    ];

    await this.apiRequest<{}>("POST", "v2/illust/bookmark/add", params);
  };


  unbookmark = async (id: number): Promise<void> => {
    await this.apiRequest<{}>(
      "POST", "v1/illust/bookmark/delete", [["illust_id", id]]
    );
  };
}


// Make a POST request to the OAuth2 endpoint.
const authRequest = async (params: Array<[string,string]>): Promise<raw.Login> => {
  const authUrl = Proxy.auth;
  const baseParams: Array<[string,string]> = [
    ["get_secure_url", "true"],
    ["client_id", "MOBrBDS8blbauoSck0ZfDbtuzpyT"],
    ["client_secret", "lsACyCD94FhDUtGTXi3QzcFE2uU1hqtDaKeqrdwj"]
  ];

  try {
    return await Ajax.request<raw.Login, raw.AuthError>(
      "POST", authUrl, [
        ["Content-Type", "application/x-www-form-urlencoded"]
      ], baseParams.concat(params),
      (err) => err.errors.system.message
    );
  } catch (error) {
    if (error.kind === "server" && error.msg.slice(0,3) === "103")
      throw { kind: "client", msg: "Incorrect username or password" };
    else
      throw error;
  }
};


const urlPath = (url: string | null): string | null => {
  if (!url) return null;

  try {
    const path = new URL(url);
    return path.pathname.slice(1) + path.hash + path.search;
  } catch (_) {
    return null;
  }
};
