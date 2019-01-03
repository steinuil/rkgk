import * as E from '../../src/api/Endpoints';
import * as fs from 'fs';
import { Client, Options } from '../../src/api/Client';

const readFile = (name: string): Promise<string> =>
  new Promise((resolve, reject) => {
    fs.readFile(name, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });

class MockClient extends Client {
  constructor() {
    super(
      {
        state: 'password',
        username: '',
        password: '',
      },
      { api: '', auth: '' }
    );
  }

  request = async <T>(opts: Options): Promise<T> => {
    const fname =
      __dirname + '\\..\\sample\\' + opts.url.replace(/\//g, '_') + '.json';
    const f = JSON.parse(await readFile(fname));
    return f;
  };

  forceRefresh = () => {
    return Promise.resolve();
  };
}

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
  const data = await endpoint(new MockClient());
  expect(data).toHaveProperty('curr');
  expect(data).toHaveProperty('nextPage');
});

test.each([
  // ['autoComplete', E.autoComplete],
  ['relatedUsers', E.relatedUsers],
])('unpack %s', async (_, endpoint) => {
  expect.assertions(1);
  const data = await endpoint(new MockClient());
  expect(data.length).toBeGreaterThan(1);
});

test.each([
  // ['searchPopularIllusts', E.searchPopularIllusts],
  // ['searchPopularNovels', E.searchPopularNovels],
])('unpack %s', async (_, endpoint) => {
  expect.assertions(1);
  const data = await endpoint(new MockClient());
  expect(data).toHaveProperty('id');
});
