import * as Ajax from "./ajax";


// API {{{
export class API {
  tokens: Tokens;
  onInvalidToken: () => any;


  constructor(handleInvalidToken?: () => any, tokens?: Tokens) {
    if (!handleInvalidToken || !tokens)
      throw new Error('Pixiv.API cannot be called directly, use API.init');

    this.tokens = tokens;
    this.onInvalidToken = handleInvalidToken;
  }


  // Factory for Pixiv.API
  static async init(f: () => any, refreshToken: string): Promise<[API, MyInfo]>;
  static async init(f: () => any, t: { refresh: string, access: string, expires: Date }): Promise<API>;
  static async init(f: () => any, credentials: { name: string, pass: string }): Promise<[API, MyInfo]>;
  static async init(f: any, t: any): Promise<any> {
    if (typeof t === 'string' || (t.expires && t.expires > new Date())) {
      // Try to log in with refresh token
      const refreshToken = (t.expires) ? t.refresh : t;
      try {
        const [tokens, info] = await refresh(refreshToken);
        return [new API(f,tokens), info];

      } catch (err) { throw err; }

    } else if (t.refresh && t.access && t.expires) {
      // Already logged in
      return new API(f,t);

    } else if (t.name && t.pass) {
      // Try to log in with credentials
      try {
        const [tokens, info] = await authRequest([
          ['grant_type', 'password'],
          ['username', t.name],
          ['password', t.pass]
        ]);
        return [new API(f,tokens), info];
      } catch (err) {
        if (err.slice(0,3) === '103')
          throw 'Incorrect username or password';
        else throw err;
      }
    }
  }


  // throws string, Error
  async perform<T>(method: 'GET' | 'POST', path: string, params: Array<[string, string]>): Promise<T> {
    try {
      if (this.tokens.expires <= new Date()) {
        const [tokens, info] = await refresh(this.tokens.refresh);
        this.tokens = tokens;
      }
    } catch (_) {
      // Token is invalid, fuck outta here
      throw this.onInvalidToken();
    }

    // The next part sucks.

    let headers: Array<[string, string]> = [
      ['Authorization', `Bearer ${this.tokens.access}`]
    ];

    let url = path;
    let data: Array<[string, string]> | null = params;

    if (method === 'POST') {
      headers.push(['Content-Type', 'application/x-www-form-urlencoded']);
    } else {
      if (params.length > 0) {
        url = path + '?' + params.map(([name, content]) =>
          encodeURIComponent(name) + '=' + encodeURIComponent(content)
        ).join('&');
      }

      data = null;
    }

    try {
      // Happy path
      const resp: T = JSON.parse(
        await request(method, 'https://app-api.pixiv.net/' + url, headers, data)
      );

      return resp;
    } catch (e) {
      let err: Raw.Error;

      try {
        err = JSON.parse(e);
      } catch (_) {
        throw 'Couldn\'t connect to the server';
      }

      if (err.error.message.slice(-13) === 'invalid_grant') {
        // Forcefully invalidate the token and retry the request
        this.tokens.expires = new Date(0);
        return await this.perform<T>(method, path, params);
      } else if (err.error.user_message !== '')
        throw err.error.user_message;
      else
        throw err.error.user_message;
    }
  }


  nextPage<T, U>(url: string | null, unpack: (r: U) => T): (() => Promise<T>) | null {
    const path = getUrlPath(url);
    if (!path) return null;

    return () => new Promise((resolve, reject) =>
      this.perform<U>('GET', path, []).then(
        resp => resolve(unpack(resp)),
        reject
      )
    );
  }


  // Endpoints
  async feed(): Promise<Paged<Array<Illust>>> {
    const unpack: (r: Raw.IllustList) => Paged<Array<Illust>> = (resp) => [
      resp.illusts.map(i => to.Illust(i)),
      this.nextPage<Paged<Array<Illust>>, Raw.IllustList>(resp.next_url, unpack)
    ];

    try {
      return unpack(
        await this.perform<Raw.IllustList>
          ('GET', 'v2/illust/follow', [['restrict', 'public']])
      );
    } catch (err) { throw err; }
  }


