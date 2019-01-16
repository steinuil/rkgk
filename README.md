# rkgk

A typed Pixiv browser.

## Development

rkgk depends on these:

- [yarn](https://yarnpkg.com/lang/en/) or [npm](https://www.npmjs.com/)
- [Go](https://golang.org/)

To install and run (replace `yarn` with `npm` as needed):

```shell
yarn        # install dependencies
yarn bundle # compile and bundle
yarn start  # compile and start proxy server at localhost:9292
```

Then navigate to `localhost:9292` on your browser.

Other useful scripts for development:

```shell
yarn ts     # typecheck only
yarn test   # run tests
yarn doc    # generate documentation
yarn lint   # run linter
```

#### Dumping API responses

To save samples of API responses for testing, invoke the proxy with `-dump-dir <dir>`:

```shell
mkdir _dump
yarn start -dump-dir _dump
```

The responses will be saved in gzip.

# Related projects

- [PixivDeck](https://github.com/akameco/PixivDeck) - desktop client using Electron, very similar to rkgk (except it's actually finished). It has a TweetDeck-like UI, which I don't care much for. Uses [pixiv-app-api](https://github.com/akameco/pixiv-app-api).
- [PxView](https://github.com/alphasp/pxview) - mobile client using React Native. Uses [pixiv-api-client](https://github.com/alphasp/pixiv-api-client).
- [Patchouli](https://github.com/FlandreDaisuki/Patchouli) - Tampermonkey script to enhance Pixiv browsing
- [cockpit for pixiv](https://8th713.github.io/cockpit-for-pixiv/)

## API wrappers

- [pixiv-app-api](https://github.com/akameco/pixiv-app-api) - JS
- [pixiv-api-client](https://github.com/alphasp/pixiv-api-client) - JS
- [pixivpy](https://github.com/upbit/pixivpy) - Python
- [PyPixiv](https://github.com/Yukariin/PyPixiv) - Python
- [Sagitta](https://github.com/mika-f/Sagitta) - C#
- [PixivAppAPI](https://github.com/kokororin/pixiv-api-php) - PHP, not very comprehensive but well documented params
- [pixiv-cookie](https://github.com/kokororin/pixiv-cookie) - JS (cookie)
