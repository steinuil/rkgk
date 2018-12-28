import { Illust, Novel, Live, UserPreview, Paged } from './Items';
import { Client } from './Client';
import { Params } from './Params';
import * as Unpack from './Unpack';

const endpoint = <T, U>(
  client: Client,
  opts: {
    method: 'GET' | 'POST';
    url: string;
    params: Params;
    unpack: (raw: T) => U;
  }
): Promise<U> =>
  client
    .request<T>({
      method: opts.method,
      url: opts.url,
      params: opts.params,
    })
    .then(opts.unpack);

/** Latest manga and illustrations by the users you follow. */
export const myFeed = (
  client: Client,
  opts: {
    restrict?: 'public' | 'private' | 'all';
    offset?: number;
  } = {}
): Promise<Paged<Illust[]>> =>
  endpoint(client, {
    method: 'GET',
    url: 'v2/illust/follow',
    //prettier-ignore
    params: [
      ['restrict', opts.restrict || 'all'],
      ['offset', opts.offset],
    ],
    unpack: Unpack.illustList,
  });

/** Latest novels by the users you follow. */
export const myNovelFeed = (
  client: Client,
  opts: {
    restrict?: 'public' | 'private' | 'all';
    offset?: number;
  } = {}
): Promise<Paged<Novel[]>> =>
  endpoint(client, {
    method: 'GET',
    url: 'v1/novel/follow',
    //prettier-ignore
    params: [
      ['restrict', opts.restrict || 'all'],
      ['offset', opts.offset],
    ],
    unpack: Unpack.novelList,
  });

/** Latest illustrations by everyone. */
export const globalFeed = (
  client: Client,
  opts: {
    type?: 'illust' | 'manga';
    offset?: number;
  } = {}
): Promise<Paged<Illust[]>> =>
  endpoint(client, {
    method: 'GET',
    url: 'v1/illust/new',
    //prettier-ignore
    params: [
        ['content_type', opts.type || 'illust'],
        ['offset', opts.offset],
      ],
    unpack: Unpack.illustList,
  });

/** Latest novels by everyone. */
export const globalNovelFeed = (
  client: Client,
  opts: {
    offset?: number;
  } = {}
): Promise<Paged<Novel[]>> =>
  endpoint(client, {
    method: 'GET',
    url: 'v1/novel/new',
    params: [['offset', opts.offset]],
    unpack: Unpack.novelList,
  });

/** Latest illustrations and manga by your MyPixiv users. */
export const myPixivFeed = (
  client: Client,
  opts: {
    offset?: number;
  } = {}
): Promise<Paged<Illust[]>> =>
  endpoint(client, {
    method: 'GET',
    url: 'v2/illust/mypixiv',
    params: [['offset', opts.offset]],
    unpack: Unpack.illustList,
  });

/** Latest novels by your MyPixiv users. */
export const myPixivNovelFeed = (
  client: Client,
  opts: {
    offset?: number;
  } = {}
): Promise<Paged<Novel[]>> =>
  endpoint(client, {
    method: 'GET',
    url: 'v1/novel/mypixiv',
    params: [['offset', opts.offset]],
    unpack: Unpack.novelList,
  });

/** Live feeds by users you follow. */
export const myLiveFeed = (
  client: Client,
  opts: {
    offset?: number;
  } = {}
): Promise<Paged<Live[]>> =>
  endpoint(client, {
    method: 'GET',
    url: 'v1/live/list',
    //prettier-ignore
    params: [
      ['list_type', 'following'],
      ['offset', opts.offset],
    ],
    unpack: Unpack.liveList,
  });

// ----------------------------------------------------------
/** Search for illustrations and manga matching a given query. */
export const searchIllusts = (
  client: Client,
  query: string,
  opts: {
    match?:
      | 'partial_match_for_tags'
      | 'exact_match_for_tags'
      | 'title_and_caption';
    within?:
      | 'within_last_day'
      | 'within_last_week'
      | 'within_last_month'
      | [Date, Date];
    sortMode?: 'date_desc' | 'date_asc';
    offset?: number;
  } = {}
): Promise<Paged<Illust[]>> => {
  const params: Params = [
    ['word', query],
    ['sort', opts.sortMode || 'date_desc'],
    ['search_target', opts.match || 'partial_match_for_tags'],
    ['offset', opts.offset],
  ];

  if (opts.within instanceof Array) {
    const [start, end] =
      opts.within[0] > opts.within[1]
        ? [opts.within[1], opts.within[0]]
        : [opts.within[0], opts.within[1]];

    params.push(['start_date', start], ['end_date', end]);
  } else if (opts.within) {
    params.push(['duration', opts.within]);
  }

  return endpoint(client, {
    method: 'GET',
    url: 'v1/search/illust',
    params,
    unpack: Unpack.illustList,
  });
};

