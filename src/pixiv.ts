// API endpoints
export interface API {
  // Reset credentials to a username and password in case
  // an InvalidCredentials error is thrown.
  setCredentials(username: string, password: string): void;

  // Latest illustrations by the users you follow.
  myFeed(opts?: {
    restrict?: "public" | "private" | "all",
    offset?: number
  }): Promise<Paged<Illust[]>>;

  // Latest illustrations globally.
  globalFeed(opts?: {
    type?: "illust" | "manga",
    offset?: number
  }): Promise<Paged<Illust[]>>;

  // Recommendations based on an illustration.
  relatedIllusts(
    startId: number,
    prev?: Array<number>
  ): Promise<Paged<Illust[]>>;

  // Search for illustrations matching a given query.
  searchIllusts(query: string, opts?: {
    match?: "partial_match_for_tags" | "exact_match_for_tags" | "title_and_caption",
    within?: "within_last_day" | "within_last_week" | "within_last_month" | [Date, Date],
    sortMode?: "date_desc" | "date_asc",
    offset?: number
  }): Promise<Paged<Illust[]>>;

  // Tag completions for a given search query.
  autoComplete(query: string): Promise<string[]>;

  // Bookmark an illustration.
  bookmarkIllust(id: number, opts?: {
    restrict?: "public" | "private",
    tags?: string[]
  }): Promise<void>;

  unbookmarkIllust(id: number): Promise<void>;

  /*
  // Latest illustrations by users in your MyPixiv.
  myPixivFeed(opts?: {
    offset?: number
  }): Promise<Paged<Array<Illust>>>;
  */

  // Users that are currently livestreaming.
  live(opts?: {
    type?: "following" /* | ... */,
    offset?: number
  }): Promise<Paged<Unimplemented[]> | null>;

  // Popular illustrations.
  ranking(opts?: {
    date?: Date,
    offset?: number
  }): Promise<Paged<Illust[]> | null>;

  follow(id: number, opts: {
    restrict?: "public" | "private",
  }): Promise<void>;

  unfollow(id: number): Promise<void>;

  userDetail(id: number): Promise<User>;

  illustInfo(id: number): Promise<Illust>;

  userIllusts(id: number, opts: {
    contentType?: "illust" | "manga",
    type?: "illust" | "manga" | "novel",
  }): Promise<Paged<Array<Illust>>>;
}


