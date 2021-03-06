import * as E from '../../src/api/Endpoints';
import { SampleClient } from './SampleClient';

test.each([
  ['globalFeed', E.globalFeed],
  ['globalNovelFeed', E.globalNovelFeed],
  ['myFeed', E.myFeed],
  ['myNovelFeed', E.myNovelFeed],
  ['myLiveFeed', E.myLiveFeed],
  ['myPixivFeed', E.myPixivFeed],
  ['myPixivNovelFeed', E.myPixivNovelFeed],
  ['popularLiveFeeds', E.popularLiveFeeds],
  ['rankingIllusts', E.rankingIllusts],
  ['rankingManga', E.rankingManga],
  ['rankingNovels', E.rankingNovels],
  // ['recommendedIllusts', E.recommendedIllusts],
  ['recommendedManga', E.recommendedManga],
  ['relatedIllusts', E.relatedIllusts],
  ['searchIllusts', E.searchIllusts],
  ['searchNovels', E.searchNovels],
  ['searchUsers', E.searchUsers],
  ['userIllusts', E.userIllusts],
  // ['userNovels', E.userNovels],
  ['userIllustBookmarks', E.userIllustBookmarks],
  ['userNovelBookmarks', E.userNovelBookmarks],
])('unpack %s', async (_, endpoint) => {
  expect.assertions(2);
  const data = await endpoint(SampleClient);
  expect(data).toHaveProperty('curr');
  expect(data).toHaveProperty('nextPage');
});

test.each([
  // prettier-ignore
  ['autoComplete', E.autoComplete],
  ['relatedUsers', E.relatedUsers],
])('unpack %s', async (_, endpoint) => {
  expect.assertions(1);
  const data = await endpoint(SampleClient);
  expect(data.length).toBeGreaterThan(1);
});

test.each([
  ['searchPopularIllusts', E.searchPopularIllusts],
  ['searchPopularNovels', E.searchPopularNovels],
])('unpack %s', async (_, endpoint) => {
  expect.assertions(2);
  const data = await endpoint(SampleClient);
  expect(data.length).toBeGreaterThan(1);
  expect(data[0]).toHaveProperty('id');
});

test.each([
  ['trendingTags', E.trendingTags],
  ['trendingNovelTags', E.trendingNovelTags],
])('unpack %s', async (_, endpoint) => {
  expect.assertions(2);
  const data = await endpoint(SampleClient);
  expect(data.length).toBeGreaterThan(1);
  expect(data[0][1]).toHaveProperty('id');
});
