import * as Ajax from "./ajax";


namespace RawAPI {
  type url  = string;
  type date = string;
  type maybeString = string;
  type maybeNumber = number;
  type publicity = string;


  enum SexualContent {
    SafeForWork = 2,
    Sexual = 4,
    Grotesque = 6
  }


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


  interface Error {
    error: {
      user_message: string;
      message: string;
      reason: string;
      user_message_details: {};
    };
  }


  interface Work {
    id: number;
    title: string;
    caption: string;
    create_date: date;
    user: User;
    page_count: number;
    tags: Array<{ name: string; }>;

    image_urls: {
      square_medium: url;
      medium: url;
      large: url;
    };

    restrict: number;
    visible: boolean;

    total_bookmarks?: number;
    total_views?: number;
    total_comments?: number;

    is_muted: boolean;
    is_bookmarked: boolean;
  }


  interface Illust extends Work {
    type: string; // illust | manga | ugoira
    tools: Array<string>;

    meta_single_page: { original_image_url: url; } | null;
    meta_pages: Array<{
      square_medium: url;
      medium: url;
      large: url;
      original: url;
    }>;

    width: number;
    height: number;

    sanity_level: SexualContent;
  }


  interface Novel extends Work {
    text_length: number;
    series: {
      id: number;
      title: number;
    };
  }


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


  interface IllustList extends Paged {
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



const root = 'https://oauth.secure.pixiv.net/'


function request(method: Ajax.Method, url: string, data?: any) {
  return Ajax.request(method, 'http://localhost:9292/' + encodeURI(url), data);
}


export function login(name: string, password: string) {
  return request(Ajax.Method.POST, root + 'auth/token', {
    get_secure_url: 'true',
    client_id: 'MOBrBDS8blbauoSck0ZfDbtuzpyT',
    client_secret: 'lsACyCD94FhDUtGTXi3QzcFE2uU1hqtDaKeqrdwj',
    grant_type: 'password',
    username: name,
    password: password
  })
}


export class API {
  tokens: {
    refresh: string;
    access: string;
    expires: Date;
  };

  init(refreshToken: string, accessToken?: string, expires?: Date): Promise<API> {
    return new Promise((resolve, reject) => {
      if (!(accessToken && expires) || (new Date()) > expires) {
        this.refresh(refreshToken)
          .then(resp => {
            const now = new Date();
            const response: RawAPI.Login = JSON.parse(resp);
            expires = new Date(
              now.getTime() + (response.response.expires_in * 1000)
            );

            this.tokens = {
              refresh: response.response.refresh_token,
              access: response.response.access_token,
              expires: expires
            };

            resolve(this);
          })
          .catch(({ status, body }) => {
            reject(JSON.parse(body));
          });
      } else {
        this.tokens = {
          refresh: refreshToken,
          access: accessToken,
          expires: expires
        };

        resolve(this);
      }
    });
  }

  refresh(refreshToken: string) {
    return request(Ajax.Method.POST, root + 'auth/token', {
      get_secure_url: 'true',
      client_id: 'MOBrBDS8blbauoSck0ZfDbtuzpyT',
      client_secret: 'lsACyCD94FhDUtGTXi3QzcFE2uU1hqtDaKeqrdwj',
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  }
}
