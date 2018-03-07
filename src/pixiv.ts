// API endpoints
export interface API {
  // Latest illustrations by the users you follow.
  myFeed(opts?: {
    restrict?: "public" | "private" | "all",
    offset?: number
  }): Promise<Paged<Illust[]> | null>;

  /*
  // Latest illustrations by users in your MyPixiv.
  myPixivFeed(opts?: {
    offset?: number
  }): Promise<Paged<Array<Illust>>>;
  */

  // Latest illustrations globally.
  globalFeed(opts?: {
    type?: "illust" | "manga",
    offset?: number
  }): Promise<Paged<Illust[]> | null>;

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

  // Search for illustrations matching a given query.
  search(query: string, opts?: {
    match?: "partial_match_for_tags" | "exact_match_for_tags" | "title_and_caption",
    within?: "within_last_day" | "within_last_week" | "within_last_month",
    sortMode?: "date_desc" | "date_asc",
    offset?: number
  }): Promise<Paged<Array<Illust>>>;

  // @Stub
  recommended(opts?: {
  }): Promise<Paged<Array<Illust>>>;

  // Tag completions for a given search query.
  autoComplete(query: string): Promise<Array<string>>;

  // Bookmark an illustration.
  bookmark(id: number, opts?: {
    restrict?: "public" | "private",
    tags?: Array<string>
  }): Promise<void>;

  unbookmark(id: number): Promise<void>;

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


  private apiReq = async <T,U>(endpoint: Endpoint<T,U>): Promise<U | null> => {
    const token      = await this.login(),
          outParams  = new URLSearchParams,
          outHeaders = new Headers();

    if (!token) return null;

    for (const [name, content] of endpoint.params)
      if (content) outParams.append(name, Params.toString(content));

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
          console.error("Server returned error: ", err);
          return null;
        }
      } catch (e) {
        console.error("Invalid server error: ", e);
        return null;
      }
    }

    try {
      return endpoint.unpack(await resp.json());
    } catch (e) {
      console.error("Invalid server response", e);
      return null;
    }
  }


  private login = async (force = false): Promise<string | null> => {
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
          console.error("Incorrect username or password");
          throw Error("Incorrect username or password");
        } else {
          console.error("Server returned error on login: ", err);
        }
      } catch (e) {
        console.error("Invalid server error: ", e);
      }

      return null;
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
      console.error("Couldn't parse server response on login: ", e);
      return null;
    }
  }


  private nextPage = <T,U>(
    url: string | null,
    unpack: (resp: T) => U
  ): Lazy<Promise<U | null>> | null => {
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
  } = {}): Promise<Paged<Array<Illust>> | null> => {
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
      unpack: unpack
    });
  }


  globalFeed = (opts: {
    type?: "illust" | "manga",
    offset?: number
  } = {}): Promise<Paged<Array<Illust>> | null> => {
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
      unpack: unpack
    });
  }


  /*
  ranking = (opts: {
    date?: Date,
    offset?: number
  } = {}): Promise<Paged<Array<Illust>>> => {
    return this.fetch({
      method: "GET",
      url: "v1/illust/ranking",
      params: [
        ["date", opts.date],
        ["offset", opts.offset]
      ]
    });
  };
  */

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
      const multiUrls = i.meta_pages as Array<raw.MultiIllustUrls>;
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


export type Lazy<T> = () => T;


export type Paged<T> = [ T, (() => Promise<Paged<T> | null>) | null];


export type NextPage<T> = Lazy<Promise<Paged<T>>>;


namespace Params {
  // We include `undefined` in the type to allow optional parameters to be left
  // out when calling the function, and then filtered out in API#apiRequest.
  export type t = Array<[string, param]>;

  export type param = string | number | Date;

  export const toString = (param: param): string => {
    if (param instanceof Date) {
      return `${param.getFullYear()}-${param.getMonth() + 1}-${param.getDate()}`;
    } else {
      return param.toString();
    }
  };
}


interface Endpoint<T,U> {
  url: string;
  method: "GET" | "POST";
  params: Array<[string, Params.param | undefined]> | URLSearchParams;
  unpack: (raw: T) => U;
}


/*
export const httpGet = async <T,E>(
  url: string,
  headers: Array<[string, string]>,
  params: Array<[string, string]>
): Promise<T> => {
  const searchParams = new URLSearchParams(),
        outHeaders   = new Headers();

  for (const [name, content] of params)
    searchParams.append(name, content);

  for (const [name, content] of headers)
    outHeaders.append(name, content);

  const resp = await fetch(url + '?' + searchParams.toString(), {
    method: "GET",
    headers: outHeaders,
  });

  if (resp.ok) {
    try {
      return await resp.json();
    } catch (e) {
      throw { kind: "parse", msg: "Failed to parse the response" };
    }
  } else {

  }
};
*/


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