// The only instance in which this class throws an error is when
// The username and password are invalid.
export class API {
  private creds: Credentials.t;

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
    } else {
      throw new Error("Invalid arguments passed to API constructor");
    }
  }


  setCredentials = (username: string, password: string): void => {
    this.creds = {
      state: "password",
      username, password
    };
  }


  private apiReq = async <T,U>(endpoint: Endpoint<T,U>): Promise<U> => {
    const token      = await this.login(),
          outHeaders = new Headers();

    const outParams = (endpoint.params instanceof URLSearchParams)
      ? endpoint.params
      : Params.toUrlParams(endpoint.params);

    outHeaders.append("Authorization", `Bearer ${token}`);

    const resp = await fetch(
      "https://app-api.pixiv.net/" + endpoint.url + "?" + outParams.toString(), {
        method: endpoint.method,
        headers: outHeaders
      }
    );

    if (!resp.ok) {
      try {
        const e: raw.ApiError = await resp.json();
        const err = e.error.user_message || e.error.message;
        if (err.slice(-13) === "invalid_grant") {
          // The token is invalid or has expired; retry
          return await this.apiReq<T,U>(endpoint);
        } else {
          throw new Error("Server returned error: " + err.toString());
        }
      } catch (e) {
        throw new Error("Couldn't parse server error: " + e.toString());
      }
    }

    try {
      return endpoint.unpack(await resp.json());
    } catch (e) {
      throw new Error("Invalid server response" + e.toString());
    }
  }


  private login = async (force = false): Promise<string> => {
    const c = this.creds;

    if (c.state === "logged" && !force && c.expires > new Date())
      return c.accessToken;

    // Build up the request
    const params = [
      ["get_secure_url", "true"],
      ["client_id", "MOBrBDS8blbauoSck0ZfDbtuzpyT"],
      ["client_secret", "lsACyCD94FhDUtGTXi3QzcFE2uU1hqtDaKeqrdwj"]
    ];

    if (c.state === "logged" || c.state === "token") {
      params.push(
        ["grant_type", "refresh_token"],
        ["refresh_token", c.refreshToken]
      );
    } else {
      params.push(
        ["grant_type", "password"],
        ["username", c.username],
        ["password", c.password]
      );
    }

    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const outParams = new URLSearchParams();
    for (const [name, content] of params)
      outParams.append(name, content);

    // Fetch the access token
    const r = await fetch(
      "https://oauth.secure.pixiv.net/auth/token", {
        method: "POST",
        headers: headers,
        body: outParams.toString()
      }
    );

    if (!r.ok) {
      try {
        const e: raw.AuthError = await r.json();
        const err = e.errors.system.message;
        if (err.slice(0,3) === "103") {
          throw new InvalidCredentials();
        } else {
          throw new Error("Server returned error on login: " + err.toString());
        }
      } catch (e) {
        throw new Error("Couldn't parse server error: " + e.toString());
      }
    }

    try {
      // Parse the response and cache the credentials for future requests
      const resp: raw.Login = await r.json();
      const expires = new Date(
        (new Date()).getTime() + (resp.response.expires_in * 1000)
      );

      this.creds = {
        state: "logged",
        accessToken: resp.response.access_token,
        refreshToken: resp.response.refresh_token,
        expires: expires
      };

      return resp.response.access_token;
    } catch (e) {
      throw new Error("Couldn't parse server response on login: " + e.toString());
    }
  }


  private nextPage = <T,U>(
    url: string | null,
    unpack: (resp: T) => U
  ): Lazy<Promise<U>> | null => {
    if (!url) return null;
    try {
      const url_ = new URL(url);

      return () => {
        return this.apiReq<T,U>({
          method: "GET",
          url: url_.pathname.slice(1),
          params: url_.searchParams,
          unpack: unpack
        });
      };

    } catch (e) {
      return null;
    }
  }


  // API Endpoints
  // --------------------------------------------------------------------------
  myFeed = (opts: {
    restrict?: "public" | "private" | "all",
    offset?: number
  } = {}): Promise<Paged<Array<Illust>>> => {
    const unpack = (resp: raw.IllustList): Paged<Array<Illust>> => [
      resp.illusts.map(i => to.Illust(i)),
      this.nextPage(resp.next_url, unpack)
    ];

    return this.apiReq<raw.IllustList,Paged<Array<Illust>>>({
      method: "GET",
      url: "v2/illust/follow",
      params: [
        ["restrict", opts.restrict || "public"],
        ["offset", opts.offset]
      ],
      unpack
    });
  }


  globalFeed = (opts: {
    type?: "illust" | "manga",
    offset?: number
  } = {}): Promise<Paged<Array<Illust>>> => {
    const unpack = (resp: raw.IllustList): Paged<Array<Illust>> => [
      resp.illusts.map(i => to.Illust(i)),
      this.nextPage(resp.next_url, unpack)
    ];

    return this.apiReq<raw.IllustList,Paged<Array<Illust>>>({
      method: "GET",
      url: "v1/illust/new",
      params: [
        ["content_type", opts.type || "illust"],
        ["offset", opts.offset]
      ],
      unpack
    });
  }


  relatedIllusts = (startId: number, prev: Array<number> = []): Promise<Paged<Array<Illust>>> => {
    const unpack = (resp: raw.IllustList): Paged<Array<Illust>> => [
      resp.illusts.map(i => to.Illust(i)),
      this.nextPage(resp.next_url, unpack)
    ];

    return this.apiReq<raw.IllustList,Paged<Array<Illust>>>({
      method: "GET",
      url: "v2/illust/related",
      params: [
        ["illust_id", startId],
        ["seed_illust_ids", prev]
      ],
      unpack
    });
  }


  searchIllusts = (query: string, opts: {
    match?: "partial_match_for_tags" | "exact_match_for_tags" | "title_and_caption",
    within?: "within_last_day" | "within_last_week" | "within_last_month" | [Date, Date],
    sortMode?: "date_desc" | "date_asc",
    offset?: number
  } = {}): Promise<Paged<Illust[]>> => {
    const unpack = (resp: raw.IllustList): Paged<Array<Illust>> => [
      resp.illusts.map(i => to.Illust(i)),
      this.nextPage(resp.next_url, unpack)
    ];

    const params: Params.t = [
      ["word", query],
      ["sort", opts.sortMode || "date_desc"],
      ["search_target", opts.match || "partial_match_for_tags"],
      ["offset", opts.offset]
    ];

    if (opts.within instanceof Array) {
      const [start, end] = (opts.within[0] > opts.within[1])
        ? [opts.within[1], opts.within[0]]
        : [opts.within[0], opts.within[1]];

      params.push(
        ["start_date", start],
        ["end_date", end]
      );
    } else if (opts.within) {
      params.push(["duration", opts.within]);
    }

    return this.apiReq<raw.IllustList,Paged<Illust[]>>({
      method: "GET",
      url: "v1/search/illust",
      params, unpack
    });
  }


  autoComplete = (query: string): Promise<string[]> => {
    return this.apiReq<{ search_auto_complete_keywords: string[] },string[]>({
      method: "GET",
      url: "v1/search/autocomplete",
      params: [
        ["word", query]
      ],
      unpack: (resp) => resp.search_auto_complete_keywords
    });
  }


  bookmarkIllust = async (id: number, opts: {
    restrict?: "public" | "private",
    tags?: string[]
  } = {}): Promise<void> => {
    await this.apiReq({
      method: "POST",
      url: "v2/illust/bookmark/add",
      params: [
        ["illust_id", id],
        ["restrict", opts.restrict || "public"],
        ["tags", opts.tags]
      ],
      unpack: (_) => {}
    });
  }


  unbookmarkIllust = async (id: number): Promise<void> => {
    await this.apiReq({
      method: "POST",
      url: "v1/illust/bookmark/delete",
      params: [["illust_id", id]],
      unpack: (_) => {}
    });
  }
}



