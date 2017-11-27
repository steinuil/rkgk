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


export interface AutoComplete {
  search_auto_complete_keywords: Array<string>;
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
export interface SingleIllust extends BaseIllust {
  meta_single_page: { original_image_url: string; };
  meta_pages: null;
}

export interface MultiIllust extends BaseIllust {
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
