import * as Ajax from "./ajax";


namespace RawAPI {
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

  export type IllustType = "illust" | "manga" | "ugoira";

  enum SexualContent { SafeForWork = 2, Sexual = 4, Grotesque = 6 }

  interface BaseIllust extends Work {
    type: IllustType;
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
}



const authRoot = 'https://oauth.secure.pixiv.net/';
const root = 'https://app-api.pixiv.net/';


function request(
  method: Ajax.Method, url: string, headers?: Array<[string, string]>, data?: any
): Promise<string> {
  return Ajax.request(method, 'http://localhost:9292/' + encodeURI(url), headers, data);
}


export interface Tokens {
  access: string;
  refresh: string;
  expires: Date;
}


function toTokens(r: RawAPI.Login): Tokens {
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


function toMyInfo(r: RawAPI.Login): MyInfo {
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


export enum IllustType { Illust, Manga, Ugoira }


export enum SexualContent { None = 1, Sexual, Grotesque }


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
}


function toWork(w: RawAPI.Work): Work {
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


function toIllust(i: RawAPI.Illust): Illust {
  let illust: Illust = toWork(i) as Illust;
  illust.tools = i.tools;
  illust.dimensions = [i.width, i.height];
  switch (i.type) {
    case "illust":
      illust.type = IllustType.Illust;
      break;
    case "manga":
      illust.type = IllustType.Manga;
      break;
    case "ugoira":
      illust.type = IllustType.Ugoira;
      break;
  }

  if (i.meta_single_page) {
    illust.images = [i.meta_single_page.original_image_url];
  } else if (i.meta_pages) {
    illust.images = i.meta_pages.map(x => x.original);
  }

  illust.sexualContent = i.sanity_level / 2;

  return illust;
}


function toNovel(n: RawAPI.Novel): Novel {
  let novel: Novel = toWork(n) as Novel;
  novel.length = n.text_length;
  novel.series = n.series;
  return novel;
}


export function login(name: string, password: string): Promise<[Tokens, MyInfo]> {
  return new Promise((resolve, reject) => {
    request(Ajax.Method.POST, authRoot + 'auth/token', [
      ["Content-Type", "application/x-www-form-urlencoded"]
    ], [
      ['get_secure_url', 'true'],
      ['client_id', 'MOBrBDS8blbauoSck0ZfDbtuzpyT'],
      ['client_secret', 'lsACyCD94FhDUtGTXi3QzcFE2uU1hqtDaKeqrdwj'],
      ['grant_type', 'password'],
      ['username', name],
      ['password', password]
    ]).then(r => {
      const resp: RawAPI.Login = JSON.parse(r);
      resolve([toTokens(resp), toMyInfo(resp)]);
    }, reject)
  });
}


export class API {
  tokens: Tokens;

  init(
    refreshToken: string, accessToken?: string, expires?: Date
  ): Promise<[API, MyInfo | null]> {
    return new Promise((resolve, reject) => {
      if (!(accessToken && expires) || (new Date()) > expires) {
        this.refresh(refreshToken)
          .then(resp => {
            const response: RawAPI.Login = JSON.parse(resp);
            this.tokens = toTokens(response);
            resolve([this, toMyInfo(response)]);
          })
          .catch(({ status, body }) => {
            try {
              reject(JSON.parse(body));
            } catch (_) {
              reject("Couldn't connect");
            }
          });
      } else {
        this.tokens = {
          refresh: refreshToken,
          access: accessToken,
          expires: expires
        };

        resolve([this, null]);
      }
    });
  }

  refresh(refreshToken: string) {
    return request(Ajax.Method.POST, authRoot + 'auth/token', [
      ['Content-Type', 'application/x-www-form-urlencoded']
    ], [
      ['get_secure_url', 'true'],
      ['client_id', 'MOBrBDS8blbauoSck0ZfDbtuzpyT'],
      ['client_secret', 'lsACyCD94FhDUtGTXi3QzcFE2uU1hqtDaKeqrdwj'],
      ['grant_type', 'refresh_token'],
      ['refresh_token', refreshToken]
    ]);
  }


  feed(): Promise<Array<Illust>> {
    return new Promise((resolve, reject) => {
      request(Ajax.Method.GET, root + 'v2/illust/follow?restrict=public', [
        ['Authorization', `Bearer ${this.tokens.access}`]
      ])
        .then(r => {
          const resp: RawAPI.IllustList = JSON.parse(r);
          const illusts = resp.illusts.map(i => toIllust(i));
          resolve(illusts);
        });
    });
  }

  bookmark(id: number) {
    return request(Ajax.Method.POST, root + 'v2/illust/bookmark/add', [
      ['Authorization', `Bearer ${this.tokens.access}`],
      ['Content-Type', 'application/x-www-form-urlencoded']
    ], [
      ['illust_id', id.toString()],
      ['restrict', 'public']
    ]);
  }

  unbookmark(id: number) {
    return request(Ajax.Method.POST, root + 'v1/illust/bookmark/delete', [
      ['Authorization', `Bearer ${this.tokens.access}`],
      ['Content-Type', 'application/x-www-form-urlencoded']
    ], [
      ['illust_id', id.toString()]
    ]);
  }
}


export enum Restrict { Public, Private };


export function proxy(url: string) {
  return 'http://localhost:9292/' + url;
}
