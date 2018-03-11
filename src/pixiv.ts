import * as Raw from "./raw";


export interface IApi {
  // Reset credentials to a username and password in case
  // an InvalidCredentials error is thrown.
  setCredentials(username: string, password: string): void;

  // Latest manga and illustrations by the users you follow.
  myFeed(opts?: {
    restrict?: "public" | "private" | "all",
    offset?: number
  }): Promise<Paged<Illust[]>>;

  // Latest novels by the users you follow.
  myNovelFeed(opts?:{
    restrict?: "public" | "private" | "all",
    offset?: number
  }): Promise<Paged<Novel[]>>;

  // Latest illustrations globally.
  globalFeed(opts?: {
    type?: "illust" | "manga",
    offset?: number
  }): Promise<Paged<Illust[]>>;

  // Latest novels globally.
  globalNovelFeed(opts?: {
    offset?: number
  }): Promise<Paged<Novel[]>>;

  // Latest illustrations and manga by your MyPixiv users
  myPixivFeed(o?: { offset?: number }): Promise<Paged<Illust[]>>;

  // Latest novels by your MyPixiv users
  myPixivNovelFeed(o?: { offset?: number }): Promise<Paged<Novel[]>>;

  // Live feeds by users you follow
  myLiveFeed(opts?: {
    offset?: number
  }): Promise<Paged<Live[]>>;

  /*
  myIllustBookmarks(opts?: {
    restrict?: "public" | "private",
    lastBookmark?: number
  }): Promise<Paged<Illust[]>>;

  myNovelBookmarks(opts?: {
    restrict?: "public" | "private",
    lastBookmark?: number
  }): Promise<Paged<Novel[]>>;
  */

  // Search for illustrations and manga matching a given query.
  searchIllusts(query: string, opts?: {
    match?: "partial_match_for_tags" | "exact_match_for_tags" | "title_and_caption",
    within?: "within_last_day" | "within_last_week" | "within_last_month" | [Date, Date],
    sortMode?: "date_desc" | "date_asc",
    offset?: number
  }): Promise<Paged<Illust[]>>;

  // Search for novels matching a given query.
  searchNovels(query: string, opts?: {
    match?: "partial_match_for_tags" | "exact_match_for_tags" | "title_and_caption",
    within?: "within_last_day" | "within_last_week" | "within_last_month" | [Date, Date],
    sortMode?: "date_desc" | "date_asc",
    offset?: number
  }): Promise<Paged<Novel[]>>;

  // Search for users.
  searchUsers(query: string, opts?: {
    offset?: number
  }): Promise<Paged<UserPreview[]>>;

  // Most popular illustrations and manga for a given query.
  searchPopularIllusts(query: string, opts?: {
    match?: "partial_match_for_tags" | "exact_match_for_tags" | "title_and_caption"
  }): Promise<Illust[]>;

  // Most popular novels for a given query.
  searchPopularNovels(query: string, opts?: {
    match?: "partial_match_for_tags" | "exact_match_for_tags" | "title_and_caption"
  }): Promise<Novel[]>;

  // Tag completions for a given search query.
  autoComplete(query: string): Promise<string[]>;

  // Recommendations based on a seed illustration.
  relatedIllusts(
    startId: number,
    prev?: Array<number>
  ): Promise<Paged<Illust[]>>;

  // Recommended users based on a seed user.
  relatedUsers(id: number): Promise<UserPreview[]>;

  // List of popular live feeds.
  popularLiveFeeds(opts?: {
    offset?: number
  }): Promise<Paged<Live[]>>;

  // Popular tags with a sample illustration.
  trendingTags(): Promise<Array<[string, Illust]>>;

  // Popular illustrations.
  rankingIllusts(opts?: {
    mode?: "day" | "day_female" | "day_male"
      | "month" | "week" | "week_original" | "week_rookie",
    date?: Date,
    offset?: number
  }): Promise<Paged<Illust[]>>;

  rankingManga(opts?: {
    mode?: "day" | "month" | "week" | "week_rookie",
    date?: Date,
    offset?: number
  }): Promise<Paged<Illust[]>>;

  rankingNovels(opts?: {
    mode?: "day" | "day_female" | "day_male" | "week" | "week_rookie",
    date?: Date,
    offset?: number
  }): Promise<Paged<Novel[]>>;