/** Search for novels matching a given query. */
export const searchNovels = (
  client: Client,
  query: string,
  opts: {
    match?:
      | 'partial_match_for_tags'
      | 'exact_match_for_tags'
      | 'title_and_caption';
    within?:
      | 'within_last_day'
      | 'within_last_week'
      | 'within_last_month'
      | [Date, Date];
    sortMode?: 'date_desc' | 'date_asc';
    offset?: number;
  } = {}
): Promise<Paged<Novel[]>> => {
  const params: Params = [
    ['word', query],
    ['sort', opts.sortMode || 'date_desc'],
    ['search_target', opts.match || 'partial_match_for_tags'],
    ['offset', opts.offset],
  ];

  if (opts.within instanceof Array) {
    const [start, end] =
      opts.within[0] > opts.within[1]
        ? [opts.within[1], opts.within[0]]
        : [opts.within[0], opts.within[1]];

    params.push(['start_date', start], ['end_date', end]);
  } else if (opts.within) {
    params.push(['duration', opts.within]);
  }

  return endpoint(client, {
    method: 'GET',
    url: 'v1/search/novel',
    params,
    unpack: Unpack.novelList,
  });
};

/** Search for users. */
export const searchUsers = (
  client: Client,
  query: string,
  opts: {
    offset?: number;
  } = {}
): Promise<Paged<UserPreview[]>> =>
  endpoint(client, {
    method: 'GET',
    url: 'v1/search/user',
    //prettier-ignore
    params: [
      ['word', query],
      ['offset', opts.offset]
    ],
    unpack: Unpack.userPreviews,
  });

/** Most popular illustrations and manga for a given query. */
export const searchPopularIllusts = (
  client: Client,
  query: string,
  opts: {
    match?:
      | 'partial_match_for_tags'
      | 'exact_match_for_tags'
      | 'title_and_caption';
  } = {}
): Promise<Illust[]> =>
  endpoint(client, {
    method: 'GET',
    url: 'v1/search/popular-preview/illust',
    params: [
      ['word', query],
      ['search_target', opts.match || 'partial_match_for_tags'],
    ],
    unpack: Unpack.popularIllusts,
  });

/** Most popular novels for a given query. */
export const searchPopularNovels = (
  client: Client,
  query: string,
  opts: {
    match?:
      | 'partial_match_for_tags'
      | 'exact_match_for_tags'
      | 'title_and_caption';
  } = {}
): Promise<Novel[]> =>
  endpoint(client, {
    method: 'GET',
    url: 'v1/search/popular-preview/illust',
    params: [
      ['word', query],
      ['search_targets', opts.match || 'partial_match_for_tags'],
    ],
    unpack: Unpack.popularNovels,
  });

/** Tag completion for a given search query. */
export const autoComplete = (
  client: Client,
  query: string
): Promise<string[]> =>
  endpoint(client, {
    method: 'GET',
    url: 'v1/search/autocomplete',
    params: [['word', query]],
    unpack: (resp: { search_auto_complete_keywords: string[] }) =>
      resp.search_auto_complete_keywords,
  });

// --------------------------------------------------------------------------
/** Recommendations based on a seed illustration. */
export const relatedIllusts = (
  client: Client,
  startId: number,
  prev: number[] = []
): Promise<Paged<Illust[]>> =>
  endpoint(client, {
    method: 'GET',
    url: 'v2/illust/related',
    //prettier-ignore
    params: [
      ['illust_id', startId],
      ['seed_illust_ids', prev]
    ],
    unpack: Unpack.illustList,
  });

/** Recommended users based on a seed users. */
export const relatedUsers = (
  client: Client,
  id: number
): Promise<UserPreview[]> =>
  endpoint(client, {
    method: 'GET',
    url: 'v1/user/related',
    params: [['seed_user_id', id]],
    unpack: Unpack.userPreviewsNoPaged,
  });

/** List of popular live feeds. */
export const popularLiveFeeds = (
  client: Client,
  opts: {
    offset?: number;
  } = {}
): Promise<Paged<Live[]>> =>
  endpoint(client, {
    method: 'GET',
    url: 'v1/live/list',
    //prettier-ignore
    params: [
      ['list_type', 'popular'],
      ['offset', opts.offset],
    ],
    unpack: Unpack.liveList,
  });

/** Popular tags with a sample illustration. */
export const trendingTags = (client: Client) =>
  endpoint(client, {
    method: 'GET',
    url: 'v1/trending-tags/illust',
    params: [],
    unpack: Unpack.trendingTags,
  });

/** Popular illustrations. */
export const rankingIllusts = (
  client: Client,
  opts: {
    mode?:
      | 'day'
      | 'day_female'
      | 'day_male'
      | 'month'
      | 'week'
      | 'week_original'
      | 'week_rookie';
    date?: Date;
    offset?: number;
  } = {}
): Promise<Paged<Illust[]>> =>
  endpoint(client, {
    method: 'GET',
    url: 'v1/illust/ranking',
    params: [
      ['mode', opts.mode || 'day'],
      ['date', opts.date],
      ['offset', opts.offset],
    ],
    unpack: Unpack.illustList,
  });

