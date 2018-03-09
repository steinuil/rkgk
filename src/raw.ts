// Interfaces to the raw server responses.


// Authentication response
export interface Login {
  response: {
    device_token: string;
    refresh_token: string;
    access_token: string;
    expires_in: number;
    token_type: "bearer";
    scope: "";
    user: {
      id: string; // stringified int
      name: string;
      account: string;
      mail_address: string;
      is_premium: boolean;
      x_restrict: number;
      is_mail_authorized: boolean;
      profile_image_urls: {
        px_16x16: string;
        px_50x50: string;
        px_170x170: string;
      }
    };
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


export interface ApiError {
  error: {
    user_message: string;
    message: string;
    reason: string;
    user_mesage_detauls: {};
  };
}


// Utility types
export type date = string;
export type date_time = string;

export enum SexualContent {
  SafeForWork = 2,
  Sexual      = 4,
  Grotesque   = 6,
}


export interface XXX {}


// Base types
export interface User {
  id: number;
  name: string;
  account: string;
  profile_image_urls: { medium: string; };
  comment?: string;
  is_followed?: boolean;
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


export interface Illust extends Work {
  type: "illust" | "manga" | "ugoira";
  tools: Array<string>;
  width: number;
  height: number;
  sanity_level: SexualContent;
  meta_single_page: { original_image_url?: string; };
  meta_pages: Array<{
    image_urls: {
      square_medium: string;
      medium: string;
      large: string;
      original: string;
    };
  }> | null;
}


export interface Novel extends Work {
  text_length: number;
  series: {
    id: number;
    title: string;
  };
}


export interface Comment {
  id: number;
  comment: string;
  date: date;
  user: User;
}


export interface Live {
  channel_id: string;
  created_at: date_time;
  id: string;
  is_adult: boolean;
  is_closed: boolean;
  is_enabled_mic_input: boolean;
  is_muted: boolean;
  is_r15: boolean;
  is_r18: boolean;
  is_single: boolean;
  member_count: number;
  mode: "screencast" | "webcam";
  name: string;
  owner: { user: User; };
  performer_count: number;
  performers: Array<{ user: User; }>;
  publicity: "open" | "closed";
  server: string;
  thumbnail_image_url: string;
  total_audience_count: number;
}


export interface Article {
  id: number;
  title: string;
  pure_title: string;
  publish_date: date_time;
  article_url: string;
  thumbnail: string;
  category: "inspiration" | "spotlight" | string;
  subcategory_label: "Recommend" | "Illustration" | string;
}


// List pages
export interface Paged {
  next_url: string | null;
}


export interface IllustList extends Paged {
  illusts: Array<Illust>;
}


export interface NovelList extends Paged {
  novels: Array<Novel>;
}


export interface UserPreviews extends Paged {
  user_previews: Array<{
    user: User;
    illusts: Array<Illust>;
    novels: Array<Novel>;
    is_muted: boolean;
  }>;
}


export interface CommentList extends Paged {
  total_comments?: number;
  comments: Array<Comment>;
}


export interface NovelMarkers extends Paged {
  marked_novels: Array<{
    novel: Novel;
    novel_marker: {
      page: number;
    };
  }>;
}


export interface LiveList extends Paged {
  lives: Array<Live>;
  live_info: null;
}


export interface SpotlightArticles extends Paged {
  spotlight_articles: Array<Article>;
}


// Other pages
export interface TrendingTags {
  trend_tags: Array<{
    tag: string;
    illust: Illust;
  }>;
}


export interface IllustRanking {
  illusts: Array<Illust>;
  contest_exists: boolean;
  ranking_illusts: Array<XXX>;
}


export interface IllustDetail {
  illust: Illust;
}


export interface NovelText {
  novel_marker: XXX;
  novel_text: string;
  series_next: XXX;
  series_prev: XXX;
}


export interface UgoiraDetail {
  ugoira_metadata: {
    zip_urls: { medium: string; }
    frames: Array<{
      file: string;
      delay: number;
    }>;
  };
}


export interface BookmarkDetail {
  bookmark_detail: {
    is_bookmarked: boolean;
    restrict: "public" | "private";
    tags: Array<{
      name: string;
      is_registered: boolean;
    }>;
  };
}


export interface MuteList {
  mute_limit_count: number;
  muted_count: number;
  muted_tags: Array<XXX>;
  muted_tags_count: number;
  muted_users: Array<XXX>;
  muted_users_count: number;
}


export interface UserDetail {
  user: User;

  profile: {
    webpage: string | null;

    gender: "" | string;

    birth_day: "" | string;
    birth_year: 0 | number;

    region: "" | string;
    address_id: 0 | number;
    country_code: "" | string;

    job: "" | string;
    job_id: 0 | number;

    background_image_url: string | null;
    twitter_account: "" | string;
    twitter_url: string | null;
    pawoo_url: string | null;
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
    gender: "public" | "private";
    region: "public" | "private";
    birth_day: "public" | "private";
    birth_year: "public" | "private";
    job: "public" | "private";
    pawoo: boolean;
  };

  workspace: {
    pc: "" | string;
    monitor: "" | string;
    tool: "" | string;
    scanner: "" | string;
    tablet: "" | string;
    mouse: "" | string;
    printer: "" | string;
    desktop: "" | string;
    music: "" | string;
    desk: "" | string;
    chair: "" | string;
    comment: "" | string;
    workspace_image_url: string | null;
  };
}


// Various other pages
export interface ApplicationInfo {
  application_info: {
    latest_version: string;
    update_required: boolean;
    update_available: boolean;
    update_message: string;
    notice_exists: boolean;
    store_url: string;
    notice_id: string;
    notice_important: boolean;
    notice_message: string;
  };
}



export namespace Request {
  export interface LiveList {
    url: "v1/live/list";
    method: "GET";

    list_type: "popular" | "following";

    response: LiveList;
  }


  export interface IllustNew {
    url: "v1/illust/new";
    method: "GET";

    filter: "for_ios" | "for_android";
    content_type: "illust" | "manga";

    response: IllustList;
  }


  export interface IllustRanking {
    url: "v1/illust/ranking";
    method: "GET";

    filter: "for_ios" | "for_android";
    mode:
      | "day" | "day_manga" | "day_female" | "day_male"
      | "month" | "month_manga"
      | "week" | "week_manga" | "week_original"
      | "week_rookie" | "week_rookie_manga";
    date?: date;

    response: IllustList;
  }


  export interface NovelRanking {
    url: "v1/novel/ranking";
    method: "GET";

    mode:
      | "day" | "day_female" | "day_male"
      | "week" | "week_rookie";
    date?: date;
  }


  export interface IllustRecommended {
    url: "v1/illust/recommended";
    method: "GET";

    filter: "for_ios" | "for_android";
    include_ranking_illusts: boolean;
    min_bookmark_id_for_recent_illust?: number;
    max_bookmark_id_for_recommend?: number;
    offset?: number;

    response: IllustList | IllustRanking;
  }
}