  async ranking(): Promise<Paged<Array<Illust>>> {
    const unpack: (r: Raw.IllustList) => Paged<Array<Illust>> = (resp) => [
      resp.illusts.map(i => to.Illust(i)),
      this.nextPage<Paged<Array<Illust>>, Raw.IllustList>(resp.next_url, unpack)
    ];

    try {
      return unpack(
        await this.perform<Raw.IllustList>('GET', 'v1/illust/ranking', [])
      );
    } catch (err) { throw err; }
  }


  async bookmark(id: number): Promise<void> {
    try {
      this.perform<{}>('POST', 'v2/illust/bookmark/add', [
        ['illust_id', id.toString()],
        ['restrict', 'public']
      ]);
    } catch (err) { throw err; }
  }


  async unbookmark(id: number): Promise<void> {
    try {
      this.perform<{}>('POST', 'v1/illust/bookmark/delete', [
        ['illust_id', id.toString()]
      ]);
    } catch (err) { throw err; }
  }
}


// Recursive type for paged resources.
// Contains the resource and a Promise to the next page.
export type Paged<T> = [
  T,
  (() => Promise<Paged<T>>) | null
]; // }}}



// Types {{{
export interface Tokens {
  access: string;
  refresh: string;
  expires: Date;
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
  }
}


export interface Work {
  id: number;
  title: string;
  caption: string;
  date: Date;
  userId: number;
  pages: number;
  tags: Array<string>;
  thumbnail: string;
  /*bookmarks: number | null;
  views: number | null;
  commentCount: number | null;*/
  bookmarked: boolean;
}


export type IllustType = "illust" | "manga" | "ugoira";


export enum SexualContent { None = 1, Sexual, Grotesque }


export enum Restrict { Public, Private };


export interface Illust extends Work {
  type: IllustType;
  tools: Array<string>;
  images: Array<string>;
  dimensions: [number, number];
  sexualContent: SexualContent;
}


export interface Novel extends Work {
  length: number;
  series: {
    id: number;
    title: string;
  };
} // }}}