  // Works by a given user.
  userIllusts(user: number, opts?: {
    type?: "illust" | "manga",
    offset?: number
  }): Promise<Paged<Illust[]>>;

  userNovels(user: number, opts?: {
    offset?: number
  }): Promise<Paged<Novel[]>>;

  // Public bookmarks by a given user.
  userIllustBookmarks(user: number, opts?: {
    lastBookmark?: number
  }): Promise<Paged<Illust[]>>;

  userNovelBookmarks(user: number, opts?: {
    lastBookmark?: number
  }): Promise<Paged<Novel[]>>;

  // Bookmark or unbookmark an illustration or a manga.
  bookmarkIllust(id: number, opts?: {
    restrict?: "public" | "private",
    tags?: string[]
  }): Promise<void>;

  unbookmarkIllust(id: number): Promise<void>;

  // Bookmark or unbookmark a novel.
  bookmarkNovel(id: number, opts?: {
    restrict?: "public" | "private",
    tags?: string[]
  }): Promise<void>;

  unbookmarkNovel(id: number): Promise<void>;

  // Follow or unfollow a user.
  follow(id: number, opts?: {
    restrict?: "public" | "private",
  }): Promise<void>;

  unfollow(id: number): Promise<void>;
}


// The only instance in which this class throws an error is when
// The username and password are invalid.
export class Api implements IApi {
  private creds: Credentials.t;
  private domains: Domains;

  constructor(args: { refreshToken: string }, d: Domains);
  constructor(args: { username: string, password: string }, d: Domains);
  constructor(args: { refreshToken: string, accessToken: string, expires: Date }, d: Domains);
  constructor(args: any, d: Domains) {
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

    this.domains = d;
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
      this.domains.api + endpoint.url + "?" + outParams.toString(), {
        method: endpoint.method,
        headers: outHeaders
      }
    );