/** Popular manga. */
export const rankingManga = (
  client: Client,
  opts: {
    mode?: 'day' | 'month' | 'week' | 'week_rookie';
    date?: Date;
    offset?: number;
  } = {}
): Promise<Paged<Illust[]>> =>
  endpoint(client, {
    method: 'GET',
    url: 'v1/illust/ranking',
    params: [
      ['mode', (opts.mode || 'day') + '_manga'],
      ['date', opts.date],
      ['offset', opts.offset],
    ],
    unpack: Unpack.illustList,
  });

/** Popular novels. */
export const rankingNovels = (
  client: Client,
  opts: {
    mode?: 'day' | 'day_female' | 'day_male' | 'week' | 'week_rookie';
    date?: Date;
    offset?: number;
  } = {}
): Promise<Paged<Novel[]>> =>
  endpoint(client, {
    method: 'GET',
    url: 'v1/novel/ranking',
    params: [
      ['mode', opts.mode || 'day'],
      ['date', opts.date],
      ['offset', opts.offset],
    ],
    unpack: Unpack.novelList,
  });

/** Works by a given user. */
export const userIllusts = (
  client: Client,
  user: number,
  opts: {
    type?: 'illust' | 'manga';
    offset?: number;
  } = {}
): Promise<Paged<Illust[]>> =>
  endpoint(client, {
    method: 'GET',
    url: 'v1/user/illusts',
    params: [
      ['user_id', user],
      ['type', opts.type || 'illust'],
      ['offset', opts.offset],
    ],
    unpack: Unpack.illustList,
  });

/** Novels by a given user. */
export const userNovels = (
  client: Client,
  user: number,
  opts: {
    offset?: number;
  } = {}
): Promise<Paged<Novel[]>> =>
  endpoint(client, {
    method: 'GET',
    url: 'v1/user/illusts',
    //prettier-ignore
    params: [
      ['user_id', user],
      ['type', 'novel'],
      ['offset', opts.offset]
    ],
    unpack: Unpack.novelList,
  });

/** Public bookmarks by a given user. */
export const userIllustBookmarks = (
  client: Client,
  id: number,
  opts: {
    lastBookmark?: number;
  } = {}
): Promise<Paged<Illust[]>> =>
  endpoint(client, {
    method: 'GET',
    url: 'v1/user/bookmarks/illust',
    params: [
      ['user_id', id],
      ['restrict', 'public'],
      ['max_bookmark_id', opts.lastBookmark],
    ],
    unpack: Unpack.illustList,
  });

/** Public novel bookmarks by a given user. */
export const userNovelBookmarks = (
  client: Client,
  id: number,
  opts: {
    lastBookmark?: number;
  } = {}
): Promise<Paged<Novel[]>> =>
  endpoint(client, {
    method: 'GET',
    url: 'v1/user/bookmarks/novel',
    params: [
      ['user_id', id],
      ['restrict', 'public'],
      ['max_bookmark_id', opts.lastBookmark],
    ],
    unpack: Unpack.novelList,
  });

/** Bookmark an illustration or a manga. */
export const bookmarkIllust = (
  client: Client,
  id: number,
  opts: {
    restrict?: 'public' | 'private';
    tags?: string[];
  } = {}
): Promise<void> =>
  endpoint(client, {
    method: 'POST',
    url: 'v2/illust/bookmark/add',
    params: [
      ['illust_id', id],
      ['restrict', opts.restrict || 'public'],
      ['tags', opts.tags],
    ],
    unpack: Unpack.nothing,
  });

/** Unbookmark an illustration or a manga. */
export const unbookmarkIllust = (client: Client, id: number): Promise<void> =>
  endpoint(client, {
    method: 'POST',
    url: 'v1/illust/bookmark/delete',
    params: [['illust_id', id]],
    unpack: Unpack.nothing,
  });

/** Bookmark a novel. */
export const bookmarkNovel = (
  client: Client,
  id: number,
  opts: {
    restrict?: 'public' | 'private';
    tags?: string[];
  } = {}
): Promise<void> =>
  endpoint(client, {
    method: 'POST',
    url: 'v2/novel/bookmark/add',
    params: [
      ['novel_id', id],
      ['restrict', opts.restrict || 'public'],
      ['tags', opts.tags],
    ],
    unpack: Unpack.nothing,
  });

/** Unbookmark a novel. */
export const unbookmarkNovel = (client: Client, id: number): Promise<void> =>
  endpoint(client, {
    method: 'POST',
    url: 'v1/novel/bookmark/delete',
    params: [['novel_id', id]],
    unpack: Unpack.nothing,
  });

/** Follow a user. */
export const follow = (
  client: Client,
  id: number,
  opts: {
    restrict?: 'public' | 'private';
  } = {}
): Promise<void> =>
  endpoint(client, {
    method: 'POST',
    url: 'v1/user/follow/add',
    //prettier-ignore
    params: [
      ['user_id', id],
      ['restrict', opts.restrict || 'public']
    ],
    unpack: Unpack.nothing,
  });

/** Unfollow a user. */
export const unfollow = (client: Client, id: number): Promise<void> =>
  endpoint(client, {
    method: 'POST',
    url: 'v1/user/follow/delete',
    params: [['user_id', id]],
    unpack: Unpack.nothing,
  });