// Raw API types {{{
namespace Raw {
  export interface Login {
    response: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      scope: string;
      token_type: string;
      user: {
        account: string;
        id: string;
        is_mail_authorized: boolean;
        is_premium: boolean;
        main_address: string;
        name: string;
        x_restrict: number;
        profile_image_urls: {
          px_16x16: string;
          px_170x170: string;
          px_50x50: string;
        };
      };
    };
  }


  export interface Error {
    error: {
      user_message: string;
      message: string;
      reason: string;
      user_message_details: {};
    };
  }


  export interface AuthError {
    has_error: boolean;
    errors: {
      system: {
        message: string;
        code: null | number;
      }
    }
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

  enum SexualContent { SafeForWork = 2, Sexual = 4, Grotesque = 6 }

  interface BaseIllust extends Work {
    type: "illust" | "manga" | "ugoira";
    tools: Array<string>;
    width: number;
    height: number;
    sanity_level: SexualContent;
  }

  // To make Illust type-safe we consider illusts with only one page
  // and illusts with multiple as different types.
  interface SingleIllust extends BaseIllust {
    meta_single_page: { original_image_url: string; };
    meta_pages: null;
  }

  interface MultiIllust extends BaseIllust {
    meta_single_page: null;
    meta_pages: Array<{
      square_medium: string;
      medium: string;
      large: string;
      original: string;
    }>;
  }


  export interface Novel extends Work {
    text_length: number;
    series: {
      id: number;
      title: string;
    };
  }


  type url = string;
  type maybeString = "" | string;
  type maybeNumber = 0 | number;
  type date = string;
  export type publicity = "public" | "private";


  interface User {
    id: number;
    name: string;
    account: string;
    profile_image_urls: { medium: url; };
    comment?: string;
    is_followed?: boolean;
  }


  interface UserDetail {
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


  interface Comment {
    id: number;
    comment: string;
    date: date;
    user: User;
  }


  interface CommentList {
    total_comments?: number;
    next_url: url | null;
    comments: Array<Comment>;
  }


  interface UgoiraDetail {
    ugoira_metadata: {
      zip_urls: { medium: url; }
      frames: Array<{
        file: string;
        delay: number;
      }>;
    };
  }


  interface TrendingTags {
    trend_tags: Array<{
      tag: string;
      illust: Illust;
    }>;
  }


  interface Paged {
    next_url: url | null;
  }


  export interface IllustList extends Paged {
    illusts: Array<Illust>;
  }


  interface IllustDetail {
    illust: Illust;
  }


  interface UserPreviews extends Paged {
    user_previews: Array<{
      user: User;
      illusts: Array<Illust>;
      novels: Array<Novel>;
      is_muted: boolean;
    }>;
  }


  interface TrendingTags {
    trend_tags: Array<{
      tag: string;
      illust: Illust;
    }>;
  }
} // }}}



// Convert functions {{{
// Functions to convert from API objects to nicer ones.
namespace to {
  export function Tokens(r: Raw.Login): Tokens {
    const now = new Date();
    const expires = new Date(
      now.getTime() + (r.response.expires_in * 1000)
    );

    return {
      access: r.response.access_token,
      refresh: r.response.refresh_token,
      expires: expires
    };
  }


  export function MyInfo(r: Raw.Login): MyInfo {
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
  }


  export function Work(w: Raw.Work): Work {
    return {
      id: w.id,
      title: w.title,
      caption: w.caption,
      date: new Date(w.create_date),
      userId: w.user.id,
      pages: w.page_count,
      tags: w.tags.map(x => x.name),
      thumbnail: w.image_urls.square_medium,
      bookmarked: w.is_bookmarked
    };
  }


  export function Illust(i: Raw.Illust): Illust {
    let illust: Illust = to.Work(i) as Illust;
    illust.tools = i.tools;
    illust.dimensions = [i.width, i.height];
    illust.type = i.type;

    if (i.meta_single_page) {
      illust.images = [i.meta_single_page.original_image_url];
    } else if (i.meta_pages) {
      illust.images = i.meta_pages.map(x => x.original);
    }

    illust.sexualContent = i.sanity_level / 2;

    return illust;
  }


  function Novel(n: Raw.Novel): Novel {
    let novel: Novel = to.Work(n) as Novel;
    novel.length = n.text_length;
    novel.series = n.series;
    return novel;
  }
} // }}}



// Auth & helper functions {{{
function authRequest(params: Array<[string, string]>): Promise<[Tokens, MyInfo]> {
  const authRoot = 'https://oauth.secure.pixiv.net/';

  const base = [
    ['get_secure_url', 'true'],
    ['client_id', 'MOBrBDS8blbauoSck0ZfDbtuzpyT'],
    ['client_secret', 'lsACyCD94FhDUtGTXi3QzcFE2uU1hqtDaKeqrdwj']
  ];

  return new Promise((accept, reject) => {
    request('POST', authRoot + 'auth/token', [
      ['Content-Type', 'application/x-www-form-urlencoded']
    ], base.concat(params)
    ).then (
      r => {
        const resp: Raw.Login = JSON.parse(r);
        accept([to.Tokens(resp), to.MyInfo(resp)]);
      },
      e => {
        try {
          const err: Raw.AuthError = JSON.parse(e);
          reject(err.errors.system.message.toString());
        } catch(_) { reject('Couldn\'t connect to the server'); }
      });
  });
}


function login(name: string, password: string): Promise<[Tokens, MyInfo]> {
  return authRequest([
    ['grant_type', 'password'],
    ['username', name],
    ['password', password]
  ]);
}


function refresh(refreshToken: string) {
  return authRequest([
    ['grant_type', 'refresh_token'],
    ['refresh_token', refreshToken]
  ]);
}



function getUrlPath(urlString: string | null) {
  if (!urlString) return null;

  try {
    const url = new URL(urlString);
    return url.pathname.slice(1) + url.hash + url.search;
  } catch (_) { return null; }
} // }}}



// Cancer {{{
export function proxy(url: string) {
  return 'http://localhost:9292/' + url;
}


function request(
  method: Ajax.Method, url: string, headers?: Array<[string, string]>, data?: any
): Promise<string> {
  return Ajax.request(method, 'http://localhost:9292/' + encodeURI(url), headers, data);
} // }}}
