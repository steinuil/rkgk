export namespace RawAPI {
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