export class InvalidCredentials extends Error {
  __proto__: Error;
  constructor() {
      const trueProto = new.target.prototype;
      super();

      this.__proto__ = trueProto;
  }
}



export type Lazy<T> = () => T;

export type Paged<T> = [ T, (() => Promise<Paged<T>>) | null];


namespace Params {
  export type t = Array<[string, param]>;

  // We include `undefined` in the type to allow optional parameters to be left
  // out when calling the function, and then filtered out in API#apiReq.
  export type param =
    | string | number | Date
    | Array<string> | Array<number>
    | undefined;

  export const toUrlParams = (params: t): URLSearchParams => {
    const out = new URLSearchParams();

    for (const [name, param] of params) {
      if (!param) continue;

      if (param instanceof Date) {
        out.append(name, `${param.getFullYear()}-${param.getMonth() + 1}-${param.getDate()}`);
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
}


interface Endpoint<T,U> {
  url: string;
  method: "GET" | "POST";
  params: Array<[string, Params.param | undefined]> | URLSearchParams;
  unpack: (raw: T) => U;
}


namespace Credentials {
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



namespace raw {
  export interface Login {
    response: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };
  }

  export interface ApiError {
    error: {
      user_message: string;
      message: string;
      reason: string;
      user_mesage_detauls: {};
    };
  }

  export interface AuthError {
    has_error: true;
    errors: {
      system: {
        message: string;
        code: null | number;
      };
    };
  }

  export interface Work {
    id: number;
    title: string;
    caption: string;
    create_date: date;
    user: User;
    page_count: number;
    tags: Array<{ name: string; }>;

    image_urls: {
      square_medium: string;
      medium: string;
      large: string;
    };

    restrict: number;
    visible: boolean;

    total_bookmarks?: number;
    total_views?: number;
    total_comments?: number;

    is_muted: boolean;
    is_bookmarked: boolean;
  }


  export type Illust = SingleIllust | MultiIllust;

  export enum SexualContent { SafeForWork = 2, Sexual = 4, Grotesque = 6 }

  export interface BaseIllust extends Work {
    type: "illust" | "manga" | "ugoira";
    tools: Array<string>;
    width: number;
    height: number;
    sanity_level: SexualContent;
  }

  // To make Illust type-safe we consider illusts with only one page
  // and illusts with multiple as different types.
  // (this didn't even work LOL)
  export interface SingleIllust extends BaseIllust {
    meta_single_page: { original_image_url: string; };
    meta_pages: null;
  }


  export interface MultiIllustUrls {
    image_urls: {
      square_medium: string;
      medium: string;
      large: string;
      original: string;
    };
  }


  export interface MultiIllust extends BaseIllust {
    meta_single_page: { original_image_url: undefined };
    meta_pages: Array<MultiIllustUrls>;
  }


  export interface Novel extends Work {
    text_length: number;
    series: {
      id: number;
      title: string;
    };
  }


  export type url = string;
  export type maybeString = "" | string;
  export type maybeNumber = 0 | number;
  export type date = string;
  export type publicity = "public" | "private";


  export interface User {
    id: number;
    name: string;
    account: string;
    profile_image_urls: { medium: url; };
    comment?: string;
    is_followed?: boolean;
  }


  export interface UserDetail {
    user: User;

    profile: {
      webpage: url | null;

      gender: maybeString;

      birth_day: maybeString;
      birth_year: maybeNumber;

      region: maybeString;
      address_id: maybeNumber;
      country_code: maybeString;

      job: maybeString;
      job_id: maybeNumber;

      background_image_url: url | null;
      twitter_account: maybeString;
      twitter_url: url | null;
      pawoo_url: url | null;
      is_premium: boolean;
      is_using_custom_profile_image: boolean;

      total_follow_users: number;
      total_follower: number;
      total_mypixiv_users: number;

      total_illusts: number;
      total_manga: number;
      total_novels: number;
      total_illust_bookmarks_public: number;
    };

    profile_publicity: {
      gender: publicity;
      region: publicity;
      birth_day: publicity;
      birth_year: publicity;
      job: publicity;
      pawoo: boolean;
    };

    workspace: {
      pc: maybeString;
      monitor: maybeString;
      tool: maybeString;
      scanner: maybeString;
      tablet: maybeString;
      mouse: maybeString;
      printer: maybeString;
      desktop: maybeString;
      music: maybeString;
      desk: maybeString;
      chair: maybeString;
      comment: maybeString;
      workspace_image_url: url | null;
    };
  }


  export interface Comment {
    id: number;
    comment: string;
    date: date;
    user: User;
  }


  export interface CommentList {
    total_comments?: number;
    next_url: url | null;
    comments: Array<Comment>;
  }


  export interface UgoiraDetail {
    ugoira_metadata: {
      zip_urls: { medium: url; }
      frames: Array<{
        file: string;
        delay: number;
      }>;
    };
  }


  export interface TrendingTags {
    trend_tags: Array<{
      tag: string;
      illust: Illust;
    }>;
  }


  export interface Paged {
    next_url: url | null;
  }


  export interface IllustList extends Paged {
    illusts: Array<Illust>;
  }


  export interface IllustDetail {
    illust: Illust;
  }


  export interface UserPreviews extends Paged {
    user_previews: Array<{
      user: User;
      illusts: Array<Illust>;
      novels: Array<Novel>;
      is_muted: boolean;
    }>;
  }


  export interface TrendingTags {
    trend_tags: Array<{
      tag: string;
      illust: Illust;
    }>;
  }

}


namespace to {
  /*
  export const MyInfo = (r: raw.Login): t.MyInfo => {
    const user = r.response.user;
    return {
      name: user.account,
      nick: user.name,
      id: parseInt(user.id),
      email: user.main_address,
      avatar: {
        big: user.profile_image_urls.px_170x170,
        medium: user.profile_image_urls.px_50x50,
        small: user.profile_image_urls.px_16x16
      }
    };
  };
  */

  export const User = (u: raw.User): User => {
    return {
      id: u.id,
      accountName: u.account,
      displayName: u.name,
      avatar: u.profile_image_urls.medium,
      description: u.comment || null,
      followed: u.is_followed || null
    };
  };

  export const Work = (w: raw.Work): Work => {
    return {
      id: w.id,
      title: w.title,
      caption: w.caption,
      date: new Date(w.create_date),
      user: User(w.user),
      //userId: w.user.id,
      pages: w.page_count,
      tags: w.tags.map(x => x.name),
      thumbnail: w.image_urls.square_medium,
      bookmarked: w.is_bookmarked
    };
  };

  export const Illust = (i: raw.Illust): Illust => {
    let illust = Work(i) as Illust;
    illust.tools = i.tools;
    illust.dimensions = [i.width, i.height];
    illust.type = i.type;

    if (i.meta_single_page.original_image_url) {
      illust.images = [i.meta_single_page.original_image_url];
    } else {
      const multiUrls = i.meta_pages!;
      illust.images = multiUrls.map(x => x.image_urls.original);
    }

    illust.sexualContent = i.sanity_level / 2;

    return illust;
  };
}









export interface MyInfo {
  name: string;
  nick: string;
  id: number;
  email: string;
  avatar: {
    big: string;
    medium: string;
    small: string;
  };
}


export interface User {
  id: number;
  accountName: string;
  displayName: string;
  avatar: string;
  description: string | null;
  followed: boolean | null;
}



export interface Work {
  id: number;
  title: string;
  caption: string;
  date: Date;
  user: User;
  //userId: number;
  pages: number;
  tags: Array<string>;
  thumbnail: string;
/*bookmarks: number | null;
  views: number | null;
  commentCount: number | null;*/
  bookmarked: boolean;
}


export interface Unimplemented {}


export type IllustType = "illust" | "manga" | "ugoira";


export enum SexualContent { None = 1, Sexual, Grotesque }


export enum Restrict { Public, Private }


export interface Illust extends Work {
  type: IllustType;
  tools: Array<string>;
  images: Array<string>;
  dimensions: [number, number];
  sexualContent: SexualContent;
}