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

/** Pixiv API client that reads data from the samples directory */
export const SampleClient: Client = {
  request: async <T>(opts: Options): Promise<T> => {
    const fname =
      __dirname + '\\..\\sample\\' + opts.url.replace(/\//g, '_') + '.json';
    const f = JSON.parse(await readFile(fname));
    return f;
  },
};
