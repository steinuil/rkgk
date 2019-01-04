/** @summary Turn raw API responses into objects we can work with. */

/** @ignore */
import { Illust, Novel, Live, UserPreview, Paged } from './Items';
import * as Cooked from './Cooked';
import * as Raw from './Raw';

export const illustList = (resp: Raw.IllustList): Paged<Illust[]> => ({
  curr: resp.illusts.map(Cooked.illust),
  nextPage: null,
});

export const novelList = (resp: Raw.NovelList): Paged<Novel[]> => ({
  curr: resp.novels.map(Cooked.novel),
  nextPage: null,
});

export const liveList = (resp: Raw.LiveList): Paged<Live[]> => ({
  curr: resp.lives.map(Cooked.live),
  nextPage: null,
});

export const userPreviews = (resp: Raw.UserPreviews): Paged<UserPreview[]> => ({
  curr: resp.user_previews.map(Cooked.userPreview),
  nextPage: null,
});

export const userPreviewsNoPaged = (resp: Raw.UserPreviews): UserPreview[] =>
  resp.user_previews.map(Cooked.userPreview);

export const popularIllusts = (resp: Raw.PopularIllusts): Illust[] =>
  resp.illusts.map(Cooked.illust);

export const popularNovels = (resp: Raw.PopularNovels): Novel[] =>
  resp.novels.map(Cooked.novel);

export const trendingTags = (resp: Raw.TrendingTags): Array<[string, Illust]> =>
  resp.trend_tags.map(
    (t): [string, Illust] => [t.tag, Cooked.illust(t.illust)]
  );

export const nothing = (_: unknown) => {};