    if (!resp.ok) {
      try {
        const e: Raw.ApiError = await resp.json();
        const err = e.error.user_message || e.error.message;
        if (err.slice(-13) === "invalid_grant") {
          // The token is invalid or has expired; retry
          this.apiReq<T,U>(endpoint);
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
      this.domains.tokenAuth, {
        method: "POST",
        headers: headers,
        body: outParams.toString()
      }
    );

    if (!r.ok) {
      try {
        const e: Raw.AuthError = await r.json();
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
      const resp: Raw.Login = await r.json();
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

      return () =>
        this.apiReq<T,U>({
          method: "GET",
          url: url_.pathname.slice(1),
          params: url_.searchParams,
          unpack: unpack
        });

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
    const unpack = (resp: Raw.IllustList): Paged<Illust[]> => [
      resp.illusts.map(i => To.illust(i)),
      this.nextPage(resp.next_url, unpack)
    ];

    return this.apiReq({
      method: "GET",
      url: "v2/illust/follow",
      params: [
        ["restrict", opts.restrict || "all"],
        ["offset", opts.offset]
      ],
      unpack
    });
  }


  myNovelFeed = (opts: {
    restrict?: "public" | "private" | "all",
    offset?: number
  } = {}): Promise<Paged<Novel[]>> => {
    const unpack = (resp: Raw.NovelList): Paged<Novel[]> => [
      resp.novels.map(n => To.novel(n)),
      this.nextPage(resp.next_url, unpack)
    ];

    return this.apiReq({
      method: "GET",
      url: "v1/novel/follow",
      params: [
        ["restrict", opts.restrict || "all"],
        ["offset", opts.offset]
      ],
      unpack
    });
  }


  globalFeed = (opts: {
    type?: "illust" | "manga",
    offset?: number
  } = {}): Promise<Paged<Array<Illust>>> => {
    const unpack = (resp: Raw.IllustList): Paged<Illust[]> => [
      resp.illusts.map(i => To.illust(i)),
      this.nextPage(resp.next_url, unpack)
    ];

    return this.apiReq({
      method: "GET",
      url: "v1/illust/new",
      params: [
        ["content_type", opts.type || "illust"],
        ["offset", opts.offset]
      ],
      unpack
    });
  }


  globalNovelFeed = (opts: {
    offset?: number
  } = {}): Promise<Paged<Novel[]>> => {
    const unpack = (resp: Raw.NovelList): Paged<Novel[]> => [
      resp.novels.map(n => To.novel(n)),
      this.nextPage(resp.next_url, unpack)
    ];

    return this.apiReq({
      method: "GET",
      url: "v1/novel/new",
      params: [["offset", opts.offset]],
      unpack
    });
  }


  myPixivFeed = (opts: {
    offset?: number
  } = {}): Promise<Paged<Illust[]>> => {
    const unpack = (resp: Raw.IllustList): Paged<Illust[]> => [
      resp.illusts.map(i => To.illust(i)),
      this.nextPage(resp.next_url, unpack)
    ];

    return this.apiReq({
      method: "GET",
      url: "v2/illust/mypixiv",
      params: [["offset", opts.offset]],
      unpack
    });
  }


  myPixivNovelFeed = (opts: {
    offset?: number
  } = {}): Promise<Paged<Novel[]>> => {
    const unpack = (resp: Raw.NovelList): Paged<Novel[]> => [
      resp.novels.map(n => To.novel(n)),
      this.nextPage(resp.next_url, unpack)
    ];

    return this.apiReq({
      method: "GET",
      url: "v1/novel/mypixiv",
      params: [["offset", opts.offset]],
      unpack
    });
  }


  myLiveFeed = (opts: {
    offset?: number
  } = {}): Promise<Paged<Live[]>> => {
    const unpack = (resp: Raw.LiveList): Paged<Live[]> => [
      resp.lives.map(l => To.live(l)),
      this.nextPage(resp.next_url, unpack)
    ];

    return this.apiReq({
      method: "GET",
      url: "v1/live/list",
      params: [
        ["list_type", "following"],
        ["offset", opts.offset]
      ],
      unpack
    });
  }


  /*
  myIllustBookmarks = (opts: {
    restrict?: "public" | "private",
    lastBookmark?: number
  } = {}): Promise<Paged<Illust[]>> => {
    const unpack = (resp: Raw.IllustList): Paged<Illust[]> => [
      resp.illusts.map(i => To.illust(i)),
      this.nextPage(resp.next_url, unpack)
    ];

    return this.apiReq({
      method: "GET",
      url: "v1/user/bookmarks/illust",
      params: [
        ["user_id", this.info.id],
        ["restrict", opts.restrict || "public"],
        ["max_bookmark_id", opts.lastBookmark]
      ],
      unpack
    });
  }


  myNovelBookmarks = (opts: {
    restrict?: "public" | "private",
    lastBookmark?: number
  } = {}): Promise<Paged<Novel[]>> => {
    const unpack = (resp: Raw.NovelList): Paged<Novel[]> => [
      resp.novels.map(n => To.novel(n)),
      this.nextPage(resp.next_url, unpack)
    ];

    return this.apiReq({
      method: "GET",
      url: "v1/user/bookmarks/novel",
      params: [
        ["user_id", this.info.id],
        ["restrict", opts.restrict || "public"],
        ["max_bookmark_id", opts.lastBookmark]
      ],
      unpack
    });
  }
  */


  // --------------------------------------------------------------------------
  searchIllusts = (query: string, opts: {
    match?: "partial_match_for_tags" | "exact_match_for_tags" | "title_and_caption",
    within?: "within_last_day" | "within_last_week" | "within_last_month" | [Date, Date],
    sortMode?: "date_desc" | "date_asc",
    offset?: number
  } = {}): Promise<Paged<Illust[]>> => {
    const unpack = (resp: Raw.IllustList): Paged<Illust[]> => [
      resp.illusts.map(i => To.illust(i)),
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

    return this.apiReq({
      method: "GET",
      url: "v1/search/illust",
      params, unpack
    });
  }


  searchNovels = (query: string, opts: {
    match?: "partial_match_for_tags" | "exact_match_for_tags" | "title_and_caption",
    within?: "within_last_day" | "within_last_week" | "within_last_month" | [Date, Date],
    sortMode?: "date_desc" | "date_asc",
    offset?: number
  } = {}): Promise<Paged<Novel[]>> => {
    const unpack = (resp: Raw.NovelList): Paged<Novel[]> => [
      resp.novels.map(n => To.novel(n)),
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

    return this.apiReq({
      method: "GET",
      url: "v1/search/novel",
      params, unpack
    });
  }


  searchUsers = (query: string, opts: {
    offset?: number
  } = {}): Promise<Paged<UserPreview[]>> => {
    const unpack = (resp: Raw.UserPreviews): Paged<UserPreview[]> => [
      resp.user_previews.map(u => To.userPreview(u)),
      this.nextPage(resp.next_url, unpack)
    ];

    return this.apiReq({
      method: "GET",
      url: "v1/search/user",
      params: [
        ["word", query],
        ["offset", opts.offset]
      ],
      unpack
    });
  }


  searchPopularIllusts = (query: string, opts: {
    match?: "partial_match_for_tags" | "exact_match_for_tags" | "title_and_caption"
  } = {}): Promise<Illust[]> => {
    const unpack = (resp: Raw.PopularIllusts): Illust[] =>
      resp.illusts.map(i => To.illust(i));

    return this.apiReq({
      method: "GET",
      url: "v1/search/popular-preview/illust",
      params: [
        ["word", query],
        ["search_target", opts.match || "partial_match_for_tags"]
      ],
      unpack
    });
  }


  searchPopularNovels = (query: string, opts: {
    match?: "partial_match_for_tags" | "exact_match_for_tags" | "title_and_caption"
  } = {}): Promise<Novel[]> => {
    const unpack = (resp: Raw.PopularNovels): Novel[] =>
      resp.novels.map(n => To.novel(n));

    return this.apiReq({
      method: "GET",
      url: "v1/search/popular-preview/illust",
      params: [
        ["word", query],
        ["search_targets", opts.match || "partial_match_for_tags"]
      ],
      unpack
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


  // --------------------------------------------------------------------------
  relatedIllusts = (startId: number, prev: number[] = []): Promise<Paged<Illust[]>> => {
    const unpack = (resp: Raw.IllustList): Paged<Array<Illust>> => [
      resp.illusts.map(i => To.illust(i)),
      this.nextPage(resp.next_url, unpack)
    ];

    return this.apiReq({
      method: "GET",
      url: "v2/illust/related",
      params: [
        ["illust_id", startId],
        ["seed_illust_ids", prev]
      ],
      unpack
    });
  }


  relatedUsers = (id: number): Promise<UserPreview[]> => {
    const unpack = (resp: Raw.UserPreviews): UserPreview[] =>
      resp.user_previews.map(u => To.userPreview(u));

    return this.apiReq({
      method: "GET",
      url: "v1/user/related",
      params: [
        ["seed_user_id", id]
      ],
      unpack
    });
  }


  popularLiveFeeds = (opts: {
    offset?: number
  } = {}): Promise<Paged<Live[]>> => {
    const unpack = (resp: Raw.LiveList): Paged<Live[]> => [
      resp.lives.map(l => To.live(l)),
      this.nextPage(resp.next_url, unpack)
    ];

    return this.apiReq({
      method: "GET",
      url: "v1/live/list",
      params: [
        ["list_type", "popular"],
        ["offset", opts.offset]
      ],
      unpack
    });
  }


  trendingTags = (): Promise<Array<[string, Illust]>> => {
    const unpack = (resp: Raw.TrendingTags): Array<[string, Illust]> =>
      resp.trend_tags.map((t): [string, Illust] => [t.tag, To.illust(t.illust)]);

    return this.apiReq({
      method: "GET",
      url: "v1/trending-tags/illust",
      params: [],
      unpack
    });
  }


  rankingIllusts = (opts: {
    mode?: "day" | "day_female" | "day_male"
      | "month" | "week" | "week_original" | "week_rookie",
    date?: Date,
    offset?: number
  } = {}): Promise<Paged<Illust[]>> => {
    const unpack = (resp: Raw.IllustList): Paged<Illust[]> => [
      resp.illusts.map(i => To.illust(i)),
      this.nextPage(resp.next_url, unpack)
    ];

    return this.apiReq({
      method: "GET",
      url: "v1/illust/ranking",
      params: [
        ["mode", opts.mode || "day"],
        ["date", opts.date],
        ["offset", opts.offset]
      ],
      unpack
    });
  }


  rankingManga = (opts: {
    mode?: "day" | "month" | "week" | "week_rookie",
    date?: Date,
    offset?: number
  } = {}): Promise<Paged<Illust[]>> => {
    const unpack = (resp: Raw.IllustList): Paged<Illust[]> => [
      resp.illusts.map(i => To.illust(i)),
      this.nextPage(resp.next_url, unpack)
    ];

    return this.apiReq({
      method: "GET",
      url: "v1/illust/ranking",
      params: [
        ["mode", (opts.mode || "day") + "_manga"],
        ["date", opts.date],
        ["offset", opts.offset]
      ],
      unpack
    });
  }


  rankingNovels = (opts: {
    mode?: "day" | "day_female" | "day_male" | "week" | "week_rookie",
    date?: Date,
    offset?: number
  } = {}): Promise<Paged<Novel[]>> => {
    const unpack = (resp: Raw.NovelList): Paged<Novel[]> => [
      resp.novels.map(n => To.novel(n)),
      this.nextPage(resp.next_url, unpack)
    ];

    return this.apiReq({
      method: "GET",
      url: "v1/novel/ranking",
      params: [
        ["mode", opts.mode || "day"],
        ["date", opts.date],
        ["offset", opts.offset]
      ],
      unpack
    });
  }


  // --------------------------------------------------------------------------
  userIllusts = (user: number, opts: {
    type?: "illust" | "manga",
    offset?: number
  } = {}): Promise<Paged<Illust[]>> => {
    const unpack = (resp: Raw.IllustList): Paged<Illust[]> => [
      resp.illusts.map(i => To.illust(i)),
      this.nextPage(resp.next_url, unpack)
    ];

    return this.apiReq({
      method: "GET",
      url: "v1/user/illusts",
      params: [
        ["user_id", user],
        ["type", opts.type || "illust"],
        ["offset", opts.offset]
      ],
      unpack
    });
  }


  userNovels = (user: number, opts: {
    offset?: number
  } = {}): Promise<Paged<Novel[]>> => {
    const unpack = (resp: Raw.NovelList): Paged<Novel[]> => [
      resp.novels.map(i => To.novel(i)),
      this.nextPage(resp.next_url, unpack)
    ];

    return this.apiReq({
      method: "GET",
      url: "v1/user/illusts",
      params: [
        ["user_id", user],
        ["type", "novel"],
        ["offset", opts.offset]
      ],
      unpack
    });
  }


  userIllustBookmarks = (id: number, opts: {
    lastBookmark?: number
  } = {}): Promise<Paged<Illust[]>> => {
    const unpack = (resp: Raw.IllustList): Paged<Illust[]> => [
      resp.illusts.map(i => To.illust(i)),
      this.nextPage(resp.next_url, unpack)
    ];

    return this.apiReq({
      method: "GET",
      url: "v1/user/bookmarks/illust",
      params: [
        ["user_id", id],
        ["restrict", "public"],
        ["max_bookmark_id", opts.lastBookmark]
      ],
      unpack
    });
  }


  userNovelBookmarks = (id: number, opts: {
    lastBookmark?: number
  } = {}): Promise<Paged<Novel[]>> => {
    const unpack = (resp: Raw.NovelList): Paged<Novel[]> => [
      resp.novels.map(n => To.novel(n)),
      this.nextPage(resp.next_url, unpack)
    ];

    return this.apiReq({
      method: "GET",
      url: "v1/user/bookmarks/novel",
      params: [
        ["user_id", id],
        ["restrict", "public"],
        ["max_bookmark_id", opts.lastBookmark]
      ],
      unpack
    });
  }


  // --------------------------------------------------------------------------
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


  bookmarkNovel = async (id: number, opts: {
    restrict?: "public" | "private",
    tags?: string[]
  } = {}): Promise<void> => {
    await this.apiReq({
      method: "POST",
      url: "v2/novel/bookmark/add",
      params: [
        ["novel_id", id],
        ["restrict", opts.restrict || "public"],
        ["tags", opts.tags]
      ],
      unpack: (_) => {}
    });
  }


  unbookmarkNovel = async (id: number): Promise<void> => {
    await this.apiReq({
      method: "POST",
      url: "v1/novel/bookmark/delete",
      params: [["novel_id", id]],
      unpack: (_) => {}
    });
  }


  follow = async (id: number, opts: {
    restrict?: "public" | "private"
  } = {}): Promise<void> => {
    await this.apiReq({
      method: "POST",
      url: "v1/user/follow/add",
      params: [
        ["user_id", id],
        ["restrict", opts.restrict || "public"]
      ],
      unpack: (_) => {}
    });
  }


  unfollow = async (id: number): Promise<void> => {
    await this.apiReq({
      method: "POST",
      url: "v1/user/follow/delete",
      params: [["user_id", id]],
      unpack: (_) => {}
    });
  }
}


export class InvalidCredentials extends Error {
  constructor() {
    super();
    Object.setPrototypeOf(this, InvalidCredentials.prototype);
  }
}


export interface Domains {
  api: string;
  tokenAuth: string;
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




namespace To {
  export const myInfo = (r: Raw.Login): MyInfo => {
    const user = r.response.user;
    return {
      name: user.account,
      nick: user.name,
      id: parseInt(user.id),
      email: user.mail_address,
      avatar: {
        big: user.profile_image_urls.px_170x170,
        medium: user.profile_image_urls.px_50x50,
        small: user.profile_image_urls.px_16x16
      }
    };
  };

  export const user = (u: Raw.User): User => ({
    id: u.id,
    accountName: u.account,
    displayName: u.name,
    avatar: u.profile_image_urls.medium,
    description: u.comment || null,
    followed: u.is_followed || null
  });

  export const work = (w: Raw.Work): Work => ({
    id: w.id,
    title: w.title,
    caption: w.caption,
    date: new Date(w.create_date),
    user: user(w.user),
    pages: w.page_count,
    tags: w.tags.map(x => x.name),
    thumbnail: w.image_urls.square_medium,
    bookmarked: w.is_bookmarked
  });

  export const illust = (i: Raw.Illust): Illust => {
    let illust = work(i) as Illust;
    illust.tools = i.tools;
    illust.dimensions = [i.width, i.height];
    illust.type = i.type;

    if (i.meta_single_page.original_image_url) {
      illust.images = [i.meta_single_page.original_image_url];
    } else {
      illust.images = i.meta_pages!.map(x => x.image_urls.original);
    }

    illust.sexualContent = (i.sanity_level / 2) - 1;

    return illust;
  };

  export const novel = (n: Raw.Novel): Novel => {
    let novel = work(n) as Novel;
    novel.length = n.text_length;
    novel.series = n.series;
    return novel;
  };

  export const userPreview = (u: Raw.UserPreview): UserPreview => ({
    user: user(u.user),
    illusts: u.illusts.map(i => illust(i)),
    novels: u.novels.map(n => novel(n)),
    muted: u.is_muted
  });


  export const live = (l: Raw.Live): Live => ({
    id: parseInt(l.id),
    channelId: l.channel_id,
    name: l.name,
    owner: user(l.owner.user),
    performers: l.performers.map(i => user(i.user)),
    performerCount: l.performer_count,
    created: new Date(l.created_at),
    closed: l.is_closed,
    micEnabled: l.is_enabled_mic_input,
    muted: l.is_muted,
    r15: l.is_r15,
    r18: l.is_r18,
    adult: l.is_adult,
    single: l.is_single,
    members: l.member_count,
    viewers: l.total_audience_count,
    mode: l.mode,
    server: l.server,
    thumbnail: l.thumbnail_image_url
  });
}


export interface UserPreview {
  user: User;
  illusts: Array<Illust>;
  novels: Array<Novel>;
  muted: boolean;
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
  pages: number;
  tags: Array<string>;
  thumbnail: string;
  /*
  bookmarks: number | null;
  views: number | null;
  commentCount: number | null;
  */
  bookmarked: boolean;
}


export enum SexualContent { None, Sexual, Grotesque }


export enum Restrict { Public, Private }


export interface Illust extends Work {
  type: "illust" | "manga" | "ugoira";
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


export interface Live {
  id: number;
  channelId: string;
  name: string;
  owner: User;
  performers: Array<User>;
  performerCount: number;
  created: Date;
  closed: boolean;
  micEnabled: boolean;
  muted: boolean;
  r15: boolean;
  r18: boolean;
  adult: boolean;
  single: boolean;
  members: number;
  viewers: number;
  mode: "screencast" | "webcam";
  server: string;
  thumbnail: string;
}