/*
export class API_ {
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


  private fetch = async <T>(endpoint: Endpoint): Promise<T> => {
    const token = await this.login();
    const filteredParams: Array<[string, string]> = [];

    for (const [name, content] of endpoint.params)
      if (content) filteredParams.push([name, Params.toString(content)]);

    try {
      return await this.fetcher<T,{}>(endpoint.method, endpoint.url, [
        ["Authorization", `Bearer ${accessToken}`]
      ], filteredParams)
    } catch (error) {
    }
  };


  myFeed = (opts: {
    restrict?: "public" | "private" | "all",
    offset?: number
  } = {}): Promise<Paged<Array<Illust>>> => {
    return this.fetch({
      method: "GET",
      url: "v2/illust/follow",
      params: [
        ["restrict", opts.restrict || "public"],
        ["offset", opts.offset]
      ]
    });
  };


  myPixivFeed = (opts: {
    offset?: number
  } = {}): Promise<Paged<Array<Illust>>> => {
    return this.fetch({
      method: "GET",
      url: "v2/illust/mypixiv",
      params: [
        ["offset", opts.offset]
      ]
    });
  };

  
  globalFeed = (opts: {
    type?: "illust" | "manga",
    offset?: number
  } = {}): Promise<Paged<Array<Illust>>> => {
    return this.fetch({
      method: "GET",
      url: "v1/illust/new",
      params: [
        ["content_type", opts.type || "illust"],
        ["offset", opts.offset]
      ]
    });
  };


  live = (opts: {
    type?: "following" /* | ... ,
    offset?: number
  } = {}): Promise<Paged<Array<Unimplemented>>> => {
    return this.fetch({
      method: "GET",
      url: "v1/live/list",
      params: [
        ["list_type", opts.type || "following"],
        ["offset", opts.offset]
      ]
    });
  };


  ranking = (opts: {
    date?: Date,
    offset?: number
  } = {}): Promise<Paged<Array<Illust>>> => {
    return this.fetch({
      method: "GET",
      url: "v1/illust/ranking",
      params: [
        ["date", opts.date],
        ["offset", opts.offset]
      ]
    });
  };


  // @Stub
  recommended = (opts: {
  } = {}): Promise<Paged<Array<Illust>>> => {
    return this.fetch({
      method: "GET",
      url: "v1/illust/recommended",
      params: []
    });
  };


  search = (query: string, opts: {
    match?: "partial_match_for_tags" | "exact_match_for_tags" | "title_and_caption",
    within?: "within_last_day" | "within_last_week" | "within_last_month",
    sortMode?: "date_desc" | "date_asc",
    offset?: number
  } = {}): Promise<Paged<Array<Illust>>> => {
    return this.fetch({
      method: "GET",
      url: "v1/search/illust",
      params: [
        ["word", query],
        ["search_target", opts.match || "partial_match_for_tags"],
        ["sort", opts.sortMode || "date_desc"],
        ["duration", opts.within],
        ["offset", opts.offset]
      ]
    });
  };


  autoComplete = (query: string): Promise<Array<string>> => {
    return this.fetch({
      method: "GET",
      url: "v1/search/autocomplete",
      params: [
        ["word", query]
      ]
    });
  };


  bookmark = (id: number, opts: {
    restrict?: "public" | "private",
    tags?: Array<string>
  } = {}): Promise<void> => {
    return this.fetch({
      method: "POST",
      url: "v1/illust/bookmark/add",
      params: [
        ["illust_id", id],
        ["restrict", opts.restrict || "public"],
        ["tags", ""]
      ]
    })
  };
}



/*
export class API {
  private creds: Credentials.t;
  private info: MyInfo | null = null;


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


  get userInfo() {
    if (!this.info) {
      // @Stub
      this.info = {
        name: "test",
        nick: "test",
        id: 1,
        email: "test@ho.tlo.li",
        avatar: {
          big: "test",
          medium: "test",
          small: "test"
        }
      };
    }

    return this.info;
  }


}


  // Returns the access token, logging in if necessary. The "force" parameter
  // forces a new login even if the cached access token has not expired yet.
  private getAccessToken = async (force = false): Promise<string> => {
    const c = this.creds;
    if (c.state === "logged" && !force && c.expires > new Date()) {
      // The token is cached and valid.
      return c.accessToken;
    }

    let request;
    if (c.state === "token" || c.state === "logged") {
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
      console.error("Invalid API state");
      throw new Error("fug");
    }

    const r: raw.Login = await request;
  }
};


private nextPage = <T, U>(url: string | null, unpack: (response: U) => T): Thunk<Promise<T>> | null => {

}
*/